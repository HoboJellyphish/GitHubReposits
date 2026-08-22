import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { usePreferences } from '@/context/PreferencesContext';
import { colors, radii, spacing, typography } from '@/theme';

interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onReplayTutorial: () => void;
}

export function OptionsMenu({
  visible,
  onClose,
  onReplayTutorial,
}: OptionsMenuProps) {
  const { profile, updateProfile } = usePreferences();
  const [name, setName] = useState(profile.name ?? '');

  useEffect(() => {
    if (visible) setName(profile.name ?? '');
  }, [visible, profile.name]);

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
          <Text style={styles.title}>Options</Text>

          <Text style={styles.fieldLabel}>Your name (optional)</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            onBlur={() => updateProfile({ name: name.trim() || undefined })}
            placeholder="Add your name"
            placeholderTextColor={colors.textMuted}
          />

          <Pressable
            style={styles.row}
            onPress={() => {
              onClose();
              onReplayTutorial();
            }}
          >
            <Ionicons name="play-circle-outline" size={20} color={colors.moon} />
            <Text style={styles.rowText}>Replay tutorial</Text>
          </Pressable>

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
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  rowText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
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
