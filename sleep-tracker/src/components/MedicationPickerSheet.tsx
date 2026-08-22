import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useMedicationCatalog } from '@/context/MedicationCatalogContext';
import { colors, radii, spacing, typography } from '@/theme';
import type { Medication } from '@/types';

interface MedicationPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (medication: Medication) => void;
  onAddNew: () => void;
}

export function MedicationPickerSheet({
  visible,
  onClose,
  onSelect,
  onAddNew,
}: MedicationPickerSheetProps) {
  const { medications } = useMedicationCatalog();

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
          <Text style={styles.title}>Choose a medication</Text>

          {medications.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                You haven't added any medications yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={medications}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.medRow,
                    pressed && styles.medRowPressed,
                  ]}
                  onPress={() => onSelect(item)}
                >
                  <View>
                    <Text style={styles.medName}>{item.name}</Text>
                    {item.defaultDose ? (
                      <Text style={styles.medDose}>{item.defaultDose}</Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              )}
            />
          )}

          <Pressable style={styles.addNewButton} onPress={onAddNew}>
            <Ionicons name="add-circle-outline" size={18} color={colors.moon} />
            <Text style={styles.addNewText}>Add a medication</Text>
          </Pressable>
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
    maxHeight: '75%',
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
    marginBottom: spacing.sm,
  },
  list: {
    maxHeight: 320,
  },
  emptyWrap: {
    paddingVertical: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  medRowPressed: {
    opacity: 0.6,
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
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.card,
  },
  addNewText: {
    ...typography.body,
    color: colors.moon,
    fontWeight: '600',
  },
});
