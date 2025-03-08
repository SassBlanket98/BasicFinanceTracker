import {Transaction, Budget, Category} from '../types';

// Get total of income or expense transactions
export const getTotal = (
  transactions: Transaction[],
  type: 'income' | 'expense',
): number => {
  return transactions
    .filter(t => t.type === type)
    .reduce((acc, transaction) => acc + transaction.amount, 0);
};

// Get balance (income - expense)
export const getBalance = (transactions: Transaction[]): number => {
  const income = getTotal(transactions, 'income');
  const expense = getTotal(transactions, 'expense');
  return income - expense;
};

// Get transactions for a specific category
export const getTransactionsByCategory = (
  transactions: Transaction[],
  categoryId: string,
): Transaction[] => {
  return transactions.filter(t => t.category === categoryId);
};

// Calculate spent amount by category
export const getSpentByCategory = (
  transactions: Transaction[],
  categoryId: string,
): number => {
  return getTransactionsByCategory(transactions, categoryId).reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  );
};

// Calculate budget remaining
export const getBudgetRemaining = (
  transactions: Transaction[],
  budget: Budget,
): number => {
  const spent = getSpentByCategory(
    filterTransactionsByPeriod(transactions, budget.period),
    budget.categoryId,
  );
  return budget.amount - spent;
};

// Filter transactions by time period
export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: 'daily' | 'weekly' | 'monthly',
): Transaction[] => {
  const now = new Date();

  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);

    switch (period) {
      case 'daily':
        return (
          transactionDate.getDate() === now.getDate() &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      case 'weekly':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return transactionDate >= oneWeekAgo;
      case 'monthly':
        return (
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      default:
        return true;
    }
  });
};

// Calculate category spending distribution
export const getCategoryDistribution = (
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense',
): {category: Category; amount: number; percentage: number}[] => {
  // Filter transactions by type
  const filteredTransactions = transactions.filter(t => t.type === type);
  const total = getTotal(filteredTransactions, type);

  if (total === 0) return [];

  // Get categories of the specified type
  const typeCategories = categories.filter(c => c.type === type);

  return typeCategories
    .map(category => {
      const amount = getSpentByCategory(filteredTransactions, category.id);
      return {
        category,
        amount,
        percentage: (amount / total) * 100,
      };
    })
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

// Format currency to local string with 2 decimal places
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Group transactions by date
export const groupTransactionsByDate = (
  transactions: Transaction[],
): {[date: string]: Transaction[]} => {
  return transactions.reduce((acc, transaction) => {
    const date = transaction.date.split('T')[0]; // Get YYYY-MM-DD part
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as {[date: string]: Transaction[]});
};
