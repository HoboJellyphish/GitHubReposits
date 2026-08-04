import type { AppDatabase } from "@/types";
import { createEmptyDatabase } from "./storage";

// A portable snapshot of the whole household's on-device data — every
// profile, not just the active one. Used for manual backup/restore, e.g.
// before uninstalling (a signing-key change forces this) or switching
// devices, since nothing here ever syncs anywhere on its own.
const BACKUP_SCHEMA_VERSION = 1;

export interface BackupFile {
  app: "family-health-tracker";
  schemaVersion: number;
  exportedAt: string;
  data: AppDatabase;
}

export function serializeBackup(db: AppDatabase): string {
  const backup: BackupFile = {
    app: "family-health-tracker",
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: db,
  };
  return JSON.stringify(backup, null, 2);
}

export function backupFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `family-health-tracker-backup-${stamp}.json`;
}

export class BackupParseError extends Error {}

export function parseBackup(json: string): AppDatabase {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new BackupParseError("That file isn't valid JSON.");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new BackupParseError("That file doesn't look like a backup.");
  }
  const candidate = parsed as Partial<BackupFile>;
  if (candidate.app !== "family-health-tracker" || typeof candidate.data !== "object" || candidate.data === null) {
    throw new BackupParseError("That file doesn't look like a Family Health Tracker backup.");
  }
  if (typeof candidate.schemaVersion !== "number" || candidate.schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new BackupParseError("This backup was made by a newer version of the app.");
  }
  return { ...createEmptyDatabase(), ...candidate.data };
}
