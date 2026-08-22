import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomizeMedicationsModal } from '@/components/CustomizeMedicationsModal';
import { IconBubble } from '@/components/IconBubble';
import { MedicationPickerSheet } from '@/components/MedicationPickerSheet';
import { PillIcon } from '@/components/PillIcon';
import { useLogs } from '@/context/LogsContext';
import type { RootStackParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/theme';
import type { Medication } from '@/types';
import { formatDateTime } from '@/utils/time';

export function MedLogScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addEntry } = useLogs();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [customizeVisible, setCustomizeVisible] = useState(false);
  const [selected, setSelected] = useState<Medication | null>(null);
  const [dose, setDose] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const canSave = selected !== null;

  const handleSelectMedication = (medication: Medication) => {
    setSelected(medication);
    setDose(medication.defaultDose ?? '');
    setTimestamp(Date.now());
    setPickerVisible(false);
  };

  const handleSave = () => {
    if (!selected) return;
    addEntry({
      type: 'MEDICATION',
      timestamp,
      medicationName: selected.name,
      dosage: dose.trim() || undefined,
    });
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Medication Log</Text>
        <IconBubble
          accessibilityLabel="Customize your medications"
          size={44}
          backgroundColor={colors.card}
          iconColor={colors.moon}
          style={styles.customizeButton}
          customIcon={<Text style={styles.customizeLetter}>C</Text>}
          onPress={() => setCustomizeVisible(true)}
        />
      </View>

      <View style={styles.body}>
        <IconBubble
          accessibilityLabel="Pick a medication to log"
          size={96}
          backgroundColor={colors.card}
          customIcon={<PillIcon size={40} />}
          onPress={() => setPickerVisible(true)}
        />
        <Text style={styles.pickerCaption}>
          {selected ? 'Change medication' : 'Tap to choose a medication'}
        </Text>

        {selected ? (
          <View style={styles.entryCard}>
            <Text style={styles.entryName}>{selected.name}</Text>

            <Text style={styles.fieldLabel}>Dose</Text>
            <TextInput
              style={styles.input}
              value={dose}
              onChangeText={setDose}
              placeholder="e.g. 5mg"
              placeholderTextColor={colors.textMuted}
            />

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
      </View>

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
          accessibilityLabel="Save medication entry"
          icon="checkmark"
          size={60}
          backgroundColor={canSave ? colors.moon : colors.cardAlt}
          disabled={!canSave}
          onPress={handleSave}
        />
      </View>

      <MedicationPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectMedication}
        onAddNew={() => {
          setPickerVisible(false);
          setCustomizeVisible(true);
        }}
      />

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
    justifyContent: 'space-between',
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
  customizeButton: {},
  customizeLetter: {
    ...typography.heading,
    color: colors.moon,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  pickerCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
  entryName: {
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
    paddingBottom: spacing.md,
  },
});
