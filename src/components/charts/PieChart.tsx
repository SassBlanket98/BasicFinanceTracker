// src/components/charts/PieChartCanvas.tsx
import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Canvas, useCanvasRef} from '@shopify/react-native-skia';
import {PieChartProps} from '../../types';

const PieChartCanvas: React.FC<PieChartProps> = ({data, size = 200}) => {
  const canvasRef = useCanvasRef();
  const filteredData = data.filter(item => item.amount > 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || filteredData.length === 0) {
      return;
    }

    const ctx = (canvas as any).getContext('2d');
    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;

    let startAngle = 0;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw pie slices
    filteredData.forEach(item => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = item.category.color;
      ctx.fill();

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Draw inner circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }, [canvasRef, filteredData, size]);

  if (filteredData.length === 0) {
    return (
      <View style={[styles.container, {width: size, height: size}]}>
        <View style={[styles.emptyCircle, {width: size, height: size}]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Canvas style={{width: size, height: size}} ref={canvasRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default PieChartCanvas;
