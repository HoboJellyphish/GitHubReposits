import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';
import { formatDuration, formatTime } from '@/utils/time';
import type { LogEntry } from '@/types';

interface StatusCardProps {
  isAsleep: boolean;
  isNapping: boolean;
  currentSleepStart: LogEntry | null;
  currentNapStart: LogEntry | null;
  lastCompletedSleep: { start: LogEntry; end: LogEntry } | null;
}

export function StatusCard({
  isAsleep,
  isNapping,
  currentSleepStart,
  currentNapStart,
  lastCompletedSleep,
}: StatusCardProps) {
  if (isAsleep && currentSleepStart) {
    return (
      <Status
        icon="moon"
        color={colors.sleep}
        title="Currently asleep"
        detail={`Since ${formatTime(currentSleepStart.timestamp)}`}
      />
    );
  }

  if (isNapping && currentNapStart) {
    return (
      <Status
        icon="partly-sunny"
        color={colors.nap}
        title="Currently napping"
        detail={`Since ${formatTime(currentNapStart.timestamp)}`}
      />
    );
  }

  if (lastCompletedSleep) {
    const duration = formatDuration(
      lastCompletedSleep.end.timestamp - lastCompletedSleep.start.timestamp
    );
    return (
      <Status
        icon="sunny"
        color={colors.medication}
        title="Awake"
        detail={`Last sleep: ${duration} · woke at ${formatTime(
          lastCompletedSleep.end.timestamp
        )}`}
      />
    );
  }

  return (
    <Status
      icon="sunny"
      color={colors.medication}
      title="Awake"
      detail="No sleep logged yet"
    />
  );
}

function Status({
  icon,
  color,
  title,
  detail,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Ionicons name={icon} size={26} color={colors.background} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  detail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
