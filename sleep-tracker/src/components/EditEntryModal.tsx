import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ENTRY_DISPLAY } from '@/components/entryDisplay';
import { colors, radii, spacing, typography } from '@/theme';
import type { LogEntry, NewLogEntry } from '@/types';
import { formatDateTime } from '@/utils/time';

interface EditEntryModalProps {
  entry: LogEntry | null;
  onClose: () => void;
  onSave: (id: string, changes: Partial<NewLogEntry>) => void;
  onDelete: (id: string) => void;
}

export function EditEntryModal({
  entry,
  onClose,
  onSave,
  onDelete,
}: EditEntryModalProps) {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (entry) {
      setTimestamp(entry.timestamp);
      setName(entry.medicationName ?? '');
      setDosage(entry.dosage ?? '');
      setNotes(entry.notes ?? '');
      setShowPicker(false);
    }
  }, [entry]);

  if (!entry) return null;

  const isMedication = entry.type === 'MEDICATION';
  const display = ENTRY_DISPLAY[entry.type];
  const canSave = !isMedication || name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(entry.id, {
      timestamp,
      ...(isMedication
        ? {
            medicationName: name.trim(),
            dosage: dosage.trim() || undefined,
            notes: notes.trim() || undefined,
          }
        : {}),
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete entry?',
      'This will permanently remove this log entry.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(entry.id),
        },
      ]
    );
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit {display.label.toLowerCase()}</Text>

          {isMedication ? (
            <>
              <Text style={styles.fieldLabel}>Medication name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Melatonin"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Dosage (optional)</Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g. 5mg"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. taken with water"
                placeholderTextColor={colors.textMuted}
              />
            </>
          ) : null}

          <Text style={styles.fieldLabel}>Time</Text>
          <Pressable
            style={styles.timeButton}
            onPress={() => setShowPicker((s) => !s)}
          >
            <Ionicons name="time-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.timeButtonText}>
              {formatDateTime(timestamp)}
            </Text>
          </Pressable>
          {showPicker ? (
            <DateTimePicker
              value={new Date(timestamp)}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                if (Platform.OS === 'android') setShowPicker(false);
                if (date) setTimestamp(date.getTime());
              }}
              themeVariant="dark"
            />
          ) : null}

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={styles.deleteButtonText}>Delete entry</Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
    fontSize: 16,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  timeButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  deleteButtonText: {
    ...typography.body,
    color: colors.danger,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.sleep,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
