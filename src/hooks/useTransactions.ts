import {useContext} from 'react';
import {FinanceContext} from '../context/FinanceContext';
import {
  TimePeriod,
  TransactionType,
  CategorySpending,
  CategoryWithFullData,
  BudgetProgress,
} from '../types';

// Helper function to convert category string ID to full category object
const mapCategoryToFullData = (
  categoryId: string,
  categories: any[],
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
    throw new Error('FinanceContext is not provided');
  }
  const {transactions, categories, budgets} = context;

  // Filter transactions by period
  const filterByPeriod = (period: TimePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter(transaction => {
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
          weekStart.setDate(today.getDate() - today.getDay());
          return transactionDate >= weekStart;
        case 'monthly':
          return (
            transactionDate.getMonth() === today.getMonth() &&
            transactionDate.getFullYear() === today.getFullYear()
          );
        default:
          return true;
      }
    });
  };

  // Get total income for a period
  const getIncome = (period: TimePeriod): number => {
    return filterByPeriod(period)
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  // Get total expenses for a period
  const getExpenses = (period: TimePeriod): number => {
    return filterByPeriod(period)
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  // Get spending by category
  const getCategorySpending = (
    type: TransactionType,
    period: TimePeriod,
  ): CategorySpending[] => {
    const filteredTransactions = filterByPeriod(period).filter(
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
          percentage: (amount / total) * 100,
        };
      },
    );

    // Sort by amount descending
    return result.sort((a, b) => b.amount - a.amount);
  };

  // Get category by ID
  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || null;
  };

  // Get all transactions grouped by date
  const getTransactionsByDate = () => {
    // Group transactions by date
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0]; // Get YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, typeof transactions>);
  };

  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get current balance
  const getCurrentBalance = (): number => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  };

  // Calculate budget progress for all budget items
  const getBudgetProgress = (): BudgetProgress[] => {
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
        const percentage = (spent / budget.amount) * 100;

        return {
          budget,
          category,
          spent,
          remaining,
          percentage,
        };
      })
      .filter((item): item is BudgetProgress => item !== null);
  };

  return {
    getIncome,
    getExpenses,
    getCategorySpending,
    getCategoryById,
    getTransactionsByDate,
    recentTransactions,
    getCurrentBalance,
    getBudgetProgress,
  };
};
