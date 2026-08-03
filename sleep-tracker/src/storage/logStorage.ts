import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LogEntry } from '@/types';

const STORAGE_KEY = 'sleep-tracker/entries/v1';

export async function loadEntries(): Promise<LogEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: LogEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
