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
  date: string; // References Category id
  category: string;
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

// Component Props interfaces
export interface PieChartProps {
  data: CategorySpending[];
  size?: number;
}

export interface ReportScreenProps {
  // Add any props needed for the ReportScreen component
}

// New types for enhanced visualizations
export interface SpendingTrendChartProps {
  period?: 'weekly' | 'monthly' | '3months' | '6months' | 'yearly';
  selectedCategories?: string[]; // Array of category IDs
}

export interface IncomeExpenseChartProps {
  timeFrame?: 'week' | 'month' | 'year';
  showNet?: boolean; // Option to show net (income - expense)
}

export interface TrendDataPoint {
  x: number;
  y: number;
  value: number;
}

export interface TrendCategoryData {
  label: string;
  color: string;
  data: TrendDataPoint[];
}

export interface IncomeExpenseData {
  label: string;
  income: number;
  expense: number;
  net: number;
}

// Monthly summary specific types
export interface MonthlyInsight {
  type: 'alert' | 'info' | 'success';
  title: string;
  message: string;
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
  deleteBudget: (id: string) => void;
}
