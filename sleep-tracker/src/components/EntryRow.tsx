import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ENTRY_DISPLAY } from '@/components/entryDisplay';
import { colors, radii, spacing, typography } from '@/theme';
import type { LogEntry } from '@/types';
import { formatTime } from '@/utils/time';

interface EntryRowProps {
  entry: LogEntry;
  onPress?: (entry: LogEntry) => void;
}

export function EntryRow({ entry, onPress }: EntryRowProps) {
  const display = ENTRY_DISPLAY[entry.type];
  const isMedication = entry.type === 'MEDICATION';

  const content = (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: display.color }]}>
        <Ionicons name={display.icon} size={18} color={colors.background} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>
          {isMedication && entry.medicationName
            ? entry.medicationName
            : display.label}
        </Text>
        {isMedication && (entry.dosage || entry.notes) ? (
          <Text style={styles.subLabel} numberOfLines={1}>
            {[entry.dosage, entry.notes].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </View>
      <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
      {onPress ? (
        <Ionicons
          name="create-outline"
          size={20}
          color={colors.moon}
          style={styles.editIcon}
        />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={() => onPress(entry)}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${display.label} at ${formatTime(entry.timestamp)}`}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  editIcon: {
    marginLeft: spacing.xs,
  },
});
