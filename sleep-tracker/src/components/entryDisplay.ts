import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme';
import type { EntryType } from '@/types';

interface EntryDisplay {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const ENTRY_DISPLAY: Record<EntryType, EntryDisplay> = {
  SLEEP_START: { label: 'Went to sleep', icon: 'eye-off', color: colors.sleep },
  SLEEP_END: { label: 'Woke up', icon: 'eye', color: colors.sleepAlt },
  MEDICATION: {
    label: 'Medication',
    icon: 'medical',
    color: colors.medication,
  },
};
