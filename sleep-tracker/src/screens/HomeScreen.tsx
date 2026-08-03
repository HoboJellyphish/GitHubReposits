import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryRow } from '@/components/EntryRow';
import { MedicationModal } from '@/components/MedicationModal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusCard } from '@/components/StatusCard';
import { useLogs } from '@/context/LogsContext';
import { colors, spacing, typography } from '@/theme';

const RECENT_COUNT = 5;

export function HomeScreen() {
  const {
    entries,
    isAsleep,
    isNapping,
    currentSleepStart,
    currentNapStart,
    lastCompletedSleep,
    addEntry,
  } = useLogs();
  const [medModalVisible, setMedModalVisible] = useState(false);

  const handleSleepToggle = () => {
    addEntry({
      type: isAsleep ? 'SLEEP_END' : 'SLEEP_START',
      timestamp: Date.now(),
    });
  };

  const handleNapToggle = () => {
    addEntry({
      type: isNapping ? 'NAP_END' : 'NAP_START',
      timestamp: Date.now(),
    });
  };

  const recentEntries = entries.slice(0, RECENT_COUNT);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Sleep Tracker</Text>

        <StatusCard
          isAsleep={isAsleep}
          isNapping={isNapping}
          currentSleepStart={currentSleepStart}
          currentNapStart={currentNapStart}
          lastCompletedSleep={lastCompletedSleep}
        />

        <View style={styles.buttonGroup}>
          <PrimaryButton
            label={isAsleep ? 'Wake Up' : 'Go to Sleep'}
            subLabel={isAsleep ? undefined : 'Tap when you turn in for the night'}
            icon={isAsleep ? 'sunny' : 'moon'}
            color={colors.sleep}
            onPress={handleSleepToggle}
          />

          <PrimaryButton
            label={isNapping ? 'End Nap' : 'Start Nap'}
            subLabel={
              isAsleep
                ? 'Not available while asleep'
                : undefined
            }
            icon="partly-sunny"
            color={colors.nap}
            onPress={handleNapToggle}
            disabled={isAsleep}
            size="medium"
          />

          <PrimaryButton
            label="Log Medication"
            icon="medical"
            color={colors.medication}
            onPress={() => setMedModalVisible(true)}
            size="medium"
          />
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          {recentEntries.length === 0 ? (
            <Text style={styles.emptyText}>
              Nothing logged yet. Use the buttons above to get started.
            </Text>
          ) : (
            <View style={styles.recentList}>
              {recentEntries.map((entry, index) => (
                <View key={entry.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <EntryRow entry={entry} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <MedicationModal
        visible={medModalVisible}
        onClose={() => setMedModalVisible(false)}
        onSave={(data) => {
          addEntry({ type: 'MEDICATION', ...data });
          setMedModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  buttonGroup: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  recentSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  recentList: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 36 + spacing.md,
  },
});
