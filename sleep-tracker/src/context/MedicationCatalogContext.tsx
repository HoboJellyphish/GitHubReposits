import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  loadMedications,
  saveMedications,
} from '@/storage/medicationStorage';
import type { Medication, NewMedication } from '@/types';
import { generateId } from '@/utils/id';

interface MedicationCatalogContextValue {
  medications: Medication[];
  isLoading: boolean;
  addMedication: (medication: NewMedication) => Promise<Medication>;
  updateMedication: (
    id: string,
    changes: Partial<NewMedication>
  ) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
}

const MedicationCatalogContext = createContext<
  MedicationCatalogContextValue | undefined
>(undefined);

export function MedicationCatalogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadMedications().then((loaded) => {
      if (mounted) {
        setMedications(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Persisting from a separate effect lets every mutator below use the
  // functional setState form, so several calls fired in the same tick
  // each build on the latest pending state instead of clobbering one
  // another (see LogsContext for the same fix and why it matters).
  useEffect(() => {
    if (isLoading) return;
    saveMedications(medications).catch(() => {
      // Best-effort persistence; in-memory state still reflects the change.
    });
  }, [medications, isLoading]);

  const addMedication = useCallback(async (medication: NewMedication) => {
    const newMedication: Medication = { id: generateId(), ...medication };
    setMedications((prev) => [...prev, newMedication]);
    return newMedication;
  }, []);

  const updateMedication = useCallback(
    async (id: string, changes: Partial<NewMedication>) => {
      setMedications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...changes } : m))
      );
    },
    []
  );

  const removeMedication = useCallback(async (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const value = useMemo<MedicationCatalogContextValue>(
    () => ({
      medications,
      isLoading,
      addMedication,
      updateMedication,
      removeMedication,
    }),
    [medications, isLoading, addMedication, updateMedication, removeMedication]
  );

  return (
    <MedicationCatalogContext.Provider value={value}>
      {children}
    </MedicationCatalogContext.Provider>
  );
}

export function useMedicationCatalog(): MedicationCatalogContextValue {
  const ctx = useContext(MedicationCatalogContext);
  if (!ctx) {
    throw new Error(
      'useMedicationCatalog must be used within a MedicationCatalogProvider'
    );
  }
  return ctx;
}
