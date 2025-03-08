// types.ts
export type TransactionType = 'income' | 'expense';
export type TimePeriod = 'daily' | 'weekly' | 'monthly';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string; // References Category id
  type: TransactionType;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: TimePeriod;
}

// Add this interface to your types.ts file
export interface BudgetProgress {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

// New types for the PieChart and report functionality
export interface CategoryWithFullData {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface CategorySpending {
  category: CategoryWithFullData;
  amount: number;
  percentage: number;
}

// Budget progress interface
export interface BudgetProgress {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  percentage: number;
}

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
