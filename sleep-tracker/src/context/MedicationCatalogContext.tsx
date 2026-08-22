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

  const persist = useCallback((next: Medication[]) => {
    setMedications(next);
    saveMedications(next).catch(() => {
      // Best-effort persistence; in-memory state still reflects the change.
    });
  }, []);

  const addMedication = useCallback(
    async (medication: NewMedication) => {
      const newMedication: Medication = { id: generateId(), ...medication };
      persist([...medications, newMedication]);
      return newMedication;
    },
    [medications, persist]
  );

  const updateMedication = useCallback(
    async (id: string, changes: Partial<NewMedication>) => {
      persist(
        medications.map((m) => (m.id === id ? { ...m, ...changes } : m))
      );
    },
    [medications, persist]
  );

  const removeMedication = useCallback(
    async (id: string) => {
      persist(medications.filter((m) => m.id !== id));
    },
    [medications, persist]
  );

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
