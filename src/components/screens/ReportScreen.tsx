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
import DonutChart from '../charts/DonutChart';

const ReportScreen: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const [tab, setTab] = useState<TransactionType>('expense');

  const {getIncome, getExpenses, getCategorySpending, getSpendingTrend} =
    useTransactions();

  // Get data based on selected period and tab
  const totalIncome = getIncome(period);
  const totalExpenses = getExpenses(period);
  const spendingTrend = getSpendingTrend(period);

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
            <Text style={styles.summaryLabel}>Trend</Text>
            <Text
              style={[
                styles.trendText,
                spendingTrend <= 0 ? styles.positiveText : styles.negativeText,
              ]}>
              {spendingTrend <= 0 ? '↓' : '↑'}{' '}
              {Math.abs(Math.round(spendingTrend))}%
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
            <Text style={styles.chartTitle}>
              {tab === 'expense' ? 'Spending' : 'Income'} by Category
            </Text>

            {/* Replace Line Chart with Donut Chart */}
            <View style={styles.chartContainer}>
              <DonutChart
                data={filteredDistribution}
                size={220}
                thickness={40}
              />
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

      {/* Savings Analysis Card */}
      <Card title="Savings Analysis" style={styles.savingsCard}>
        <View style={styles.savingsRateContainer}>
          <Text style={styles.savingsRateLabel}>Savings Rate</Text>
          <Text style={styles.savingsRateValue}>
            {totalIncome > 0
              ? `${Math.round(
                  ((totalIncome - totalExpenses) / totalIncome) * 100,
                )}%`
              : '0%'}
          </Text>
          <View style={styles.savingsProgressContainer}>
            <View
              style={[
                styles.savingsProgress,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  width:
                    totalIncome > 0
                      ? `${Math.min(
                          Math.round(
                            ((totalIncome - totalExpenses) / totalIncome) * 100,
                          ),
                          100,
                        )}%`
                      : '0%',
                },
              ]}
            />
          </View>
          <Text style={styles.savingsDescription}>
            {totalIncome > 0 &&
            (totalIncome - totalExpenses) / totalIncome >= 0.2
              ? "Great job! You're saving more than the recommended 20% of your income."
              : totalIncome > 0 &&
                (totalIncome - totalExpenses) / totalIncome > 0
              ? "You're saving, but aim for at least 20% of your income for financial security."
              : 'Try to reduce expenses to build savings for financial security.'}
          </Text>
        </View>
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
  trendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveText: {
    color: '#4CD964',
  },
  negativeText: {
    color: '#FF3B30',
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
    paddingVertical: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  legendContainer: {
    width: '100%',
    marginTop: 24,
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
  savingsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  savingsRateContainer: {
    alignItems: 'center',
  },
  savingsRateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  savingsRateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 8,
  },
  savingsProgressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  savingsProgress: {
    height: '100%',
    backgroundColor: '#007BFF',
    borderRadius: 4,
  },
  savingsDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default ReportScreen;
