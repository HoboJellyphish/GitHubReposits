import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme';
import type { EntryType } from '@/types';

interface EntryDisplay {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const ENTRY_DISPLAY: Record<EntryType, EntryDisplay> = {
  SLEEP_START: { label: 'Went to sleep', icon: 'moon', color: colors.sleep },
  SLEEP_END: { label: 'Woke up', icon: 'sunny', color: colors.sleepAlt },
  NAP_START: {
    label: 'Started nap',
    icon: 'partly-sunny',
    color: colors.nap,
  },
  NAP_END: { label: 'Ended nap', icon: 'partly-sunny', color: colors.nap },
  MEDICATION: {
    label: 'Medication',
    icon: 'medical',
    color: colors.medication,
  },
};
