import React from 'react';
import {View, StyleSheet} from 'react-native';
import {PieChartProps} from '../../types'; // Update path as needed

// In PieChart.tsx
const PieChart: React.FC<PieChartProps> = ({data, size = 200}) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  let startAngle = 0;

  return (
    <View style={[styles.pieChartContainer, {width: size, height: size}]}>
      <View style={[styles.pieChart, {width: size, height: size}]}>
        {data.map((item, index) => {
          const percentage = item.amount / total;
          const angle = percentage * 360;
          const endAngle = startAngle + angle;

          // Calculate rotation and skew angles for the slice
          const rotateZ = `${startAngle}deg`;
          const skewY = angle > 180 ? '180deg' : '0deg';

          // Create the slice with proper rotation
          const slice = {
            position: 'absolute' as const,
            width: size / 2,
            height: size,
            left: size / 2,
            transform: [{rotateZ}],
            overflow: 'hidden' as const,
          };

          // Create the slice cover with proper styling
          const coverStyle = {
            position: 'absolute' as const,
            width: size,
            height: size,
            left: -size / 2,
            backgroundColor: item.category.color,
            transform: [{skewY}],
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
