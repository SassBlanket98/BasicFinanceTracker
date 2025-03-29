import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTransactions} from '../../hooks/useTransactions';
import Card from '../common/Card';
import {formatCurrency} from '../../utils/calculations';
import {TimePeriod, TransactionType, CategorySpending} from '../../types';
import DonutChart from '../charts/DonutChart';
import SpendingTrendChart from '../charts/SpendingTrendChart';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';

const ReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const [tab, setTab] = useState<TransactionType>('expense');
  const [chartView, setChartView] = useState<'donut' | 'trend' | 'comparison'>(
    'donut',
  );

  const {
    getIncome,
    getExpenses,
    getCategorySpending,
    getSpendingTrend,
    getTopSpendingCategories,
  } = useTransactions();

  // Get data based on selected period and tab
  const totalIncome = getIncome(period);
  const totalExpenses = getExpenses(period);
  const spendingTrend = getSpendingTrend(period);

  // Get category distribution
  const categoryDistribution = getCategorySpending(tab, period);

  // Get top spending categories
  const topCategories = getTopSpendingCategories(period, 5);

  // Filter out categories with 0 amount
  const filteredDistribution = categoryDistribution.filter(
    (item: CategorySpending) => item.amount > 0,
  );

  // Navigation to Monthly Summary
  const navigateToMonthlySummary = () => {
    // @ts-ignore - Type issue with navigation
    navigation.navigate('MonthlySummary');
  };

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

  const renderChartTypeButton = (
    type: 'donut' | 'trend' | 'comparison',
    label: string,
    emoji: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.chartTypeButton,
        chartView === type && styles.activeChartTypeButton,
      ]}
      onPress={() => setChartView(type)}>
      <Text style={styles.chartTypeEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.chartTypeText,
          chartView === type && styles.activeChartTypeText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Financial Report</Text>
        </View>
        <TouchableOpacity
          style={styles.summaryButton}
          onPress={navigateToMonthlySummary}>
          <Text style={styles.summaryButtonText}>Monthly Summary</Text>
        </TouchableOpacity>
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

      {/* Chart Type Selector */}
      <View style={styles.chartTypeSelector}>
        {renderChartTypeButton('donut', 'Categories', '🍩')}
        {renderChartTypeButton('trend', 'Trends', '📈')}
        {renderChartTypeButton('comparison', 'Compare', '⚖️')}
      </View>

      {/* Chart Card */}
      <Card
        title={
          chartView === 'donut'
            ? 'Category Breakdown'
            : chartView === 'trend'
            ? 'Spending Trends'
            : 'Income vs Expense'
        }>
        {chartView === 'donut' && (
          <>
            <View style={styles.tabSelector}>
              {renderTabButton('expense', 'Expenses')}
              {renderTabButton('income', 'Income')}
            </View>

            {filteredDistribution.length > 0 ? (
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>
                  {tab === 'expense' ? 'Spending' : 'Income'} by Category
                </Text>

                <View style={styles.chartContainer}>
                  <DonutChart
                    data={filteredDistribution}
                    size={260}
                    thickness={60}
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
          </>
        )}

        {chartView === 'trend' && (
          <View style={styles.trendChartContainer}>
            <SpendingTrendChart period="monthly" />
          </View>
        )}

        {chartView === 'comparison' && (
          <View style={styles.comparisonChartContainer}>
            <IncomeExpenseChart timeFrame="month" showNet={true} />
          </View>
        )}
      </Card>

      {/* Top Spending Categories Card */}
      {chartView !== 'donut' && tab === 'expense' && (
        <Card title="Top Spending Categories">
          {topCategories.length > 0 ? (
            <View style={styles.topCategoriesContainer}>
              {topCategories.map((item, index) => (
                <View key={index} style={styles.topCategoryItem}>
                  <View style={styles.topCategoryRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View
                    style={[
                      styles.categoryDot,
                      {backgroundColor: item.category.color},
                    ]}
                  />
                  <View style={styles.topCategoryDetails}>
                    <Text style={styles.topCategoryName}>
                      {item.category.name}
                    </Text>
                    <Text style={styles.topCategoryAmount}>
                      R{formatCurrency(item.amount)}
                    </Text>
                  </View>
                  <Text style={styles.topCategoryPercentage}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No expense data available for this period
              </Text>
            </View>
          )}
        </Card>
      )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  summaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
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
  chartTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chartTypeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activeChartTypeButton: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  chartTypeEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  chartTypeText: {
    fontSize: 12,
    color: '#666',
  },
  activeChartTypeText: {
    color: '#FFFFFF',
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
  trendChartContainer: {
    marginVertical: 16,
  },
  comparisonChartContainer: {
    marginVertical: 16,
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
  topCategoriesContainer: {
    marginVertical: 8,
  },
  topCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topCategoryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  topCategoryDetails: {
    flex: 1,
  },
  topCategoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  topCategoryAmount: {
    fontSize: 12,
    color: '#666',
  },
  topCategoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default ReportScreen;
