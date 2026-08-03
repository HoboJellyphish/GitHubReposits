export type EntryType =
  | 'SLEEP_START'
  | 'SLEEP_END'
  | 'NAP_START'
  | 'NAP_END'
  | 'MEDICATION';

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
