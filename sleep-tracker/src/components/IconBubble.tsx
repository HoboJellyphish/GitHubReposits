import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { radii } from '@/theme';

interface IconBubbleProps {
  onPress: () => void;
  accessibilityLabel: string;
  icon?: keyof typeof Ionicons.glyphMap;
  customIcon?: React.ReactNode;
  size?: number;
  iconSize?: number;
  backgroundColor: string;
  iconColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconBubble({
  onPress,
  accessibilityLabel,
  icon,
  customIcon,
  size = 56,
  iconSize,
  backgroundColor,
  iconColor = '#0B1026',
  disabled,
  style,
}: IconBubbleProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: radii.pill,
          backgroundColor,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.iconWrap}>
        {customIcon ??
          (icon ? (
            <Ionicons name={icon} size={iconSize ?? size * 0.45} color={iconColor} />
          ) : null)}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
