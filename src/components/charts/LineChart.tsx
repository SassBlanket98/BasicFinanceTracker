import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {CategorySpending} from '../../types';

interface Point {
  x: number;
  y: number;
}

interface LineChartProps {
  data: CategorySpending[];
  height?: number;
  width?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  width = Dimensions.get('window').width - 64,
}) => {
  // Sort data by amount
  const sortedData = [...data].sort((a, b) => a.amount - b.amount);

  // Find the maximum value for scaling
  const maxAmount = Math.max(...data.map(item => item.amount), 1);

  // Calculate points for the path
  const points: Point[] = sortedData.map((item, index) => {
    const x = (index / (sortedData.length - 1 || 1)) * width;
    const y = height - (item.amount / maxAmount) * height;
    return {x, y};
  });

  // Generate path for the line
  const generatePath = () => {
    if (points.length < 2) return null;

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }

    return path;
  };

  // Generate SVG path for the area under the line
  const generateAreaPath = () => {
    if (points.length < 2) return null;

    let path = `M ${points[0].x},${height} L ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }

    path += ` L ${points[points.length - 1].x},${height} Z`;

    return path;
  };

  // Draw data points and labels
  const renderDataPoints = () => {
    return points.map((point, index) => {
      const item = sortedData[index];

      return (
        <View
          key={index}
          style={[
            styles.dataPoint,
            {
              left: point.x - 4,
              top: point.y - 4,
              backgroundColor: item.category.color,
            },
          ]}>
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{item.category.name}</Text>
            <Text style={styles.tooltipAmount}>R{item.amount.toFixed(2)}</Text>
          </View>
        </View>
      );
    });
  };

  if (points.length < 2) {
    return (
      <View style={[styles.container, {height, width}]}>
        <Text style={styles.noDataText}>Not enough data for visualization</Text>
      </View>
    );
  }

  // Draw the x-axis labels (categories)
  const renderXLabels = () => {
    return sortedData.map((item, index) => {
      const x = (index / (sortedData.length - 1 || 1)) * width;

      return (
        <View key={index} style={[styles.xLabel, {left: x - 40}]}>
          <View
            style={[styles.labelDot, {backgroundColor: item.category.color}]}
          />
          <Text style={styles.labelText} numberOfLines={1} ellipsizeMode="tail">
            {item.category.name}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, {height, width}]}>
        {/* Y-axis grid lines */}
        <View style={[styles.gridLine, {top: 0}]} />
        <View style={[styles.gridLine, {top: height * 0.25}]} />
        <View style={[styles.gridLine, {top: height * 0.5}]} />
        <View style={[styles.gridLine, {top: height * 0.75}]} />
        <View style={[styles.gridLine, {top: height - 1}]} />

        {/* SVG path for line */}
        <View style={styles.svgContainer}>
          {/* Area under the line with gradient */}
          <View
            style={[
              styles.areaPath,
              {
                height,
                width,
                clipPath: `path('${generateAreaPath()}')`,
              },
            ]}
          />

          {/* The line itself */}
          <View
            style={[
              styles.linePath,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                height,
                width,
                borderColor: '#007BFF',
                clipPath: `path('${generatePath()}')`,
              },
            ]}
          />
        </View>

        {/* Data points */}
        {renderDataPoints()}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>{renderXLabels()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 20,
  },
  container: {
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    marginLeft: 20,
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  areaPath: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  linePath: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  tooltip: {
    position: 'absolute',
    top: -36,
    left: -40,
    width: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
    opacity: 0,
  },
  tooltipText: {
    color: 'white',
    fontSize: 10,
  },
  tooltipAmount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  xAxisContainer: {
    marginTop: 8,
    flexDirection: 'row',
    marginLeft: 20,
  },
  xLabel: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 70,
  },
});

export default LineChart;
