import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryRow } from '@/components/EntryRow';
import { IconBubble } from '@/components/IconBubble';
import { OptionsMenu } from '@/components/OptionsMenu';
import { PillIcon } from '@/components/PillIcon';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { useLogs } from '@/context/LogsContext';
import { usePreferences } from '@/context/PreferencesContext';
import type { RootStackParamList } from '@/navigation/types';
import { colors, sizes, spacing, typography } from '@/theme';
import { formatTime } from '@/utils/time';

const RECENT_COUNT = 5;

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { entries, isAsleep, currentSleepStart, addEntry } = useLogs();
  const { profile, isTutorialOpen, markTutorialSeen, openTutorial } =
    usePreferences();
  const [menuVisible, setMenuVisible] = useState(false);

  const recentEntries = entries.slice(0, RECENT_COUNT);

  const statusText = isAsleep && currentSleepStart
    ? `Asleep since ${formatTime(currentSleepStart.timestamp)}`
    : 'Awake';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {profile.name ? `Hi, ${profile.name}` : 'Sleep Tracker'}
          </Text>
          <Text style={styles.status}>{statusText}</Text>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonSlot}>
            <IconBubble
              accessibilityLabel="Log that you woke up"
              icon="eye"
              size={sizes.bubbleButton}
              backgroundColor={colors.moon}
              onPress={() => addEntry({ type: 'SLEEP_END', timestamp: Date.now() })}
            />
            <Text style={styles.buttonCaption}>Awake</Text>
          </View>

          <View style={styles.buttonSlot}>
            <IconBubble
              accessibilityLabel="Log that you're going to sleep"
              icon="eye-off"
              size={sizes.bubbleButton}
              backgroundColor={colors.sleep}
              iconColor={colors.textPrimary}
              onPress={() => addEntry({ type: 'SLEEP_START', timestamp: Date.now() })}
            />
            <Text style={styles.buttonCaption}>Sleep</Text>
          </View>

          <View style={styles.buttonSlot}>
            <IconBubble
              accessibilityLabel="Open medication log"
              customIcon={<PillIcon size={sizes.bubbleIcon} />}
              size={sizes.bubbleButton}
              backgroundColor={colors.card}
              onPress={() => navigation.navigate('MedLog')}
            />
            <Text style={styles.buttonCaption}>Medication</Text>
          </View>
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

      <View style={styles.bottomBar}>
        <IconBubble
          accessibilityLabel="Open options menu"
          icon="menu"
          size={52}
          backgroundColor={colors.card}
          iconColor={colors.textPrimary}
          onPress={() => setMenuVisible(true)}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open history"
          style={styles.historyAffordance}
          onPress={() => navigation.navigate('History')}
        >
          <Ionicons name="chevron-up" size={16} color={colors.textMuted} />
          <Text style={styles.historyAffordanceText}>History</Text>
        </Pressable>

        <View style={styles.bottomBarSpacer} />
      </View>

      <OptionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onReplayTutorial={openTutorial}
      />

      <TutorialOverlay visible={isTutorialOpen} onFinish={markTutorialSeen} />
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
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.title,
    color: colors.textPrimary,
  },
  status: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonSlot: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
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
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  bottomBarSpacer: {
    width: 52,
  },
  historyAffordance: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  historyAffordanceText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
