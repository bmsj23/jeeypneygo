import React, { memo } from 'react';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';

interface JeepneySvgProps {
  size?: number;
  color?: string;
  shadowColor?: string;
}

// realistic top-down jeepney icon with 3d-like appearance
function JeepneySvgComponent({ size = 48, color = '#FFB800', shadowColor = 'rgba(0,0,0,0.3)' }: JeepneySvgProps) {
  // calculate darker shade for roof details
  const darkerColor = adjustBrightness(color, -30);
  const lighterColor = adjustBrightness(color, 20);

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* gradient for 3d roof effect */}
        <LinearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={lighterColor} />
          <Stop offset="50%" stopColor={color} />
          <Stop offset="100%" stopColor={darkerColor} />
        </LinearGradient>
        {/* shadow gradient */}
        <LinearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={shadowColor} stopOpacity="0.4" />
          <Stop offset="100%" stopColor={shadowColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* drop shadow ellipse */}
      <Ellipse cx="32" cy="58" rx="18" ry="4" fill="url(#shadowGradient)" />

      {/* jeepney body - main rectangle with rounded corners */}
      <G>
        {/* body base (darker for depth) */}
        <Rect
          x="14"
          y="12"
          width="36"
          height="44"
          rx="6"
          ry="6"
          fill={darkerColor}
        />

        {/* body top layer (roof) */}
        <Rect
          x="16"
          y="14"
          width="32"
          height="40"
          rx="5"
          ry="5"
          fill="url(#roofGradient)"
        />

        {/* windshield (front - top of jeepney when moving forward) */}
        <Rect
          x="20"
          y="16"
          width="24"
          height="8"
          rx="2"
          ry="2"
          fill="#1A237E"
          opacity="0.8"
        />

        {/* roof rails - left */}
        <Rect x="18" y="26" width="2" height="20" rx="1" fill={darkerColor} />

        {/* roof rails - right */}
        <Rect x="44" y="26" width="2" height="20" rx="1" fill={darkerColor} />

        {/* roof decoration lines */}
        <Rect x="22" y="28" width="20" height="2" rx="1" fill={lighterColor} opacity="0.6" />
        <Rect x="22" y="34" width="20" height="2" rx="1" fill={lighterColor} opacity="0.6" />
        <Rect x="22" y="40" width="20" height="2" rx="1" fill={lighterColor} opacity="0.6" />

        {/* rear window (back of jeepney) */}
        <Rect
          x="22"
          y="46"
          width="20"
          height="6"
          rx="2"
          ry="2"
          fill="#1A237E"
          opacity="0.6"
        />

        {/* wheels - front left */}
        <Circle cx="18" cy="20" r="4" fill="#333333" />
        <Circle cx="18" cy="20" r="2" fill="#666666" />

        {/* wheels - front right */}
        <Circle cx="46" cy="20" r="4" fill="#333333" />
        <Circle cx="46" cy="20" r="2" fill="#666666" />

        {/* wheels - rear left */}
        <Circle cx="18" cy="48" r="4" fill="#333333" />
        <Circle cx="18" cy="48" r="2" fill="#666666" />

        {/* wheels - rear right */}
        <Circle cx="46" cy="48" r="4" fill="#333333" />
        <Circle cx="46" cy="48" r="2" fill="#666666" />

        {/* headlights (front indicators) */}
        <Circle cx="24" cy="14" r="2" fill="#FFEB3B" />
        <Circle cx="40" cy="14" r="2" fill="#FFEB3B" />

        {/* direction indicator - arrow pointing up (forward) */}
        <Path
          d="M32 8 L36 12 L33 12 L33 14 L31 14 L31 12 L28 12 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </G>
    </Svg>
  );
}

// helper to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export const JeepneySvg = memo(JeepneySvgComponent);

// color variants for different routes
export const ROUTE_COLORS = {
  red: '#E53935',
  yellow: '#FFB800',
  orange: '#FF9800',
  yellowOrange: '#FFC107',
  green: '#4CAF50',
  blue: '#2196F3',
  purple: '#9C27B0',
} as const;

export type RouteColorKey = keyof typeof ROUTE_COLORS;
