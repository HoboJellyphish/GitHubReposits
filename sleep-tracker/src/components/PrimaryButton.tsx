import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

interface PrimaryButtonProps {
  label: string;
  subLabel?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'large' | 'medium';
}

export function PrimaryButton({
  label,
  subLabel,
  icon,
  color,
  onPress,
  disabled,
  size = 'large',
}: PrimaryButtonProps) {
  const isLarge = size === 'large';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isLarge ? styles.buttonLarge : styles.buttonMedium,
        {
          backgroundColor: disabled ? colors.cardAlt : color,
          opacity: pressed ? 0.85 : disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={isLarge ? 30 : 24}
          color={disabled ? colors.textMuted : colors.background}
        />
      </View>
      <View style={styles.textWrap}>
        <Text
          style={[
            styles.label,
            isLarge && styles.labelLarge,
            { color: disabled ? colors.textMuted : colors.background },
          ]}
        >
          {label}
        </Text>
        {subLabel ? (
          <Text
            style={[
              styles.subLabel,
              { color: disabled ? colors.textMuted : colors.backgroundAlt },
            ]}
          >
            {subLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  buttonLarge: {
    paddingVertical: spacing.lg,
  },
  buttonMedium: {
    paddingVertical: spacing.md,
  },
  iconWrap: {
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    ...typography.button,
  },
  labelLarge: {
    fontSize: 20,
  },
  subLabel: {
    ...typography.caption,
    marginTop: 2,
  },
});
