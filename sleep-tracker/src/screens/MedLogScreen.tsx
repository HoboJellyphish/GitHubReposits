import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomizeMedicationsModal } from '@/components/CustomizeMedicationsModal';
import { IconBubble } from '@/components/IconBubble';
import { PillIcon } from '@/components/PillIcon';
import { useLogs } from '@/context/LogsContext';
import { useMedicationCatalog } from '@/context/MedicationCatalogContext';
import type { RootStackParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/theme';
import { formatDateTime } from '@/utils/time';

function chipLabel(name: string, dose?: string): string {
  const abbrev = name.trim().slice(0, 3).toUpperCase();
  return dose ? `${abbrev} ${dose}` : abbrev;
}

export function MedLogScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addEntry } = useLogs();
  const { medications } = useMedicationCatalog();

  const [customizeVisible, setCustomizeVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [doses, setDoses] = useState<Record<string, string>>({});
  const [timestamp, setTimestamp] = useState(Date.now());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const canSave = selectedIds.length > 0;

  const toggleMedication = (id: string, defaultDose?: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((existingId) => existingId !== id);
      }
      setDoses((d) => ({ ...d, [id]: d[id] ?? defaultDose ?? '' }));
      return [...current, id];
    });
    if (selectedIds.length === 0) {
      setTimestamp(Date.now());
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    for (const id of selectedIds) {
      const medication = medications.find((m) => m.id === id);
      if (!medication) continue;
      addEntry({
        type: 'MEDICATION',
        timestamp,
        medicationName: medication.name,
        dosage: doses[id]?.trim() || undefined,
      });
    }
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Medication Log</Text>
        <IconBubble
          accessibilityLabel="Customize your medications"
          size={44}
          backgroundColor={colors.card}
          iconColor={colors.moon}
          customIcon={<Text style={styles.customizeLetter}>C</Text>}
          onPress={() => setCustomizeVisible(true)}
        />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionHeadingRow}>
          <PillIcon size={20} />
          <Text style={styles.sectionHeading}>Choose medications</Text>
        </View>

        {medications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              You haven't added any medications yet.
            </Text>
            <Pressable
              style={styles.addFirstButton}
              onPress={() => setCustomizeVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.moon} />
              <Text style={styles.addFirstButtonText}>Add a medication</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.chipRow}>
            {medications.map((medication) => {
              const isSelected = selectedIds.includes(medication.id);
              return (
                <Pressable
                  key={medication.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle ${medication.name}`}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() =>
                    toggleMedication(medication.id, medication.defaultDose)
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {chipLabel(medication.name, medication.defaultDose)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {selectedIds.length > 0 ? (
          <View style={styles.entryCard}>
            {selectedIds.map((id) => {
              const medication = medications.find((m) => m.id === id);
              if (!medication) return null;
              return (
                <View key={id} style={styles.medEntry}>
                  <Text style={styles.entryName}>{medication.name}</Text>
                  <Text style={styles.fieldLabel}>Dose</Text>
                  <TextInput
                    style={styles.input}
                    value={doses[id] ?? ''}
                    onChangeText={(text) =>
                      setDoses((d) => ({ ...d, [id]: text }))
                    }
                    placeholder="e.g. 5mg"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              );
            })}

            <Text style={styles.fieldLabel}>Time</Text>
            <Pressable
              style={styles.timeButton}
              onPress={() => setShowTimePicker((s) => !s)}
            >
              <Ionicons name="time-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.timeButtonText}>
                {formatDateTime(timestamp)}
              </Text>
            </Pressable>
            {showTimePicker ? (
              <DateTimePicker
                value={new Date(timestamp)}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  if (Platform.OS === 'android') setShowTimePicker(false);
                  if (date) setTimestamp(date.getTime());
                }}
                themeVariant="dark"
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

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
          accessibilityLabel="Save medication entries"
          icon="checkmark"
          size={60}
          backgroundColor={canSave ? colors.moon : colors.cardAlt}
          disabled={!canSave}
          onPress={handleSave}
        />
      </View>

      <CustomizeMedicationsModal
        visible={customizeVisible}
        onClose={() => setCustomizeVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  topBarTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  customizeLetter: {
    ...typography.heading,
    color: colors.moon,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  emptyWrap: {
    alignItems: 'flex-start',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  addFirstButtonText: {
    ...typography.body,
    color: colors.moon,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    maxWidth: 160,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.moon,
    borderColor: colors.moon,
  },
  chipText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.background,
  },
  entryCard: {
    width: '100%',
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  medEntry: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  entryName: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
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
    backgroundColor: colors.backgroundAlt,
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
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
