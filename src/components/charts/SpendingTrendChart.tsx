import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import Svg, {
  Line,
  Path,
  Circle,
  Text as SvgText,
  G,
  Rect,
} from 'react-native-svg';
import {useTransactions} from '../../hooks/useTransactions';
import {formatCurrency} from '../../utils/calculations';
// import {Category, Transaction, TransactionType} from '../../types';

// Window width minus padding
const WIDTH = Dimensions.get('window').width - 40;
const HEIGHT = 220;
const PADDING = {top: 20, right: 20, bottom: 40, left: 40};
const CHART_WIDTH = WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

interface SpendingTrendChartProps {
  period?: 'weekly' | 'monthly' | '3months' | '6months' | 'yearly';
  selectedCategories?: string[]; // Array of category IDs
}

/**
 * A chart component that shows spending trends over time for selected categories
 */
const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  period = 'monthly',
  selectedCategories,
}) => {
  const {transactions, getCategoryById} = useTransactions();
  const [chartData, setChartData] = useState<
    Array<{
      label: string;
      data: Array<{x: number; y: number; value: number}>;
      color: string;
    }>
  >([]);
  const [maxValue, setMaxValue] = useState<number>(0);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{
    categoryIndex: number;
    pointIndex: number;
    x: number;
    y: number;
    value: number;
    label: string;
    color: string;
  } | null>(null);

  // Define prepareChartData as useCallback to avoid recreation on every render
  const prepareChartData = useCallback(() => {
    if (!transactions || transactions.length === 0) {
      setChartData([]);
      setMaxValue(0);
      setTimeLabels([]);
      return;
    }

    // Get current date and calculate date ranges based on period
    const timePoints: Date[] = [];
    const labels: string[] = [];

    // Create time points based on the selected period
    if (period === 'weekly') {
      // Get last 4 weeks, aligned to calendar weeks
      for (let i = 3; i >= 0; i--) {
        // Get the current date
        const date = new Date();

        // Go back i weeks from the current date
        date.setDate(date.getDate() - i * 7);

        // Find the Sunday (or Monday) of this week
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = date.getDate() - dayOfWeek; // Adjust to get to Sunday

        // Create a new date for the start of this week
        const weekStart = new Date(date);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        // Create the end date (6 days later)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        timePoints.push(weekStart);

        // Create a week label like "Mar 15-21"
        const startLabel = weekStart.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        const endLabel = weekEnd.toLocaleDateString(undefined, {
          day: 'numeric',
        });
        labels.push(`${startLabel}-${endLabel}`);

        console.log(
          `Week ${4 - i}:`,
          weekStart.toISOString(),
          'to',
          weekEnd.toISOString(),
        );
      }
    }

    // Set time labels for x-axis
    setTimeLabels(labels);

    // Get all transaction categories or use the selected ones
    const filteredTransactions = transactions.filter(t => t.type === 'expense');
    let categories: Set<string> = new Set();

    if (selectedCategories && selectedCategories.length > 0) {
      // Use selected categories
      categories = new Set(selectedCategories);
    } else {
      // Get all unique categories from transactions
      filteredTransactions.forEach(transaction => {
        categories.add(transaction.category);
      });
    }

    // For each category, calculate spending for each time point
    const categoryData: any[] = [];
    let overallMax = 0;

    categories.forEach(categoryId => {
      const category = getCategoryById(categoryId);
      if (!category) {
        return;
      }

      const dataPoints = timePoints.map((date, index) => {
        // Calculate start and end date for this time point
        let startDate: number | Date, endDate: number | Date;

        if (period === 'weekly') {
          // Daily data points
          startDate = new Date(date);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);
        } else if (period === 'monthly') {
          // Weekly data points
          startDate = new Date(date);
          startDate.setDate(date.getDate() - 7);
          endDate = new Date(date);
        } else {
          // Monthly data points
          startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        }

        // Filter transactions for this category and time period
        const periodTransactions = filteredTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          return (
            t.category === categoryId &&
            transactionDate >= startDate &&
            transactionDate <= endDate
          );
        });

        // Sum the amounts
        const totalSpent = periodTransactions.reduce(
          (sum, t) => sum + t.amount,
          0,
        );

        // Update the overall maximum if needed
        if (totalSpent > overallMax) {
          overallMax = totalSpent;
        }

        // Calculate position for the line chart
        // x is the position along the x-axis (evenly spaced)
        // y will be calculated from the amount after we determine the scale
        return {
          x: index,
          y: 0, // Placeholder, will be calculated later
          value: totalSpent,
        };
      });

      categoryData.push({
        label: category.name,
        color: category.color,
        data: dataPoints,
      });
    });

    // Set the max value with a little padding (10% above max)
    setMaxValue(overallMax * 1.1 || 100);

    // Now calculate the y-values based on the max value
    const scaledData = categoryData.map(category => {
      const scaledPoints = category.data.map((point: any) => {
        // Scale the y value (0 at bottom, max at top)
        const scaledY = point.value / (overallMax || 100);
        return {
          ...point,
          // Position y from bottom (chart height - scaled value * chart height)
          y: CHART_HEIGHT - scaledY * CHART_HEIGHT,
        };
      });

      return {
        ...category,
        data: scaledPoints,
      };
    });

    setChartData(scaledData);
  }, [transactions, period, selectedCategories, getCategoryById]);

  // Process data for the chart when transactions or period changes
  useEffect(() => {
    prepareChartData();
  }, [prepareChartData]);

  // We've moved the prepareChartData function above as a useCallback

  /**
   * Generates a SVG path string for the line connecting data points
   */
  const generateLinePath = (data: Array<{x: number; y: number}>) => {
    if (data.length === 0) {
      return '';
    }

    // Calculate the x-step based on chart width and number of data points
    const xStep = CHART_WIDTH / (timeLabels.length - 1 || 1);

    // Create the path string, starting with a move to the first point
    let pathString = `M ${PADDING.left + data[0].x * xStep} ${
      PADDING.top + data[0].y
    }`;

    // Add line segments to each subsequent point
    for (let i = 1; i < data.length; i++) {
      pathString += ` L ${PADDING.left + data[i].x * xStep} ${
        PADDING.top + data[i].y
      }`;
    }

    return pathString;
  };

  /**
   * Handles when a user taps on a data point
   */
  const handlePointPress = (
    categoryIndex: number,
    pointIndex: number,
    x: number,
    y: number,
    value: number,
    label: string,
    color: string,
  ) => {
    // Toggle off if the same point is selected
    if (
      selectedPoint &&
      selectedPoint.categoryIndex === categoryIndex &&
      selectedPoint.pointIndex === pointIndex
    ) {
      setSelectedPoint(null);
    } else {
      setSelectedPoint({
        categoryIndex,
        pointIndex,
        x,
        y,
        value,
        label,
        color,
      });
    }
  };

  // Render empty state if no data
  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No data available for this period
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View
          style={[
            styles.chartContainer,
            {width: Math.max(WIDTH, timeLabels.length * 60)},
          ]}>
          <Svg width="100%" height={HEIGHT}>
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

            {/* X-axis labels */}
            {timeLabels.map((label, index) => {
              // Calculate x position
              const xStep = CHART_WIDTH / (timeLabels.length - 1 || 1);
              const x = PADDING.left + index * xStep;

              return (
                <SvgText
                  key={`label-${index}`}
                  x={x}
                  y={HEIGHT - 10}
                  fontSize={10}
                  fill="#999"
                  textAnchor="middle">
                  {label}
                </SvgText>
              );
            })}

            {/* Data lines for each category */}
            {chartData.map((category, categoryIndex) => {
              const xStep = CHART_WIDTH / (timeLabels.length - 1 || 1);

              return (
                <G key={`category-${categoryIndex}`}>
                  {/* Line connecting points */}
                  <Path
                    d={generateLinePath(category.data)}
                    stroke={category.color}
                    strokeWidth={2}
                    fill="none"
                  />

                  {/* Data points */}
                  {category.data.map((point, pointIndex) => (
                    <Circle
                      key={`point-${categoryIndex}-${pointIndex}`}
                      cx={PADDING.left + point.x * xStep}
                      cy={PADDING.top + point.y}
                      r={4}
                      fill={category.color}
                      stroke="#FFF"
                      strokeWidth={1}
                      onPress={() =>
                        handlePointPress(
                          categoryIndex,
                          pointIndex,
                          PADDING.left + point.x * xStep,
                          PADDING.top + point.y,
                          point.value,
                          category.label,
                          category.color,
                        )
                      }
                    />
                  ))}
                </G>
              );
            })}

            {/* Selected point tooltip */}
            {selectedPoint && (
              <G>
                {/* Highlight the selected point */}
                <Circle
                  cx={selectedPoint.x}
                  cy={selectedPoint.y}
                  r={6}
                  fill={selectedPoint.color}
                  stroke="#FFF"
                  strokeWidth={2}
                />

                {/* Tooltip background */}
                <Rect
                  x={selectedPoint.x - 60}
                  y={selectedPoint.y - 40}
                  width={120}
                  height={30}
                  rx={4}
                  fill="rgba(0,0,0,0.7)"
                />

                {/* Tooltip text */}
                <SvgText
                  x={selectedPoint.x}
                  y={selectedPoint.y - 25}
                  fontSize={10}
                  fill="#FFF"
                  textAnchor="middle">
                  {selectedPoint.label}
                </SvgText>
                <SvgText
                  x={selectedPoint.x}
                  y={selectedPoint.y - 15}
                  fontSize={10}
                  fontWeight="bold"
                  fill="#FFF"
                  textAnchor="middle">
                  R{formatCurrency(selectedPoint.value)}
                </SvgText>
              </G>
            )}
          </Svg>
        </View>
      </ScrollView>

      {/* Legend for category colors */}
      <View style={styles.legendContainer}>
        {chartData.map((category, index) => (
          <View key={`legend-${index}`} style={styles.legendItem}>
            <View
              style={[styles.legendDot, {backgroundColor: category.color}]}
            />
            <Text style={styles.legendText}>{category.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  chartContainer: {
    height: HEIGHT,
    marginBottom: 10,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SpendingTrendChart;
