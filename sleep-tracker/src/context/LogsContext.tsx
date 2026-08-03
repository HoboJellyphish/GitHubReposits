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
  isNapping: boolean;
  currentSleepStart: LogEntry | null;
  currentNapStart: LogEntry | null;
  lastCompletedSleep: { start: LogEntry; end: LogEntry } | null;
  addEntry: (entry: NewLogEntry) => Promise<LogEntry>;
  updateEntry: (id: string, changes: Partial<NewLogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
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

  const persist = useCallback((next: LogEntry[]) => {
    setEntries(next);
    saveEntries(next).catch(() => {
      // Best-effort persistence; in-memory state still reflects the change.
    });
  }, []);

  const addEntry = useCallback(
    async (entry: NewLogEntry) => {
      const now = Date.now();
      const newEntry: LogEntry = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        ...entry,
      };
      persist([newEntry, ...entries]);
      return newEntry;
    },
    [entries, persist]
  );

  const updateEntry = useCallback(
    async (id: string, changes: Partial<NewLogEntry>) => {
      const next = entries.map((e) =>
        e.id === id ? { ...e, ...changes, updatedAt: Date.now() } : e
      );
      persist(next);
    },
    [entries, persist]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist]
  );

  const value = useMemo<LogsContextValue>(() => {
    const sorted = sortDesc(entries);

    const lastSleepEvent = mostRecentOfTypes(sorted, [
      'SLEEP_START',
      'SLEEP_END',
    ]);
    const isAsleep = lastSleepEvent?.type === 'SLEEP_START';
    const currentSleepStart = isAsleep ? lastSleepEvent : null;

    const lastNapEvent = mostRecentOfTypes(sorted, ['NAP_START', 'NAP_END']);
    const isNapping = lastNapEvent?.type === 'NAP_START';
    const currentNapStart = isNapping ? lastNapEvent : null;

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
      isNapping,
      currentSleepStart,
      currentNapStart,
      lastCompletedSleep,
      addEntry,
      updateEntry,
      deleteEntry,
    };
  }, [entries, isLoading, addEntry, updateEntry, deleteEntry]);

  return (
    <LogsContext.Provider value={value}>{children}</LogsContext.Provider>
  );
}

export function useLogs(): LogsContextValue {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error('useLogs must be used within a LogsProvider');
  return ctx;
}
