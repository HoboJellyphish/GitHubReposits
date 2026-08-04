// On-device persistence only. No network calls, analytics, or telemetry.
// Backed by localStorage today; the load/save boundary here is the only
// place that would need to change to swap in IndexedDB later.
import type { AppDatabase } from "@/types";

const STORAGE_KEY = "family-health-tracker:db:v1";

export function createEmptyDatabase(): AppDatabase {
  return {
    profiles: [],
    logEntries: [],
    medications: [],
    medicationDoses: [],
    wearableConnections: [],
    profilePreferences: [],
    documents: [],
    activeProfileId: null,
  };
}

export function loadDatabase(): AppDatabase {
  if (typeof localStorage === "undefined") return createEmptyDatabase();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyDatabase();
    const parsed = JSON.parse(raw) as Partial<AppDatabase>;
    return { ...createEmptyDatabase(), ...parsed };
  } catch {
    return createEmptyDatabase();
  }
}

export function saveDatabase(db: AppDatabase): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch {
    // Storage full (large document uploads are the most likely cause) or
    // unavailable; the in-memory state still reflects the attempted change,
    // callers surface storageError so the UI can warn and let the user
    // free up space.
    return false;
  }
}
