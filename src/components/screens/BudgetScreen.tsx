import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useFinance} from '../../context/FinanceContext';
import {useTransactions} from '../../hooks/useTransactions';
import Card from '../common/Card';
import Input from '../common/input';
import Button from '../common/Button';
import CategoryPicker from '../common/CategoryPicker';
import {Budget, Category} from '../../types';
import {formatCurrency} from '../../utils/calculations';

const BudgetScreen = () => {
  const {budgets, setBudget} = useFinance();
  const {getBudgetProgress} = useTransactions();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<
    'daily' | 'weekly' | 'monthly'
  >('monthly');
  const [error, setError] = useState('');

  // Get current budget progress
  const budgetProgress = getBudgetProgress();

  const handleAddBudget = () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Generate a unique ID for the new budget
    const newBudget: Budget = {
      id: selectedCategory + '-' + budgetPeriod, // Create a unique ID based on category and period
      categoryId: selectedCategory,
      amount,
      period: budgetPeriod,
    };

    setBudget(newBudget);

    // Reset form
    setSelectedCategory(null);
    setBudgetAmount('');
    setModalVisible(false);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.id);

    // Check if this category already has a budget and pre-fill if it does
    const existingBudget = budgets.find(b => b.categoryId === category.id);
    if (existingBudget) {
      setBudgetAmount(existingBudget.amount.toString());
      setBudgetPeriod(existingBudget.period);
    } else {
      setBudgetAmount('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Budget</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {budgetProgress.length > 0 ? (
          budgetProgress.map((item, index) => {
            // Skip rendering if item or its required properties are null/undefined
            if (!item || !item.category || !item.budget) {
              return null;
            }

            return (
              <Card key={index} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.categoryContainer}>
                    <View
                      style={[
                        styles.categoryDot,
                        {backgroundColor: item.category.color || '#ccc'},
                      ]}
                    />
                    <Text style={styles.categoryName}>
                      {item.category.name || 'Unknown'}
                    </Text>
                  </View>
                  <Text style={styles.periodText}>
                    {item.budget.period || 'monthly'}
                  </Text>
                </View>

                <View style={styles.budgetDetails}>
                  <View style={styles.amountContainer}>
                    <Text style={styles.spentText}>
                      R{formatCurrency(item.spent || 0)}
                    </Text>
                    <Text style={styles.limitText}>
                      of R{formatCurrency(item.budget.amount || 0)}
                    </Text>
                  </View>

                  <View style={styles.remainingContainer}>
                    <Text style={styles.remainingLabel}>Remaining:</Text>
                    <Text
                      style={[
                        styles.remainingAmount,
                        (item.remaining || 0) < 0 && styles.overBudgetText,
                      ]}>
                      R{formatCurrency(Math.abs(item.remaining || 0))}
                      {(item.remaining || 0) < 0 ? ' over' : ''}
                    </Text>
                  </View>
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

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    if (item.budget) {
                      setSelectedCategory(item.budget.categoryId);
                      setBudgetAmount(item.budget.amount.toString());
                      setBudgetPeriod(item.budget.period);
                      setModalVisible(true);
                    }
                  }}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No budgets yet. Tap "Add Budget" to create one.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedCategory ? 'Edit Budget' : 'Add Budget'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <CategoryPicker
                selectedCategoryId={selectedCategory}
                onSelectCategory={handleCategorySelect}
                transactionType="expense"
                label="Select Budget Category"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Input
                label="Budget Amount"
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                placeholder="0.00"
                keyboardType="numeric"
                prefix="R"
                error=""
              />

              <Text style={styles.sectionTitle}>Budget Period</Text>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    budgetPeriod === 'daily' && styles.activePeriodButton,
                  ]}
                  onPress={() => setBudgetPeriod('daily')}>
                  <Text
                    style={[
                      styles.periodButtonText,
                      budgetPeriod === 'daily' && styles.activePeriodButtonText,
                    ]}>
                    Daily
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    budgetPeriod === 'weekly' && styles.activePeriodButton,
                  ]}
                  onPress={() => setBudgetPeriod('weekly')}>
                  <Text
                    style={[
                      styles.periodButtonText,
                      budgetPeriod === 'weekly' &&
                        styles.activePeriodButtonText,
                    ]}>
                    Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    budgetPeriod === 'monthly' && styles.activePeriodButton,
                  ]}
                  onPress={() => setBudgetPeriod('monthly')}>
                  <Text
                    style={[
                      styles.periodButtonText,
                      budgetPeriod === 'monthly' &&
                        styles.activePeriodButtonText,
                    ]}>
                    Monthly
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Save Budget"
                onPress={handleAddBudget}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  budgetCard: {
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  limitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  remainingContainer: {
    alignItems: 'flex-end',
  },
  remainingLabel: {
    fontSize: 12,
    color: '#666',
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CD964',
  },
  overBudgetText: {
    color: '#FF3B30',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CD964',
    borderRadius: 4,
  },
  progressBarExceeded: {
    backgroundColor: '#FF3B30',
  },
  editButton: {
    alignSelf: 'flex-end',
  },
  editButtonText: {
    fontSize: 14,
    color: '#007BFF',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 16,
    color: '#007BFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  formContainer: {
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
});

export default BudgetScreen;
