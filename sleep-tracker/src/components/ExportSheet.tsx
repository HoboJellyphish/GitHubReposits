import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';
import { exportAsExcel, exportAsMarkdown, exportAsPdf } from '@/utils/export';
import type { LogEntry } from '@/types';

interface ExportSheetProps {
  visible: boolean;
  onClose: () => void;
  entries: LogEntry[];
}

type ExportFormat = 'excel' | 'pdf' | 'markdown';

const OPTIONS: {
  format: ExportFormat;
  label: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    format: 'excel',
    label: 'Excel spreadsheet',
    detail: '.xlsx',
    icon: 'grid-outline',
  },
  {
    format: 'pdf',
    label: 'PDF document',
    detail: '.pdf',
    icon: 'document-text-outline',
  },
  {
    format: 'markdown',
    label: 'Text file',
    detail: '.md',
    icon: 'reader-outline',
  },
];

export function ExportSheet({ visible, onClose, entries }: ExportSheetProps) {
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(
    null
  );

  const handleExport = async (format: ExportFormat) => {
    setPendingFormat(format);
    try {
      if (format === 'excel') await exportAsExcel(entries);
      else if (format === 'pdf') await exportAsPdf(entries);
      else await exportAsMarkdown(entries);
    } finally {
      setPendingFormat(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Export history</Text>
          <Text style={styles.subtitle}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </Text>

          {OPTIONS.map((option) => (
            <Pressable
              key={option.format}
              style={({ pressed }) => [
                styles.optionRow,
                pressed && styles.optionRowPressed,
              ]}
              disabled={pendingFormat !== null}
              onPress={() => handleExport(option.format)}
            >
              <View style={styles.optionIconCircle}>
                <Ionicons name={option.icon} size={20} color={colors.background} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDetail}>{option.detail}</Text>
              </View>
              {pendingFormat === option.format ? (
                <Text style={styles.optionWorking}>Preparing…</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4,6,20,0.6)',
  },
  sheet: {
    backgroundColor: colors.backgroundAlt,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  optionRowPressed: {
    opacity: 0.6,
  },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.moon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionDetail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  optionWorking: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
