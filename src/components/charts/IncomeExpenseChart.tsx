import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Svg, {Rect, Line, Text as SvgText, G} from 'react-native-svg';
import {useTransactions} from '../../hooks/useTransactions';
import {formatCurrency} from '../../utils/calculations';

// Chart dimensions
const WIDTH = Dimensions.get('window').width - 40;
const HEIGHT = 220;
const PADDING = {top: 20, right: 20, bottom: 40, left: 50};
const CHART_WIDTH = WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const BAR_PADDING = 10; // Padding between pairs of bars

interface IncomeExpenseChartProps {
  timeFrame?: 'week' | 'month' | 'year';
  showNet?: boolean; // Option to show net (income - expense)
}

/**
 * A bar chart component that compares income and expenses side by side
 */
const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  timeFrame = 'month',
  showNet = true,
}) => {
  const {getIncome, getExpenses, transactions} = useTransactions();
  const [chartData, setChartData] = useState<
    Array<{
      label: string;
      income: number;
      expense: number;
      net: number;
    }>
  >([]);
  const [maxValue, setMaxValue] = useState<number>(0);
  const [selectedBar, setSelectedBar] = useState<{
    type: 'income' | 'expense' | 'net';
    index: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Define prepareChartData as useCallback to avoid recreation on every render
  const prepareChartData = useCallback(() => {
    const now = new Date();
    const data: any[] = [];
    let overallMax = 0;

    if (timeFrame === 'week') {
      // Show proper calendar weeks instead of just last 7 days
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        const dayOfWeek = weekStart.getDay();

        // Calculate the date of Sunday this week, then go back i weeks
        weekStart.setDate(weekStart.getDate() - dayOfWeek - i * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekLabel = `Week ${4 - i}`;

        // Instead of using 'daily' period with a specific date,
        // filter transactions explicitly for this week
        const weekTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= weekStart && date <= weekEnd;
        });

        const income = weekTransactions
          .filter((t: {type: string}) => t.type === 'income')
          .reduce((sum: any, t: {amount: any}) => sum + t.amount, 0);

        const expense = weekTransactions
          .filter((t: {type: string}) => t.type === 'expense')
          .reduce((sum: any, t: {amount: any}) => sum + t.amount, 0);

        const net = income - expense;

        data.push({
          label: weekLabel,
          income,
          expense,
          net,
        });

        // Update max value for scaling
        overallMax = Math.max(overallMax, income, expense);
      }
    } else if (timeFrame === 'month') {
      // Show last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(now.getDate() - i * 7 - now.getDay());

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekLabel = `Week ${4 - i}`;

        // Get income and expense for this week
        const income = getIncome('weekly', weekStart);
        const expense = getExpenses('weekly', weekStart);
        const net = income - expense;

        data.push({
          label: weekLabel,
          income,
          expense,
          net,
        });

        // Update max value for scaling
        overallMax = Math.max(overallMax, income, expense);
      }
    } else if (timeFrame === 'year') {
      // Show last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);

        const monthLabel = date.toLocaleDateString(undefined, {month: 'short'});

        // Get income and expense for this month
        const income = getIncome('monthly', date);
        const expense = getExpenses('monthly', date);
        const net = income - expense;

        data.push({
          label: monthLabel,
          income,
          expense,
          net,
        });

        // Update max value for scaling
        overallMax = Math.max(overallMax, income, expense);
      }
    }

    // Set the max value with a little padding (10% above max)
    setMaxValue(overallMax * 1.1 || 100);
    setChartData(data);
  }, [timeFrame, getIncome, getExpenses, transactions]);

  // Process data when component mounts or when prepareChartData changes
  useEffect(() => {
    prepareChartData();
  }, [prepareChartData]);

  // We've moved the prepareChartData function above as a useCallback

  /**
   * Handles selection of a bar in the chart
   */
  const handleBarPress = (
    type: 'income' | 'expense' | 'net',
    index: number,
    value: number,
    x: number,
    y: number,
  ) => {
    // Toggle selection off if the same bar is selected
    if (
      selectedBar &&
      selectedBar.type === type &&
      selectedBar.index === index
    ) {
      setSelectedBar(null);
    } else {
      setSelectedBar({
        type,
        index,
        value,
        x,
        y,
      });
    }
  };

  // Render empty state if no data
  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Calculate the width of each bar group
  const barGroupWidth = CHART_WIDTH / chartData.length;
  // Width of an individual bar, accounting for group padding
  const barWidth = (barGroupWidth - BAR_PADDING) / (showNet ? 3 : 2);

  return (
    <View style={styles.container}>
      <Svg width={WIDTH} height={HEIGHT}>
        {/* Y-axis grid lines and labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, index) => {
          const y = PADDING.top + CHART_HEIGHT - tick * CHART_HEIGHT;
          const value = (maxValue * tick).toFixed(0);

          return (
            <G key={`grid-${index}`}>
              <Line
                x1={PADDING.left}
                y1={y}
                x2={WIDTH - PADDING.right}
                y2={y}
                stroke="#E5E5E5"
                strokeWidth={1}
              />
              <SvgText
                x={PADDING.left - 5}
                y={y + 4}
                fontSize={10}
                fill="#999"
                textAnchor="end">
                {value}
              </SvgText>
            </G>
          );
        })}

        {/* X-axis line */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top + CHART_HEIGHT}
          x2={WIDTH - PADDING.right}
          y2={PADDING.top + CHART_HEIGHT}
          stroke="#E5E5E5"
          strokeWidth={1}
        />

        {/* Bars and labels */}
        {chartData.map((item, index) => {
          // Calculate the start x position for this group of bars
          const groupX = PADDING.left + index * barGroupWidth + BAR_PADDING / 2;

          // Calculate heights based on values
          const incomeHeight = (item.income / maxValue) * CHART_HEIGHT;
          const expenseHeight = (item.expense / maxValue) * CHART_HEIGHT;
          const netHeight = (Math.abs(item.net) / maxValue) * CHART_HEIGHT;

          return (
            <G key={`bars-${index}`}>
              {/* Income bar */}
              <Rect
                x={groupX}
                y={PADDING.top + CHART_HEIGHT - incomeHeight}
                width={barWidth}
                height={incomeHeight}
                fill="#4CD964" // Green for income
                rx={2}
                onPress={() =>
                  handleBarPress(
                    'income',
                    index,
                    item.income,
                    groupX + barWidth / 2,
                    PADDING.top + CHART_HEIGHT - incomeHeight / 2,
                  )
                }
              />

              {/* Expense bar */}
              <Rect
                x={groupX + barWidth}
                y={PADDING.top + CHART_HEIGHT - expenseHeight}
                width={barWidth}
                height={expenseHeight}
                fill="#FF3B30" // Red for expense
                rx={2}
                onPress={() =>
                  handleBarPress(
                    'expense',
                    index,
                    item.expense,
                    groupX + barWidth * 1.5,
                    PADDING.top + CHART_HEIGHT - expenseHeight / 2,
                  )
                }
              />

              {/* Net bar (optional) */}
              {showNet && (
                <Rect
                  x={groupX + barWidth * 2}
                  y={
                    item.net >= 0
                      ? PADDING.top + CHART_HEIGHT - netHeight
                      : PADDING.top + CHART_HEIGHT
                  }
                  width={barWidth}
                  height={netHeight}
                  fill={item.net >= 0 ? '#007BFF' : '#8E44AD'} // Blue for positive, purple for negative
                  rx={2}
                  onPress={() =>
                    handleBarPress(
                      'net',
                      index,
                      item.net,
                      groupX + barWidth * 2.5,
                      PADDING.top +
                        CHART_HEIGHT -
                        (item.net >= 0 ? netHeight / 2 : -netHeight / 2),
                    )
                  }
                />
              )}

              {/* X-axis label */}
              <SvgText
                x={groupX + (showNet ? barWidth * 1.5 : barWidth)}
                y={HEIGHT - 10}
                fontSize={10}
                fill="#666"
                textAnchor="middle">
                {item.label}
              </SvgText>
            </G>
          );
        })}

        {/* Selected bar tooltip */}
        {selectedBar && (
          <G>
            <Rect
              x={selectedBar.x - 50}
              y={selectedBar.y - 25}
              width={100}
              height={20}
              rx={4}
              fill="rgba(0,0,0,0.7)"
            />
            <SvgText
              x={selectedBar.x}
              y={selectedBar.y - 12}
              fontSize={10}
              fill="white"
              textAnchor="middle">
              {selectedBar.type.charAt(0).toUpperCase() +
                selectedBar.type.slice(1)}
              : R{formatCurrency(selectedBar.value)}
            </SvgText>
          </G>
        )}
      </Svg>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#4CD964'}]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#FF3B30'}]} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
        {showNet && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: '#007BFF'}]} />
            <Text style={styles.legendText}>Net</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  emptyContainer: {
    height: HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default IncomeExpenseChart;
