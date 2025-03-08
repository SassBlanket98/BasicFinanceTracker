import React, {createContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import {
  Transaction,
  Category,
  Budget,
  Account,
  FinanceContextType,
} from '../types';

// Default categories
const defaultCategories: Category[] = [
  {id: '1', name: 'Food', icon: 'food', color: '#FF5733', type: 'expense'},
  {id: '2', name: 'Transport', icon: 'car', color: '#3498DB', type: 'expense'},
  {id: '3', name: 'Housing', icon: 'home', color: '#2ECC71', type: 'expense'},
  {
    id: '4',
    name: 'Entertainment',
    icon: 'movie',
    color: '#9B59B6',
    type: 'expense',
  },
  {
    id: '5',
    name: 'Healthcare',
    icon: 'medical',
    color: '#E74C3C',
    type: 'expense',
  },
  {
    id: '6',
    name: 'Utilities',
    icon: 'flash',
    color: '#F39C12',
    type: 'expense',
  },
  {id: '7', name: 'Salary', icon: 'cash', color: '#27AE60', type: 'income'},
  {
    id: '8',
    name: 'Investment',
    icon: 'trending-up',
    color: '#16A085',
    type: 'income',
  },
  {id: '9', name: 'Gifts', icon: 'gift', color: '#8E44AD', type: 'income'},
];

// Default account
const defaultAccount: Account = {
  id: '1',
  name: 'Main Account',
  balance: 0,
};

export const FinanceContext = createContext<FinanceContextType | null>(null);

type FinanceProviderProps = {
  children: ReactNode;
};

export const FinanceProvider: React.FC<FinanceProviderProps> = ({children}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([defaultAccount]);

  // Load data from AsyncStorage on initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem('transactions');
        const storedCategories = await AsyncStorage.getItem('categories');
        const storedBudgets = await AsyncStorage.getItem('budgets');
        const storedAccounts = await AsyncStorage.getItem('accounts');

        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
        if (storedCategories) setCategories(JSON.parse(storedCategories));
        else
          await AsyncStorage.setItem(
            'categories',
            JSON.stringify(defaultCategories),
          );
        if (storedBudgets) setBudgets(JSON.parse(storedBudgets));
        if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
        else
          await AsyncStorage.setItem(
            'accounts',
            JSON.stringify([defaultAccount]),
          );
      } catch (error) {
        console.error('Error loading data', error);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(
          'transactions',
          JSON.stringify(transactions),
        );
        await AsyncStorage.setItem('categories', JSON.stringify(categories));
        await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
        await AsyncStorage.setItem('accounts', JSON.stringify(accounts));
      } catch (error) {
        console.error('Error saving data', error);
      }
    };

    saveData();
  }, [transactions, categories, budgets, accounts]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: uuid.v4().toString(), // Change here
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Update account balance
    updateAccount(
      accounts[0].id,
      transaction.type === 'income' ? transaction.amount : -transaction.amount,
    );
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTransactions(prev => prev.filter(t => t.id !== id));

      // Update account balance (reverse the original transaction)
      updateAccount(
        accounts[0].id,
        transaction.type === 'income'
          ? -transaction.amount
          : transaction.amount,
      );
    }
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: uuid.v4().toString(), // Change here
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const setBudget = (budget: Omit<Budget, 'id'>) => {
    // Check if a budget for this category already exists
    const existingBudgetIndex = budgets.findIndex(
      b => b.categoryId === budget.categoryId,
    );

    if (existingBudgetIndex >= 0) {
      // Update existing budget
      const updatedBudgets = [...budgets];
      updatedBudgets[existingBudgetIndex] = {
        ...updatedBudgets[existingBudgetIndex],
        amount: budget.amount,
        period: budget.period,
      };
      setBudgets(updatedBudgets);
    } else {
      // Add new budget
      const newBudget = {
        ...budget,
        id: uuid.v4().toString(), // Change here
      };
      setBudgets(prev => [...prev, newBudget]);
    }
  };

  const updateAccount = (accountId: string, amount: number) => {
    setAccounts(prev =>
      prev.map(account =>
        account.id === accountId
          ? {...account, balance: account.balance + amount}
          : account,
      ),
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        accounts,
        addTransaction,
        deleteTransaction,
        addCategory,
        setBudget,
        updateAccount,
      }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = React.useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
