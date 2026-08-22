import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Medication } from '@/types';

const STORAGE_KEY = 'sleep-tracker/medications/v1';

export async function loadMedications(): Promise<Medication[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Medication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveMedications(medications: Medication[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
}
