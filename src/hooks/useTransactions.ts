import {useContext, useMemo, useCallback} from 'react';
import {FinanceContext} from '../context/FinanceContext';
import {
  TimePeriod,
  TransactionType,
  CategorySpending,
  CategoryWithFullData,
  BudgetProgress,
  Transaction,
  Category,
} from '../types';

// Helper function to convert category string ID to full category object
const mapCategoryToFullData = (
  categoryId: string,
  categories: Category[],
): CategoryWithFullData => {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) {
    // Fallback for when category is not found
    return {
      id: 'unknown',
      name: 'Uncategorized',
      icon: 'help-circle',
      color: '#999999',
      type: 'expense' as TransactionType,
    };
  }

  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type as TransactionType,
  };
};

export const useTransactions = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }

  const {transactions, categories, budgets} = context;

  // Filter transactions by period - memoized for performance
  const filterByPeriod = useCallback(
    (
      period: TimePeriod,
      startDate?: Date,
      transactionsToFilter: Transaction[] = transactions,
    ) => {
      const now = startDate || new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return transactionsToFilter.filter(transaction => {
        const transactionDate = new Date(transaction.date);

        switch (period) {
          case 'daily':
            return (
              transactionDate.getDate() === today.getDate() &&
              transactionDate.getMonth() === today.getMonth() &&
              transactionDate.getFullYear() === today.getFullYear()
            );
          case 'weekly':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay()); // Go to Sunday

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // Go to Saturday
            weekEnd.setHours(23, 59, 59, 999);

            return transactionDate >= weekStart && transactionDate <= weekEnd;
          case 'monthly':
            return (
              transactionDate.getMonth() === today.getMonth() &&
              transactionDate.getFullYear() === today.getFullYear()
            );
          default:
            return true;
        }
      });
    },
    [transactions],
  );

  // Get total income for a period
  const getIncome = useCallback(
    (period: TimePeriod, startDate?: Date): number => {
      return filterByPeriod(period, startDate)
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    [filterByPeriod],
  );

  // Get total expenses for a period
  const getExpenses = useCallback(
    (period: TimePeriod, startDate?: Date): number => {
      return filterByPeriod(period, startDate)
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    [filterByPeriod],
  );

  // Get spending by category with memoization
  const getCategorySpending = useCallback(
    (
      type: TransactionType,
      period: TimePeriod,
      startDate?: Date,
    ): CategorySpending[] => {
      const filteredTransactions = filterByPeriod(period, startDate).filter(
        transaction => transaction.type === type,
      );

      // Group transactions by category
      const categoryMap = new Map<string, number>();

      filteredTransactions.forEach(transaction => {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
      });

      // Calculate total for percentages
      const total = Array.from(categoryMap.values()).reduce(
        (sum, amount) => sum + amount,
        0,
      );

      // Create result array
      const result: CategorySpending[] = Array.from(categoryMap).map(
        ([categoryId, amount]) => {
          return {
            category: mapCategoryToFullData(categoryId, categories),
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
          };
        },
      );

      // Sort by amount descending
      return result.sort((a, b) => b.amount - a.amount);
    },
    [filterByPeriod, categories],
  );

  // Get category by ID - memoized with key-based lookup for better performance
  const categoryById = useMemo(() => {
    const categoryMap = new Map<string, Category | null>();

    categories.forEach(category => {
      categoryMap.set(category.id, category);
    });

    return categoryMap;
  }, [categories]);

  const getCategoryById = useCallback(
    (categoryId: string): Category | null => {
      return categoryById.get(categoryId) || null;
    },
    [categoryById],
  );

  // Get all transactions grouped by date
  const getTransactionsByDate = useCallback(() => {
    // Group transactions by date
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0]; // Get YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);

  // Get transactions with pagination
  const getTransactionsByPage = useCallback(
    (page: number, limit: number = 20) => {
      const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      const startIndex = (page - 1) * limit;
      return sortedTransactions.slice(startIndex, startIndex + limit);
    },
    [transactions],
  );

  // Get recent transactions - memoized
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [transactions]);

  // Get current balance - memoized
  const getCurrentBalance = useCallback((): number => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  }, [transactions]);

  // Calculate budget progress for all budget items - memoized
  const getBudgetProgress = useCallback((): BudgetProgress[] => {
    return budgets
      .map(budget => {
        const category = getCategoryById(budget.categoryId);
        if (!category) {
          return null;
        }

        // Filter transactions by period and category
        const filteredTransactions = filterByPeriod(budget.period).filter(
          t => t.category === budget.categoryId && t.type === 'expense',
        );

        // Calculate amount spent
        const spent = filteredTransactions.reduce(
          (sum, t) => sum + t.amount,
          0,
        );

        // Calculate remaining budget
        const remaining = budget.amount - spent;

        // Calculate percentage of budget used
        const percentage =
          budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          budget,
          category,
          spent,
          remaining,
          percentage,
        };
      })
      .filter((item): item is BudgetProgress => item !== null);
  }, [budgets, getCategoryById, filterByPeriod]);

  // Get transactions for a specific category
  const getTransactionsByCategory = useCallback(
    (categoryId: string, period: TimePeriod = 'monthly'): Transaction[] => {
      return filterByPeriod(period).filter(
        transaction => transaction.category === categoryId,
      );
    },
    [filterByPeriod],
  );

  // Get transactions for a specific date range
  const getTransactionsByDateRange = useCallback(
    (startDate: Date, endDate: Date): Transaction[] => {
      return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    },
    [transactions],
  );

  // Get transactions grouped by month
  const getTransactionsByMonth = useCallback((): Record<
    string,
    Transaction[]
  > => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }

      groups[monthKey].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);

  // Calculate spending trends - compare current period to previous period
  const getSpendingTrend = useCallback(
    (period: TimePeriod): number => {
      // Get current period data
      const currentPeriodTransactions = filterByPeriod(period);
      const currentExpenses = currentPeriodTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate date for previous period
      const now = new Date();
      let previousPeriodStart: Date;
      let previousPeriodEnd: Date;

      switch (period) {
        case 'daily':
          previousPeriodStart = new Date(now);
          previousPeriodStart.setDate(now.getDate() - 1);
          previousPeriodEnd = new Date(previousPeriodStart);
          break;
        case 'weekly':
          previousPeriodStart = new Date(now);
          previousPeriodStart.setDate(now.getDate() - 7);
          previousPeriodEnd = new Date(now);
          previousPeriodEnd.setDate(now.getDate() - 1);
          break;
        case 'monthly':
          previousPeriodStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1,
          );
          previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        default:
          previousPeriodStart = new Date(now);
          previousPeriodEnd = new Date(now);
      }

      // Get transactions from previous period
      const previousPeriodTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate >= previousPeriodStart &&
          transactionDate <= previousPeriodEnd
        );
      });

      // Calculate previous period expenses
      const previousExpenses = previousPeriodTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate percentage change
      if (previousExpenses === 0) {
        return 100; // If there were no expenses in the previous period
      }

      return ((currentExpenses - previousExpenses) / previousExpenses) * 100;
    },
    [transactions, filterByPeriod],
  );

  // Get category spending trend over time
  const getCategorySpendingTrend = useCallback(
    (
      categoryId: string,
      period: 'weekly' | 'monthly' | '3months' | '6months' | 'yearly',
    ): {
      labels: string[];
      data: number[];
    } => {
      const now = new Date();
      const timePoints: Date[] = [];
      const labels: string[] = [];

      // Create time points based on the selected period
      if (period === 'weekly') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          timePoints.push(date);
          labels.push(date.toLocaleDateString(undefined, {weekday: 'short'}));
        }
      } else if (period === 'monthly') {
        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i * 7);
          timePoints.push(date);
          labels.push(`Week ${4 - i}`);
        }
      } else if (period === '3months') {
        // Last 3 months
        for (let i = 2; i >= 0; i--) {
          const date = new Date();
          date.setMonth(now.getMonth() - i);
          timePoints.push(date);
          labels.push(date.toLocaleDateString(undefined, {month: 'short'}));
        }
      } else if (period === '6months') {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(now.getMonth() - i);
          timePoints.push(date);
          labels.push(date.toLocaleDateString(undefined, {month: 'short'}));
        }
      } else if (period === 'yearly') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(now.getMonth() - i);
          timePoints.push(date);
          labels.push(date.toLocaleDateString(undefined, {month: 'short'}));
        }
      }

      // Calculate spending for each time point
      const data = timePoints.map(date => {
        // Calculate start and end date for this time point
        let startDate: number | Date, endDate: number | Date;

        if (period === 'weekly') {
          // Daily data points
          startDate = new Date(date);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);
        } else if (period === 'monthly') {
          // Weekly data points
          startDate = new Date(date);
          startDate.setDate(date.getDate() - 7);
          endDate = new Date(date);
        } else {
          // Monthly data points
          startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        }

        // Filter transactions for this category and time period
        const periodTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return (
            t.category === categoryId &&
            t.type === 'expense' &&
            transactionDate >= startDate &&
            transactionDate <= endDate
          );
        });

        // Sum the amounts
        return periodTransactions.reduce((sum, t) => sum + t.amount, 0);
      });

      return {labels, data};
    },
    [transactions],
  );

  // Get top spending categories
  const getTopSpendingCategories = useCallback(
    (period: TimePeriod = 'monthly', limit: number = 5): CategorySpending[] => {
      const categoryData = getCategorySpending('expense', period);
      return categoryData.slice(0, limit);
    },
    [getCategorySpending],
  );

  // Get forecast for upcoming expenses
  const getForecastExpenses = useCallback(
    (daysAhead: number = 30): number => {
      // Calculate average daily expense for the past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentExpenseTransactions = transactions.filter(
        t => new Date(t.date) >= thirtyDaysAgo && t.type === 'expense',
      );

      const totalRecentExpenses = recentExpenseTransactions.reduce(
        (sum, t) => sum + t.amount,
        0,
      );

      const avgDailyExpense = totalRecentExpenses / 30;

      // Add regular budget items
      const monthlyBudgets = budgets.filter(b => b.period === 'monthly');
      const budgetTotal = monthlyBudgets.reduce((sum, b) => sum + b.amount, 0);

      // Project forward
      return avgDailyExpense * daysAhead + (budgetTotal / 30) * daysAhead;
    },
    [transactions, budgets],
  );

  // Get monthly savings rate
  const getSavingsRate = useCallback(
    (period: TimePeriod = 'monthly'): number => {
      const periodIncome = getIncome(period);
      const periodExpenses = getExpenses(period);

      if (periodIncome === 0) {
        return 0;
      }

      return ((periodIncome - periodExpenses) / periodIncome) * 100;
    },
    [getIncome, getExpenses],
  );

  // Get income vs expense comparison data
  const getIncomeExpenseComparison = useCallback(
    (
      timeFrame: 'week' | 'month' | 'year',
    ): Array<{
      label: string;
      income: number;
      expense: number;
      net: number;
    }> => {
      const now = new Date();
      const data: any[] = [];

      if (timeFrame === 'week') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);

          // For a specific day
          const period: TimePeriod = 'daily';
          const dayLabel = date.toLocaleDateString(undefined, {
            weekday: 'short',
          });

          // Get income and expense for this day
          const income = getIncome(period, date);
          const expense = getExpenses(period, date);
          const net = income - expense;

          data.push({
            label: dayLabel,
            income,
            expense,
            net,
          });
        }
      } else if (timeFrame === 'month') {
        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(now.getDate() - i * 7 - now.getDay());

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          const weekLabel = `Week ${4 - i}`;

          // Get income and expense for this week
          const income = getIncome('weekly', weekStart);
          const expense = getExpenses('weekly', weekStart);
          const net = income - expense;

          data.push({
            label: weekLabel,
            income,
            expense,
            net,
          });
        }
      } else if (timeFrame === 'year') {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(now.getMonth() - i);

          const monthLabel = date.toLocaleDateString(undefined, {
            month: 'short',
          });

          // Get income and expense for this month
          const income = getIncome('monthly', date);
          const expense = getExpenses('monthly', date);
          const net = income - expense;

          data.push({
            label: monthLabel,
            income,
            expense,
            net,
          });
        }
      }

      return data;
    },
    [getIncome, getExpenses],
  );

  // Get categories that have no transactions (unused categories)
  const getUnusedCategories = useCallback((): Category[] => {
    const usedCategoryIds = new Set(transactions.map(t => t.category));
    return categories.filter(category => !usedCategoryIds.has(category.id));
  }, [transactions, categories]);

  return {
    transactions,
    getIncome,
    getExpenses,
    getCategorySpending,
    getCategoryById,
    getTransactionsByDate,
    getTransactionsByPage,
    getTransactionsByCategory,
    getTransactionsByDateRange,
    getTransactionsByMonth,
    recentTransactions,
    getCurrentBalance,
    getBudgetProgress,
    getSpendingTrend,
    getCategorySpendingTrend,
    getTopSpendingCategories,
    getForecastExpenses,
    getSavingsRate,
    getIncomeExpenseComparison,
    getUnusedCategories,
  };
};
