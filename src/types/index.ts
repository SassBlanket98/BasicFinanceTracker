export type TransactionType = 'income' | 'expense';
export type TimePeriod = 'daily' | 'weekly' | 'monthly';
export * from './types';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string; // References Category id
  type: TransactionType;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: TimePeriod;
};

export type Account = {
  id: string;
  name: string;
  balance: number;
};

// New types for the PieChart and report functionality
export type CategoryWithFullData = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

export type CategorySpending = {
  category: CategoryWithFullData;
  amount: number;
  percentage: number;
};

// Component Props interfaces
export interface PieChartProps {
  data: CategorySpending[];
  size?: number;
}

export interface ReportScreenProps {
  // Add any props needed for the ReportScreen component
}

export interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  accounts: Account[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  setBudget: (budget: Omit<Budget, 'id'>) => void;
  updateAccount: (accountId: string, amount: number) => void;
}
