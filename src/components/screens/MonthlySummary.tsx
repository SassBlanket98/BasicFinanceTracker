import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useTransactions} from '../../hooks/useTransactions';
import {formatCurrency} from '../../utils/calculations';
import Card from '../common/Card';
import DonutChart from '../charts/DonutChart';
import SpendingTrendChart from '../charts/SpendingTrendChart';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';

/**
 * A comprehensive dashboard showing monthly financial summary with multiple visualizations
 */
const MonthlySummary: React.FC = () => {
  const {
    getIncome,
    getExpenses,
    getCategorySpending,
    getSavingsRate,
    getCurrentBalance,
  } = useTransactions();

  // State for selected time periods in different charts
  const [trendPeriod, setTrendPeriod] = useState<
    'weekly' | 'monthly' | '3months' | '6months'
  >('monthly');
  const [comparisonTimeFrame, setComparisonTimeFrame] = useState<
    'week' | 'month' | 'year'
  >('month');

  // Get current month name for headers
  const currentMonth = new Date().toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  // Get financial data
  const monthlyIncome = getIncome('monthly');
  const monthlyExpenses = getExpenses('monthly');
  const currentBalance = getCurrentBalance();
  const savingsRate = getSavingsRate('monthly');

  // Get category spending for donut chart
  const categorySpending = getCategorySpending('expense', 'monthly');

  // Handler for trend period selection
  const handleTrendPeriodChange = (
    period: 'weekly' | 'monthly' | '3months' | '6months',
  ) => {
    setTrendPeriod(period);
  };

  // Handler for comparison timeframe selection
  const handleComparisonTimeFrameChange = (
    timeFrame: 'week' | 'month' | 'year',
  ) => {
    setComparisonTimeFrame(timeFrame);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Summary</Text>
        <Text style={styles.subtitle}>{currentMonth}</Text>
      </View>

      {/* Financial Highlights Card */}
      <Card style={styles.overviewCard}>
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightLabel}>Income</Text>
            <Text style={styles.incomeText}>
              R{formatCurrency(monthlyIncome)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.highlightItem}>
            <Text style={styles.highlightLabel}>Expenses</Text>
            <Text style={styles.expenseText}>
              R{formatCurrency(monthlyExpenses)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.highlightItem}>
            <Text style={styles.highlightLabel}>Balance</Text>
            <Text style={styles.balanceText}>
              R{formatCurrency(currentBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.savingsContainer}>
          <Text style={styles.savingsLabel}>Savings Rate</Text>
          <View style={styles.savingsRateContainer}>
            <View style={styles.savingsProgressContainer}>
              <View
                style={[
                  styles.savingsProgress,
                  {width: `${Math.max(0, Math.min(100, savingsRate))}%`},
                  savingsRate < 0 && styles.negativeSavings,
                ]}
              />
            </View>
            <Text style={styles.savingsRateText}>
              {savingsRate.toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.savingsTip}>
            {savingsRate >= 20
              ? "Great job! You're saving more than the recommended 20%."
              : savingsRate > 0
              ? 'Try to save at least 20% of your income for financial security.'
              : 'Your expenses exceed your income. Consider reducing expenses.'}
          </Text>
        </View>
      </Card>

      {/* Expense By Category Card */}
      <Card title="Expenses By Category">
        <View style={styles.donutChartContainer}>
          <DonutChart data={categorySpending} size={220} thickness={50} />
        </View>
      </Card>

      {/* Spending Trends Card */}
      <Card title="Spending Trends">
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              trendPeriod === 'weekly' && styles.activePeriodButton,
            ]}
            onPress={() => handleTrendPeriodChange('weekly')}>
            <Text
              style={[
                styles.periodButtonText,
                trendPeriod === 'weekly' && styles.activePeriodButtonText,
              ]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              trendPeriod === 'monthly' && styles.activePeriodButton,
            ]}
            onPress={() => handleTrendPeriodChange('monthly')}>
            <Text
              style={[
                styles.periodButtonText,
                trendPeriod === 'monthly' && styles.activePeriodButtonText,
              ]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              trendPeriod === '3months' && styles.activePeriodButton,
            ]}
            onPress={() => handleTrendPeriodChange('3months')}>
            <Text
              style={[
                styles.periodButtonText,
                trendPeriod === '3months' && styles.activePeriodButtonText,
              ]}>
              3 Months
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              trendPeriod === '6months' && styles.activePeriodButton,
            ]}
            onPress={() => handleTrendPeriodChange('6months')}>
            <Text
              style={[
                styles.periodButtonText,
                trendPeriod === '6months' && styles.activePeriodButtonText,
              ]}>
              6 Months
            </Text>
          </TouchableOpacity>
        </View>

        <SpendingTrendChart period={trendPeriod} />
      </Card>

      {/* Income vs Expense Card */}
      <Card title="Income vs Expense">
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              comparisonTimeFrame === 'week' && styles.activePeriodButton,
            ]}
            onPress={() => handleComparisonTimeFrameChange('week')}>
            <Text
              style={[
                styles.periodButtonText,
                comparisonTimeFrame === 'week' && styles.activePeriodButtonText,
              ]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              comparisonTimeFrame === 'month' && styles.activePeriodButton,
            ]}
            onPress={() => handleComparisonTimeFrameChange('month')}>
            <Text
              style={[
                styles.periodButtonText,
                comparisonTimeFrame === 'month' &&
                  styles.activePeriodButtonText,
              ]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              comparisonTimeFrame === 'year' && styles.activePeriodButton,
            ]}
            onPress={() => handleComparisonTimeFrameChange('year')}>
            <Text
              style={[
                styles.periodButtonText,
                comparisonTimeFrame === 'year' && styles.activePeriodButtonText,
              ]}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        <IncomeExpenseChart timeFrame={comparisonTimeFrame} showNet={true} />
      </Card>

      {/* Financial Tips Card */}
      <Card title="Financial Insights">
        <View style={styles.tipsContainer}>
          {monthlyExpenses > monthlyIncome && (
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>⚠️ Spending Alert</Text>
              <Text style={styles.tipText}>
                Your expenses exceed your income by R
                {formatCurrency(monthlyExpenses - monthlyIncome)} this month.
                Consider reviewing your budget.
              </Text>
            </View>
          )}

          {categorySpending.length > 0 && (
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>💡 Top Spending Category</Text>
              <Text style={styles.tipText}>
                Your highest expense category is{' '}
                {categorySpending[0].category.name} at R
                {formatCurrency(categorySpending[0].amount)} (
                {categorySpending[0].percentage.toFixed(1)}% of total).
              </Text>
            </View>
          )}

          {savingsRate > 0 && savingsRate < 10 && (
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>💰 Savings Opportunity</Text>
              <Text style={styles.tipText}>
                Your current savings rate is {savingsRate.toFixed(1)}%. Try to
                increase it to at least 20% for better financial security.
              </Text>
            </View>
          )}

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>🎯 Financial Goal Reminder</Text>
            <Text style={styles.tipText}>
              Setting specific savings goals can help you stay motivated and
              focused on your financial journey.
            </Text>
          </View>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  overviewCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 16,
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CD964',
  },
  expenseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#EEE',
  },
  savingsContainer: {
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  savingsRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  savingsProgressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  savingsProgress: {
    height: '100%',
    backgroundColor: '#4CD964',
    borderRadius: 4,
  },
  negativeSavings: {
    backgroundColor: '#FF3B30',
  },
  savingsRateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 50,
    textAlign: 'right',
  },
  savingsTip: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  donutChartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
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
    fontSize: 12,
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tipsContainer: {
    marginVertical: 8,
  },
  tipItem: {
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default MonthlySummary;
