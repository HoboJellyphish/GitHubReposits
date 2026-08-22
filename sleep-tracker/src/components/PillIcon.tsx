import React from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Defs, Line, Rect } from 'react-native-svg';

import { colors } from '@/theme';

interface PillIconProps {
  size?: number;
}

/** A two-tone capsule (red/blue), drawn rather than using a generic
 * cross/kit glyph so it reads unmistakably as "pill" at a glance. */
export function PillIcon({ size = 28 }: PillIconProps) {
  const width = size;
  const height = size * 0.52;
  const radius = height / 2;

  return (
    <View style={{ transform: [{ rotate: '-45deg' }] }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <ClipPath id="capsuleClip">
            <Rect x={0} y={0} width={width} height={height} rx={radius} ry={radius} />
          </ClipPath>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={width / 2}
          height={height}
          fill={colors.capsuleBlue}
          clipPath="url(#capsuleClip)"
        />
        <Rect
          x={width / 2}
          y={0}
          width={width / 2}
          height={height}
          fill={colors.capsuleRed}
          clipPath="url(#capsuleClip)"
        />
        <Line
          x1={width / 2}
          y1={0}
          x2={width / 2}
          y2={height}
          stroke={colors.background}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}
