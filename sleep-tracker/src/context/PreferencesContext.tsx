import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  loadHasSeenTutorial,
  loadProfile,
  saveHasSeenTutorial,
  saveProfile,
} from '@/storage/preferencesStorage';
import type { UserProfile } from '@/types';

interface PreferencesContextValue {
  profile: UserProfile;
  isLoading: boolean;
  updateProfile: (changes: Partial<UserProfile>) => Promise<void>;
  hasSeenTutorial: boolean;
  markTutorialSeen: () => Promise<void>;
  /** Set by "Replay Tutorial" in the menu to force the overlay open again. */
  isTutorialOpen: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined
);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadProfile(), loadHasSeenTutorial()]).then(
      ([loadedProfile, seen]) => {
        if (!mounted) return;
        setProfile(loadedProfile);
        setHasSeenTutorial(seen);
        setIsTutorialOpen(!seen);
        setIsLoading(false);
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const updateProfile = useCallback(
    async (changes: Partial<UserProfile>) => {
      const next = { ...profile, ...changes };
      setProfile(next);
      await saveProfile(next);
    },
    [profile]
  );

  const markTutorialSeen = useCallback(async () => {
    setHasSeenTutorial(true);
    setIsTutorialOpen(false);
    await saveHasSeenTutorial(true);
  }, []);

  const openTutorial = useCallback(() => setIsTutorialOpen(true), []);
  const closeTutorial = useCallback(() => setIsTutorialOpen(false), []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      profile,
      isLoading,
      updateProfile,
      hasSeenTutorial,
      markTutorialSeen,
      isTutorialOpen,
      openTutorial,
      closeTutorial,
    }),
    [
      profile,
      isLoading,
      updateProfile,
      hasSeenTutorial,
      markTutorialSeen,
      isTutorialOpen,
      openTutorial,
      closeTutorial,
    ]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
}
