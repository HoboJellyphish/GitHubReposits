import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { loadEntries, saveEntries } from '@/storage/logStorage';
import type { EntryType, LogEntry, NewLogEntry } from '@/types';
import { generateId } from '@/utils/id';

interface LogsContextValue {
  entries: LogEntry[];
  isLoading: boolean;
  isAsleep: boolean;
  currentSleepStart: LogEntry | null;
  lastCompletedSleep: { start: LogEntry; end: LogEntry } | null;
  addEntry: (entry: NewLogEntry) => Promise<LogEntry>;
  updateEntry: (id: string, changes: Partial<NewLogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearAllEntries: () => Promise<void>;
}

const LogsContext = createContext<LogsContextValue | undefined>(undefined);

function sortDesc(entries: LogEntry[]): LogEntry[] {
  return [...entries].sort((a, b) => b.timestamp - a.timestamp);
}

function mostRecentOfTypes(
  entries: LogEntry[],
  types: EntryType[]
): LogEntry | null {
  const filtered = entries.filter((e) => types.includes(e.type));
  if (filtered.length === 0) return null;
  return sortDesc(filtered)[0];
}

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadEntries().then((loaded) => {
      if (mounted) {
        setEntries(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Persisting from a separate effect (rather than inline in each mutator)
  // means every mutator can use the functional setState form below, so
  // several calls fired in the same tick (e.g. saving a batch of
  // medications) each build on the latest pending state instead of
  // clobbering one another.
  useEffect(() => {
    if (isLoading) return;
    saveEntries(entries).catch(() => {
      // Best-effort persistence; in-memory state still reflects the change.
    });
  }, [entries, isLoading]);

  const addEntry = useCallback(async (entry: NewLogEntry) => {
    const now = Date.now();
    const newEntry: LogEntry = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      ...entry,
    };
    setEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const updateEntry = useCallback(
    async (id: string, changes: Partial<NewLogEntry>) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...changes, updatedAt: Date.now() } : e
        )
      );
    },
    []
  );

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAllEntries = useCallback(async () => {
    setEntries([]);
  }, []);

  const value = useMemo<LogsContextValue>(() => {
    const sorted = sortDesc(entries);

    const lastSleepEvent = mostRecentOfTypes(sorted, [
      'SLEEP_START',
      'SLEEP_END',
    ]);
    const isAsleep = lastSleepEvent?.type === 'SLEEP_START';
    const currentSleepStart = isAsleep ? lastSleepEvent : null;

    let lastCompletedSleep: { start: LogEntry; end: LogEntry } | null = null;
    const sleepEvents = sorted
      .filter((e) => e.type === 'SLEEP_START' || e.type === 'SLEEP_END')
      .sort((a, b) => b.timestamp - a.timestamp);
    for (let i = 0; i < sleepEvents.length - 1; i++) {
      if (
        sleepEvents[i].type === 'SLEEP_END' &&
        sleepEvents[i + 1].type === 'SLEEP_START'
      ) {
        lastCompletedSleep = {
          start: sleepEvents[i + 1],
          end: sleepEvents[i],
        };
        break;
      }
    }

    return {
      entries: sorted,
      isLoading,
      isAsleep,
      currentSleepStart,
      lastCompletedSleep,
      addEntry,
      updateEntry,
      deleteEntry,
      clearAllEntries,
    };
  }, [
    entries,
    isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAllEntries,
  ]);

  return (
    <LogsContext.Provider value={value}>{children}</LogsContext.Provider>
  );
}

export function useLogs(): LogsContextValue {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error('useLogs must be used within a LogsProvider');
  return ctx;
}
