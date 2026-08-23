import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SleepEyeIconProps {
  size?: number;
  color?: string;
}

/** A closed eye with a few short eyelash lines, drawn rather than using a
 * generic "hidden/off" glyph so it reads unmistakably as "sleep". */
export function SleepEyeIcon({ size = 28, color = '#F4F6FF' }: SleepEyeIconProps) {
  const height = size * 0.62;

  return (
    <Svg width={size} height={height} viewBox="0 0 32 20">
      <Path
        d="M3 10 Q16 18 29 10"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M9 15.5 L7 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M16 17 L16 20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M23 15.5 L25 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
