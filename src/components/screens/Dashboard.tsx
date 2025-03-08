import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useFinance} from '../../context/FinanceContext';
import {useTransactions} from '../../hooks/useTransactions';
import Card from '../common/Card';
import {formatCurrency} from '../../utils/calculations';

// Define TypeScript interfaces to avoid type errors
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string | number | Date;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface BudgetProgressItem {
  category: Category;
  budget: {
    amount: number;
  };
  spent: number;
  percentage: number;
}

const Dashboard = () => {
  const navigation = useNavigation();
  useFinance();
  const {
    recentTransactions,
    getIncome,
    getExpenses,
    getCurrentBalance,
    getCategoryById,
    getBudgetProgress,
  } = useTransactions();

  // Calculate current month's data
  const monthlyIncome = getIncome('monthly');
  const monthlyExpenses = getExpenses('monthly');
  const currentBalance = getCurrentBalance();
  const budgetProgress = getBudgetProgress() as BudgetProgressItem[];

  const navigateToAddTransaction = () => {
    // @ts-ignore - Navigation type issues
    navigation.navigate('AddTransaction');
  };

  const navigateToTransactionHistory = () => {
    // @ts-ignore - Navigation type issues
    navigation.navigate('TransactionHistory');
  };

  const navigateToBudget = () => {
    // @ts-ignore - Navigation type issues
    navigation.navigate('Budget');
  };

  const navigateToReports = () => {
    // @ts-ignore - Navigation type issues
    navigation.navigate('Reports');
  };

  // Render a transaction item with proper type safety
  const renderTransactionItem = ({item}: {item: Transaction | null}) => {
    // Add null check to avoid TypeScript errors
    if (!item) {
      return null;
    }

    const category = getCategoryById(item.category);
    const isIncome = item.type === 'income';

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => {
          // @ts-ignore - Navigation type issues
          navigation.navigate('AddTransaction', {transaction: item});
        }}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.categoryDot,
              {backgroundColor: category?.color || '#CCCCCC'},
            ]}
          />
          <View>
            <Text style={styles.transactionDescription}>
              {item.description || category?.name || 'Unknown'}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            isIncome ? styles.incomeText : styles.expenseText,
          ]}>
          {isIncome ? '+' : '-'} ${formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <TouchableOpacity onPress={navigateToAddTransaction}>
          <View style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Balance Section */}
      <Card style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Current Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>
          ${formatCurrency(currentBalance)}
        </Text>
        <View style={styles.incomeExpenseRow}>
          <View style={styles.incomeContainer}>
            <Text style={styles.incomeExpenseLabel}>Income</Text>
            <Text style={styles.incomeText}>
              +${formatCurrency(monthlyIncome)}
            </Text>
          </View>
          <View style={styles.expenseContainer}>
            <Text style={styles.incomeExpenseLabel}>Expenses</Text>
            <Text style={styles.expenseText}>
              -${formatCurrency(monthlyExpenses)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToTransactionHistory}>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToBudget}>
          <Text style={styles.actionText}>Budget</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToReports}>
          <Text style={styles.actionText}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <Card title="Budget Progress">
          {budgetProgress.slice(0, 3).map(
            (item, index) =>
              // Add null check with optional chaining to avoid TypeScript errors
              item && (
                <View key={index} style={styles.budgetItem}>
                  <View style={styles.budgetItemHeader}>
                    <View style={styles.budgetCategory}>
                      <View
                        style={[
                          styles.categoryDot,
                          {backgroundColor: item.category?.color || '#CCCCCC'},
                        ]}
                      />
                      <Text style={styles.budgetCategoryName}>
                        {item.category?.name || 'Unknown Category'}
                      </Text>
                    </View>
                    <Text style={styles.budgetAmount}>
                      ${formatCurrency(item.spent)} / $
                      {formatCurrency(item.budget?.amount || 0)}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {width: `${item.percentage || 0}%`},
                        (item.percentage || 0) >= 100 &&
                          styles.progressBarExceeded,
                      ]}
                    />
                  </View>
                </View>
              ),
          )}
          {budgetProgress.length > 3 && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={navigateToBudget}>
              <Text style={styles.viewMoreText}>View All Budgets</Text>
            </TouchableOpacity>
          )}
        </Card>
      )}

      {/* Recent Transactions */}
      <Card
        title="Recent Transactions"
        titleRight={
          <TouchableOpacity onPress={navigateToTransactionHistory}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        }>
        {recentTransactions.length > 0 ? (
          <FlatList
            data={recentTransactions.slice(0, 5)}
            renderItem={renderTransactionItem}
            keyExtractor={item => item?.id || Math.random().toString()}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noTransactionsText}>
            No transactions yet. Tap "+" to add one.
          </Text>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: '#3A86FF',
    marginBottom: 24,
  },
  balanceHeader: {
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incomeContainer: {
    flex: 1,
  },
  expenseContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  incomeExpenseLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CD964',
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  budgetCategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CD964',
    borderRadius: 3,
  },
  progressBarExceeded: {
    backgroundColor: '#FF3B30',
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007BFF',
  },
  noTransactionsText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 16,
  },
});

export default Dashboard;
