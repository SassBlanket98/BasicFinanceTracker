import React from 'react';
import {View, StyleSheet} from 'react-native';
import {PieChartProps} from '../../types'; // Update path as needed

const PieChart: React.FC<PieChartProps> = ({data, size = 200}) => {
  const total = data.reduce(
    (sum: any, item: {amount: any}) => sum + item.amount,
    0,
  );
  let startAngle = 0;

  return (
    <View style={[styles.pieChartContainer, {width: size, height: size}]}>
      <View style={[styles.pieChart, {width: size, height: size}]}>
        {data.map(
          (
            item: {amount: number; category: {color: any}},
            index: React.Key | null | undefined,
          ) => {
            const percentage = item.amount / total;
            const angle = percentage * 360;
            const endAngle = startAngle + angle;

            // Create a slice style as a regular object
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
          },
        )}
      </View>
      <View style={styles.pieChartCenter} />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default PieChart;
