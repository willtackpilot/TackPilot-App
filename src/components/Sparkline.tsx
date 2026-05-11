import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { C } from '../constants/theme';

type Props = {
  /** Series of numeric values. <2 points renders nothing. */
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
};

/**
 * Minimal stroke-only sparkline. No axes, no fill, no labels — just
 * a polyline normalized to the bounding box. Designed to sit inline
 * next to a hero number, not stand alone.
 */
export default function Sparkline({
  data,
  width = 80,
  height = 24,
  stroke = C.ink,
  strokeWidth = 1.5,
}: Props) {
  const points = useMemo(() => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = data.length > 1 ? width / (data.length - 1) : 0;
    return data
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (!points) {
    return <View style={{ width, height }} />;
  }

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
