import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useTransactions} from '../../hooks/useTransactions';
import Card from '../common/Card';
import {formatCurrency} from '../../utils/calculations';
import {TimePeriod, TransactionType, CategorySpending} from '../../types';

// PieChart component with proper TypeScript annotations
const PieChart: React.FC<{data: CategorySpending[]; size?: number}> = ({
  data,
  size = 200,
}) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  let startAngle = 0;

  return (
    <View style={[styles.pieChartContainer, {width: size, height: size}]}>
      <View style={[styles.pieChart, {width: size, height: size}]}>
        {data.map((item, index) => {
          const percentage = item.amount / total;
          const angle = percentage * 360;
          const endAngle = startAngle + angle;

          // Create a slice
          const slice = {
            position: 'absolute' as const,
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden' as const,
          };

          const coverStyle = {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            width: size,
            height: size,
            backgroundColor: item.category.color,
          };

          // Create the slice
          const result = (
            <View key={index} style={slice}>
              <View style={coverStyle} />
            </View>
          );

          startAngle = endAngle;
          return result;
        })}
      </View>
      <View style={styles.pieChartCenter} />
    </View>
  );
};

const ReportScreen: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const [tab, setTab] = useState<TransactionType>('expense');

  const {getIncome, getExpenses, getCategorySpending} = useTransactions();

  // Get data based on selected period and tab
  const totalIncome = getIncome(period);
  const totalExpenses = getExpenses(period);

  // Get category distribution
  const categoryDistribution = getCategorySpending(tab, period);

  // Filter out categories with 0 amount
  const filteredDistribution = categoryDistribution.filter(
    (item: CategorySpending) => item.amount > 0,
  );

  const renderPeriodButton = (buttonPeriod: TimePeriod, label: string) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        period === buttonPeriod && styles.activePeriodButton,
      ]}
      onPress={() => setPeriod(buttonPeriod)}>
      <Text
        style={[
          styles.periodButtonText,
          period === buttonPeriod && styles.activePeriodButtonText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTabButton = (buttonTab: TransactionType, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, tab === buttonTab && styles.activeTabButton]}
      onPress={() => setTab(buttonTab)}>
      <Text
        style={[
          styles.tabButtonText,
          tab === buttonTab && styles.activeTabButtonText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Report</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {renderPeriodButton('daily', 'Day')}
        {renderPeriodButton('weekly', 'Week')}
        {renderPeriodButton('monthly', 'Month')}
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.incomeText}>
              R{formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.expenseText}>
              R{formatCurrency(totalExpenses)}
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text
              style={
                totalIncome - totalExpenses >= 0
                  ? styles.incomeText
                  : styles.expenseText
              }>
              R{formatCurrency(totalIncome - totalExpenses)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Savings Rate</Text>
            <Text style={styles.savingsText}>
              {totalIncome > 0
                ? `${Math.round(
                    ((totalIncome - totalExpenses) / totalIncome) * 100,
                  )}%`
                : '0%'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Category Breakdown */}
      <Card title="Category Breakdown">
        <View style={styles.tabSelector}>
          {renderTabButton('expense', 'Expenses')}
          {renderTabButton('income', 'Income')}
        </View>

        {filteredDistribution.length > 0 ? (
          <View style={styles.chartSection}>
            <View style={styles.chartContainer}>
              <PieChart data={filteredDistribution} size={180} />
            </View>

            <View style={styles.legendContainer}>
              {filteredDistribution.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {backgroundColor: item.category.color},
                    ]}
                  />
                  <View style={styles.legendTextContainer}>
                    <Text style={styles.legendCategory}>
                      {item.category.name}
                    </Text>
                    <Text style={styles.legendAmount}>
                      R{formatCurrency(item.amount)}
                    </Text>
                  </View>
                  <Text style={styles.legendPercentage}>
                    {Math.round(item.percentage)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No data available for the selected period
            </Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activePeriodButton: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
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
  savingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTabButton: {
    backgroundColor: '#007BFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  chartSection: {
    alignItems: 'center',
  },
  chartContainer: {
    marginVertical: 16,
  },
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChart: {
    position: 'relative',
    borderRadius: 100,
    overflow: 'hidden',
  },
  pieChartCenter: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
  },
  legendContainer: {
    width: '100%',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  legendAmount: {
    fontSize: 12,
    color: '#666',
  },
  legendPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
});

export default ReportScreen;
