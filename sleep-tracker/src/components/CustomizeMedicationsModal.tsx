import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useMedicationCatalog } from '@/context/MedicationCatalogContext';
import { colors, radii, spacing, typography } from '@/theme';
import type { Medication } from '@/types';

interface CustomizeMedicationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CustomizeMedicationsModal({
  visible,
  onClose,
}: CustomizeMedicationsModalProps) {
  const { medications, addMedication, removeMedication } =
    useMedicationCatalog();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');

  const canAdd = name.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    addMedication({ name: name.trim(), defaultDose: dose.trim() || undefined });
    setName('');
    setDose('');
  };

  const handleRemove = (medication: Medication) => {
    Alert.alert(
      `Remove ${medication.name}?`,
      'This only removes it from your medication list — past log entries are unaffected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMedication(medication.id),
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Customize medications</Text>
          <Text style={styles.subtitle}>
            Add the medications you take so they're one tap to log.
          </Text>

          <FlatList
            data={medications}
            keyExtractor={(item) => item.id}
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No medications added yet.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.medRow}>
                <View style={styles.medTextWrap}>
                  <Text style={styles.medName}>{item.name}</Text>
                  {item.defaultDose ? (
                    <Text style={styles.medDose}>{item.defaultDose}</Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityLabel={`Remove ${item.name}`}
                  onPress={() => handleRemove(item)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            )}
          />

          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              value={name}
              onChangeText={setName}
              placeholder="Medication name"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, styles.doseInput]}
              value={dose}
              onChangeText={setDose}
              placeholder="Dose"
              placeholderTextColor={colors.textMuted}
            />
            <Pressable
              style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={!canAdd}
              accessibilityLabel="Add medication"
            >
              <Ionicons name="add" size={22} color={colors.background} />
            </Pressable>
          </View>

          <Pressable style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
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
    maxHeight: '80%',
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
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  list: {
    maxHeight: 260,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  medTextWrap: {
    flex: 1,
  },
  medName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  medDose: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
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
  nameInput: {
    flex: 2,
  },
  doseInput: {
    flex: 1,
  },
  addButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.moon,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  doneButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  doneButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});
