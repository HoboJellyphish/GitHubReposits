import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

interface TutorialStep {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  placement: 'top' | 'middle' | 'bottom';
}

const STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Sleep Tracker',
    body: "A quick look around before you start — this only takes a few seconds.",
    icon: 'moon',
    placement: 'middle',
  },
  {
    title: 'One tap to log',
    body: 'Tap the open eye the moment you wake up, the closed eye when you go to sleep, and the pill whenever you take a medication.',
    icon: 'eye',
    placement: 'top',
  },
  {
    title: 'Recent activity',
    body: 'Everything you log shows up right below the buttons. Tap the pencil on any entry to fix a time or details later.',
    icon: 'create-outline',
    placement: 'middle',
  },
  {
    title: 'Menu',
    body: 'The menu in the bottom-left holds your name and lets you replay this tutorial anytime.',
    icon: 'menu',
    placement: 'bottom',
  },
  {
    title: 'Your full history',
    body: 'Tap or swipe up from the bottom to see everything you’ve logged, and export it as a spreadsheet, PDF, or text file.',
    icon: 'time-outline',
    placement: 'bottom',
  },
];

interface TutorialOverlayProps {
  visible: boolean;
  onFinish: () => void;
}

export function TutorialOverlay({ visible, onFinish }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);

  if (!visible) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setStepIndex(0);
      onFinish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    setStepIndex(0);
    onFinish();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.cardWrap,
            step.placement === 'top' && styles.placeTop,
            step.placement === 'middle' && styles.placeMiddle,
            step.placement === 'bottom' && styles.placeBottom,
          ]}
        >
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name={step.icon} size={22} color={colors.background} />
            </View>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.body}>{step.body}</Text>

            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === stepIndex && styles.dotActive]}
                />
              ))}
            </View>

            <View style={styles.actions}>
              <Pressable onPress={handleSkip} hitSlop={8}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
              <Pressable style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {isLast ? 'Got it' : 'Next'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,6,20,0.72)',
  },
  cardWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  placeTop: {
    justifyContent: 'flex-start',
    paddingTop: 130,
  },
  placeMiddle: {
    justifyContent: 'center',
  },
  placeBottom: {
    justifyContent: 'flex-end',
    paddingBottom: 130,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.moon,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.moon,
    width: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipText: {
    ...typography.body,
    color: colors.textMuted,
  },
  nextButton: {
    backgroundColor: colors.moon,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
