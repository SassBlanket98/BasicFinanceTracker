import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useFinance} from '../../context/FinanceContext';
import Input from '../common/input';
import Button from '../common/Button';
import CategoryPicker from '../common/CategoryPicker';
import {Transaction, Category, TransactionType} from '../../types';

interface RouteParams {
  transaction?: Transaction;
}

const AddTransaction = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {transaction} = (route.params as RouteParams) || {};
  const {addTransaction, deleteTransaction} = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    amount: '',
    category: '',
  });

  // Pre-fill form if editing transaction
  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setType(transaction.type);
      setSelectedCategory(transaction.category);
    }
  }, [transaction]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {amount: '', category: ''};

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
      valid = false;
    } else {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        newErrors.amount = 'Please enter a valid amount';
        valid = false;
      }
    }

    // Validate category
    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const newTransaction = {
      description,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      category: selectedCategory as string,
      type,
    };

    if (transaction) {
      // Delete old transaction and add updated one
      deleteTransaction(transaction.id);
    }

    addTransaction(newTransaction);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!transaction) {
      return;
    }

    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTransaction(transaction.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.id);
    setType(category.type);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </Text>
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.activeTypeButton,
            ]}
            onPress={() => setType('expense')}>
            <Text
              style={[
                styles.typeText,
                type === 'expense' && styles.activeTypeText,
              ]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.activeTypeButton,
            ]}
            onPress={() => setType('income')}>
            <Text
              style={[
                styles.typeText,
                type === 'income' && styles.activeTypeText,
              ]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          prefix="R"
          error={errors.amount}
        />

        <CategoryPicker
          selectedCategoryId={selectedCategory}
          onSelectCategory={handleCategorySelect}
          transactionType={type}
        />
        {errors.category ? (
          <Text style={styles.errorText}>{errors.category}</Text>
        ) : null}

        <Input
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="What was this for?"
        />

        <Input
          label="Date"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />

        <View style={styles.buttonsContainer}>
          <Button title="Save" onPress={handleSave} style={styles.saveButton} />

          {transaction && (
            <Button
              title="Delete"
              onPress={handleDelete}
              type="danger"
              style={styles.deleteButton}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTypeButton: {
    backgroundColor: '#007BFF',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  buttonsContainer: {
    marginTop: 24,
  },
  saveButton: {
    marginBottom: 12,
  },
  deleteButton: {
    marginBottom: 24,
  },
});

export default AddTransaction;
