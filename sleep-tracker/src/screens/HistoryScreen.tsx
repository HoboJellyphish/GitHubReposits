import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditEntryModal } from '@/components/EditEntryModal';
import { EntryRow } from '@/components/EntryRow';
import { ExportSheet } from '@/components/ExportSheet';
import { IconBubble } from '@/components/IconBubble';
import { useLogs } from '@/context/LogsContext';
import type { RootStackParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/theme';
import type { LogEntry } from '@/types';
import { dayKey, formatDateLabel } from '@/utils/time';

interface Section {
  title: string;
  key: string;
  data: LogEntry[];
}

export function HistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { entries, updateEntry, deleteEntry } = useLogs();
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [exportVisible, setExportVisible] = useState(false);

  const sections = useMemo<Section[]>(() => {
    const groups = new Map<string, LogEntry[]>();
    for (const entry of entries) {
      const key = dayKey(entry.timestamp);
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    }
    return Array.from(groups.entries())
      .map(([key, data]) => ({
        key,
        title: formatDateLabel(data[0].timestamp),
        data,
      }))
      .sort((a, b) => b.data[0].timestamp - a.data[0].timestamp);
  }, [entries]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Text style={styles.header}>History</Text>
      {sections.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            No entries yet. Everything you log will show up here for
            review and editing.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item, index, section }) => {
            const isFirst = index === 0;
            const isLast = index === section.data.length - 1;
            return (
              <View
                style={[
                  styles.rowWrap,
                  isFirst && styles.rowWrapFirst,
                  isLast && styles.rowWrapLast,
                ]}
              >
                {index > 0 ? <View style={styles.divider} /> : null}
                <EntryRow entry={item} onPress={setSelectedEntry} />
              </View>
            );
          }}
          renderSectionFooter={() => <View style={styles.sectionFooter} />}
        />
      )}

      <View style={styles.bottomBar}>
        <IconBubble
          accessibilityLabel="Back to home"
          icon="home"
          size={52}
          backgroundColor={colors.card}
          iconColor={colors.textPrimary}
          onPress={() => navigation.navigate('Home')}
        />
        <IconBubble
          accessibilityLabel="Download history"
          icon="download-outline"
          size={52}
          backgroundColor={colors.moon}
          disabled={entries.length === 0}
          onPress={() => setExportVisible(true)}
        />
        <View style={styles.bottomBarSpacer} />
      </View>

      <EditEntryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onSave={(id, changes) => {
          updateEntry(id, changes);
          setSelectedEntry(null);
        }}
        onDelete={(id) => {
          deleteEntry(id);
          setSelectedEntry(null);
        }}
      />

      <ExportSheet
        visible={exportVisible}
        onClose={() => setExportVisible(false)}
        entries={entries}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    ...typography.title,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  sectionHeader: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionFooter: {
    height: spacing.sm,
  },
  rowWrap: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  rowWrapFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  rowWrapLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 36 + spacing.md,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bottomBarSpacer: {
    width: 52,
  },
});
