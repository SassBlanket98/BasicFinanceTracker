import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {G, Path, Circle} from 'react-native-svg';
import {PieChartProps} from '../../types';

const PieChart: React.FC<PieChartProps> = ({data, size = 200}) => {
  const filteredData = data.filter(item => item.amount > 0);
  const total = filteredData.reduce((sum, item) => sum + item.amount, 0);

  // If no data or total is zero, return empty circle
  if (filteredData.length === 0 || total === 0) {
    return (
      <View style={[styles.pieChartContainer, {width: size, height: size}]}>
        <View style={[styles.emptyChart, {width: size, height: size}]} />
      </View>
    );
  }

  // Center and radius
  const center = size / 2;
  const radius = size / 2;
  const innerRadius = radius * 0.7;

  // Calculate segments
  let currentAngle = 0;
  const paths = filteredData.map(item => {
    const percentage = item.amount / total;
    const angle = percentage * 2 * Math.PI;

    // Calculate SVG arc path
    const x1 = center + radius * Math.sin(currentAngle);
    const y1 = center - radius * Math.cos(currentAngle);

    currentAngle += angle;

    const x2 = center + radius * Math.sin(currentAngle);
    const y2 = center - radius * Math.cos(currentAngle);

    // Determine which arc to use (large or small)
    const largeArcFlag = angle > Math.PI ? 1 : 0;

    // Create SVG path
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {path, color: item.category.color};
  });

  return (
    <View style={[styles.pieChartContainer, {width: size, height: size}]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {paths.map((segment, index) => (
            <Path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
            />
          ))}
          <Circle cx={center} cy={center} r={innerRadius} fill="white" />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChart: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default PieChart;
