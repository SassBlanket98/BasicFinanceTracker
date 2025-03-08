import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CategorySpending} from '../../types';
import {formatCurrency} from '../../utils/calculations';

interface BarChartProps {
  data: CategorySpending[];
  maxHeight?: number;
}

const BarChart: React.FC<BarChartProps> = ({data, maxHeight = 180}) => {
  // Sort data by amount in descending order
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  // Find the maximum amount for scaling
  const maxAmount = Math.max(...data.map(item => item.amount), 1);

  return (
    <View style={styles.container}>
      {sortedData.map((item, index) => {
        // Calculate bar height as percentage of max height
        const barHeight = (item.amount / maxAmount) * maxHeight;

        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.amountText}>
                R{formatCurrency(item.amount)}
              </Text>
              <Text style={styles.percentText}>
                {Math.round(item.percentage)}%
              </Text>
            </View>

            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: item.category.color,
                  },
                ]}
              />
            </View>

            <Text
              style={styles.categoryText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.category.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 250,
    paddingTop: 30,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 10,
    color: '#666',
  },
  percentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 180,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 2,
  },
  categoryText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
    color: '#333',
  },
});

export default BarChart;
