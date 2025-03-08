// src/components/charts/DonutChart.tsx
import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Circle, G, Text as SvgText} from 'react-native-svg';
import {CategorySpending} from '../../types';
import {formatCurrency} from '../../utils/calculations';

interface DonutChartProps {
  data: CategorySpending[];
  size?: number;
  thickness?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  thickness = 60,
}) => {
  // Filter out any data with 0 or negative values
  const filteredData = data.filter(item => item.amount > 0);

  // If no data, show empty circle
  if (filteredData.length === 0) {
    return (
      <View style={[styles.container, {width: size, height: size}]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - thickness / 2}
            stroke="#E5E5E5"
            strokeWidth={thickness}
            fill="none"
          />
          <SvgText
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#999"
            dy="5">
            No Data
          </SvgText>
        </Svg>
      </View>
    );
  }

  // Calculate total for percentage
  const total = filteredData.reduce((sum, item) => sum + item.amount, 0);

  // Calculate center and radius
  const center = size / 2;
  const radius = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segments
  let segments: {
    percentage: number;
    segmentLength: number;
    offset: number;
    color: string;
    amount: number;
    name: string;
    labelX: number;
    labelY: number;
    midAngle: number;
  }[] = [];
  let cumulativePercentage = 0;

  filteredData.forEach(item => {
    const percentage = item.amount / total;
    const segmentLength = percentage * circumference;

    // Calculate offset
    const offset = cumulativePercentage * circumference;

    // Calculate start and end angles for label positioning
    const startAngle = cumulativePercentage * 2 * Math.PI - Math.PI / 2;
    const endAngle =
      (cumulativePercentage + percentage) * 2 * Math.PI - Math.PI / 2;

    // Calculate middle angle for label positioning
    const midAngle = (startAngle + endAngle) / 2;

    // Calculate position for label (positioned at the middle of the donut ring)
    const labelRadius = radius - thickness / 2;
    const labelX = center + labelRadius * Math.cos(midAngle);
    const labelY = center + labelRadius * Math.sin(midAngle);

    segments.push({
      percentage,
      segmentLength,
      offset,
      color: item.category.color,
      amount: item.amount,
      name: item.category.name,
      labelX,
      labelY,
      midAngle,
    });

    cumulativePercentage += percentage;
  });

  // Calculate total to display in center
  const totalFormatted = formatCurrency(total);

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {segments.map((segment, index) => (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${segment.segmentLength} ${
                circumference - segment.segmentLength
              }`}
              strokeDashoffset={-segment.offset}
              fill="none"
            />
          ))}
        </G>

        {/* Add segment labels */}
        {segments.map((segment, index) => {
          // Only show labels for segments that are at least 10% (to avoid crowding)
          if (segment.percentage < 0.1) {
            return null;
          }

          const percentText = `${Math.round(segment.percentage * 100)}%`;
          const amountText = `R${formatCurrency(segment.amount)}`;

          // Determine text color - use white for darker segments
          const textColor = '#333';

          // Adjust text anchor based on position in the circle
          const textAnchor =
            segment.labelX > center + 10
              ? 'start'
              : segment.labelX < center - 10
              ? 'end'
              : 'middle';

          return (
            <G key={`label-${index}`}>
              {/* Background to improve readability */}
              <Circle
                cx={segment.labelX}
                cy={segment.labelY}
                r={20}
                fill="white"
                opacity={0.7}
              />
              {/* Percentage text */}
              <SvgText
                x={segment.labelX}
                y={segment.labelY - 6}
                fontSize="12"
                fontWeight="bold"
                fill={textColor}
                textAnchor={textAnchor}>
                {percentText}
              </SvgText>
              {/* Amount text */}
              <SvgText
                x={segment.labelX}
                y={segment.labelY + 10}
                fontSize="10"
                fill={textColor}
                textAnchor={textAnchor}>
                {amountText}
              </SvgText>
            </G>
          );
        })}

        {/* Remove the white circle background */}

        {/* Title text "Total" */}
        <SvgText
          x={center}
          y={center - 10}
          textAnchor="middle"
          fill="#666"
          fontSize="14">
          Total
        </SvgText>

        {/* Center the currency display with improved positioning */}
        <SvgText
          x={center - 30}
          y={center + 16}
          textAnchor="end"
          fill="#333"
          fontSize="18"
          fontWeight="bold">
          R
        </SvgText>
        <SvgText
          x={center - 20}
          y={center + 16}
          textAnchor="start"
          fill="#333"
          fontSize="18"
          fontWeight="bold">
          {totalFormatted}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DonutChart;
