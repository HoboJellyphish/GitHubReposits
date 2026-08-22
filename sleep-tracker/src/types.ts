export type EntryType = 'SLEEP_START' | 'SLEEP_END' | 'MEDICATION';

export interface LogEntry {
  id: string;
  type: EntryType;
  /** When the event actually happened (editable by the user). Epoch ms. */
  timestamp: number;
  medicationName?: string;
  dosage?: string;
  notes?: string;
  /** When the record was first created. Epoch ms, not editable. */
  createdAt: number;
  /** Last time the record was edited. Epoch ms. */
  updatedAt: number;
}

export type NewLogEntry = Pick<
  LogEntry,
  'type' | 'timestamp' | 'medicationName' | 'dosage' | 'notes'
>;

/** A medication the user takes, added via the Customize screen, used to
 * populate the picker on the medication log so entries are one tap. */
export interface Medication {
  id: string;
  name: string;
  defaultDose?: string;
}

export type NewMedication = Pick<Medication, 'name' | 'defaultDose'>;

export interface UserProfile {
  name?: string;
}
