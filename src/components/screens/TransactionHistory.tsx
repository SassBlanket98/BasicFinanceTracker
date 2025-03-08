import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTransactions} from '../../hooks/useTransactions';
import {formatCurrency} from '../../utils/calculations';
import {Transaction} from '../../types';

// Define an interface for the section data
interface TransactionSection {
  date: string;
  dayTotal: number;
  data: Transaction[];
}

// Define the type for renderItem
interface RenderItemProps {
  item: Transaction;
  index: number;
  section: TransactionSection;
}

// Define the type for renderSectionHeader
interface RenderSectionProps {
  section: TransactionSection;
}

const TransactionHistory = () => {
  const navigation = useNavigation();
  const {getTransactionsByDate, getCategoryById} = useTransactions();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Get transactions grouped by date
  const transactionsByDate = getTransactionsByDate();

  // Convert to section list data
  const sections = Object.entries(transactionsByDate)
    .map(([date, transactions]) => {
      // Filter transactions if needed
      const filteredTransactions =
        filter === 'all'
          ? transactions
          : transactions.filter(t => t.type === filter);

      if (filteredTransactions.length === 0) {
        return null;
      }

      // Calculate total for the day
      const dayTotal = filteredTransactions.reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 0);

      return {
        date,
        dayTotal,
        data: filteredTransactions,
      };
    })
    .filter((section): section is TransactionSection => section !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleTransactionPress = (transaction: Transaction) => {
    // @ts-ignore - Navigation type issues
    navigation.navigate('AddTransaction', {transaction});
  };

  const renderTransactionItem = ({item}: RenderItemProps) => {
    const category = getCategoryById(item.category);
    const isIncome = item.type === 'income';

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}>
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
            <Text style={styles.categoryName}>{category?.name}</Text>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            isIncome ? styles.incomeText : styles.expenseText,
          ]}>
          {isIncome ? '+' : '-'} R{formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({section}: RenderSectionProps) => (
    <View style={styles.sectionHeader}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {new Date(section.date).toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
      <Text
        style={[
          styles.dayTotalText,
          section.dayTotal >= 0 ? styles.incomeText : styles.expenseText,
        ]}>
        {section.dayTotal >= 0 ? '+' : ''} R{formatCurrency(section.dayTotal)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText,
            ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'income' && styles.activeFilter,
          ]}
          onPress={() => setFilter('income')}>
          <Text
            style={[
              styles.filterText,
              filter === 'income' && styles.activeFilterText,
            ]}>
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'expense' && styles.activeFilter,
          ]}
          onPress={() => setFilter('expense')}>
          <Text
            style={[
              styles.filterText,
              filter === 'expense' && styles.activeFilterText,
            ]}>
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {sections.length > 0 ? (
        <SectionList<Transaction, TransactionSection>
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderTransactionItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              // @ts-ignore - Navigation type issues
              navigation.navigate('AddTransaction');
            }}>
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activeFilter: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F7F9FC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayTotalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryName: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomeText: {
    color: '#4CD964',
  },
  expenseText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TransactionHistory;
