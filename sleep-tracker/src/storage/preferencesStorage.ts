import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserProfile } from '@/types';

const PROFILE_KEY = 'sleep-tracker/profile/v1';
const TUTORIAL_KEY = 'sleep-tracker/hasSeenTutorial/v1';

export async function loadProfile(): Promise<UserProfile> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return {};
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadHasSeenTutorial(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(TUTORIAL_KEY);
  return raw === 'true';
}

export async function saveHasSeenTutorial(seen: boolean): Promise<void> {
  await AsyncStorage.setItem(TUTORIAL_KEY, seen ? 'true' : 'false');
}
