import * as React from "react";
import type {
  AnyLogEntry,
  AppDatabase,
  ButtonDisplayMode,
  DashboardItemPref,
  LabPanel,
  Medication,
  MedicalDocument,
  MedicationDose,
  NavItemPref,
  PageId,
  Profile,
  ProfilePreferences,
  TrackerId,
  WearableConnection,
  WearablePlatform,
} from "@/types";
import { loadDatabase, saveDatabase } from "@/data/storage";
import { serializeBackup, parseBackup } from "@/data/backup";
import { createDefaultPreferences, randomAvatar } from "@/data/defaults";
import { ALL_TRACKER_IDS } from "@/lib/trackers";
import { NAV_ORDER } from "@/lib/nav";
import { id, nowIso } from "@/lib/format";
import { getWearableAdapter } from "@/wearables/registry";

function mergePreferencesWithCatalog(prefs: ProfilePreferences): ProfilePreferences {
  const knownDashboard = new Set(prefs.dashboardItems.map((i) => i.trackerId));
  const missingDashboard: DashboardItemPref[] = ALL_TRACKER_IDS.filter((t) => !knownDashboard.has(t)).map(
    (trackerId, i) => ({
      id: `${prefs.profileId}-${trackerId}`,
      trackerId,
      visible: false,
      order: prefs.dashboardItems.length + i,
      group: "General",
    }),
  );
  const knownNav = new Set(prefs.navItems.map((i) => i.id));
  const missingNav: NavItemPref[] = NAV_ORDER.filter((p) => !knownNav.has(p)).map((pageId, i) => ({
    id: pageId,
    visible: true,
    order: prefs.navItems.length + i,
  }));
  return {
    ...prefs,
    dashboardItems: missingDashboard.length ? [...prefs.dashboardItems, ...missingDashboard] : prefs.dashboardItems,
    navItems: missingNav.length ? [...prefs.navItems, ...missingNav] : prefs.navItems,
    // Preferences saved before these existed won't have them in storage;
    // default to off rather than leaving them `undefined` at runtime.
    medicationRemindersEnabled: prefs.medicationRemindersEnabled ?? false,
    tipsReminderEnabled: prefs.tipsReminderEnabled ?? false,
    tipsReminderTime: prefs.tipsReminderTime ?? "09:00",
  };
}

interface AppDataContextValue {
  profiles: Profile[];
  activeProfileId: string | null;
  activeProfile: Profile | null;
  setActiveProfileId: (profileId: string) => void;
  addProfile: (input: { name: string; dob: string | null }) => Profile;
  updateProfile: (profileId: string, patch: Partial<Pick<Profile, "name" | "dob" | "avatarEmoji" | "avatarColor">>) => void;
  deleteProfile: (profileId: string) => void;

  getPreferences: (profileId: string) => ProfilePreferences;
  setButtonStyle: (profileId: string, mode: ButtonDisplayMode) => void;
  setDashboardItems: (profileId: string, items: DashboardItemPref[]) => void;
  setNavItems: (profileId: string, items: NavItemPref[]) => void;
  updatePreferences: (profileId: string, patch: Partial<ProfilePreferences>) => void;

  logEntries: AnyLogEntry[];
  listLogEntries: (profileId: string) => AnyLogEntry[];
  addLogEntry: <T extends TrackerId>(entry: Omit<AnyLogEntry, "id" | "createdAt" | "updatedAt"> & { trackerId: T }) => AnyLogEntry;
  /** Adds many entries in a single state update — used by bulk imports so a
   * few thousand records don't trigger a few thousand localStorage writes. */
  addLogEntries: (entries: Omit<AnyLogEntry, "id" | "createdAt" | "updatedAt">[]) => number;
  updateLogEntry: (entryId: string, patch: Partial<AnyLogEntry>) => void;
  deleteLogEntry: (entryId: string) => void;

  labPanels: LabPanel[];
  listLabPanels: (profileId: string) => LabPanel[];
  addLabPanel: (panel: Omit<LabPanel, "id" | "createdAt" | "updatedAt">) => LabPanel;
  updateLabPanel: (panelId: string, patch: Partial<LabPanel>) => void;
  deleteLabPanel: (panelId: string) => void;

  medications: Medication[];
  listMedications: (profileId: string) => Medication[];
  addMedication: (med: Omit<Medication, "id" | "createdAt">) => Medication;
  updateMedication: (medId: string, patch: Partial<Medication>) => void;
  deleteMedication: (medId: string) => void;

  medicationDoses: MedicationDose[];
  listDoses: (profileId: string) => MedicationDose[];
  addDose: (dose: Omit<MedicationDose, "id" | "createdAt">) => MedicationDose;

  wearableConnections: WearableConnection[];
  listConnections: (profileId: string) => WearableConnection[];
  connectWearable: (profileId: string, platform: WearablePlatform) => Promise<void>;
  disconnectWearable: (connectionId: string) => void;
  syncWearable: (connectionId: string) => Promise<number>;

  documents: MedicalDocument[];
  listDocuments: (profileId: string) => MedicalDocument[];
  addDocument: (doc: Omit<MedicalDocument, "id" | "uploadedAt">) => MedicalDocument;
  updateDocument: (docId: string, patch: Partial<MedicalDocument>) => void;
  deleteDocument: (docId: string) => void;

  storageError: boolean;

  exportBackup: () => string;
  importBackup: (json: string) => void;
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = React.useState<AppDatabase>(() => loadDatabase());
  const [storageError, setStorageError] = React.useState(false);

  React.useEffect(() => {
    setStorageError(!saveDatabase(db));
  }, [db]);

  const activeProfile = React.useMemo(
    () => db.profiles.find((p) => p.id === db.activeProfileId) ?? null,
    [db.profiles, db.activeProfileId],
  );

  const addProfile: AppDataContextValue["addProfile"] = ({ name, dob }) => {
    const avatar = randomAvatar();
    const profile: Profile = {
      id: id(),
      name,
      avatarEmoji: avatar.emoji,
      avatarColor: avatar.color,
      dob,
      createdAt: nowIso(),
    };
    const prefs = createDefaultPreferences(profile.id);
    setDb((prev) => ({
      ...prev,
      profiles: [...prev.profiles, profile],
      profilePreferences: [...prev.profilePreferences, prefs],
      activeProfileId: prev.activeProfileId ?? profile.id,
    }));
    return profile;
  };

  const updateProfile: AppDataContextValue["updateProfile"] = (profileId, patch) => {
    setDb((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === profileId ? { ...p, ...patch } : p)),
    }));
  };

  const deleteProfile: AppDataContextValue["deleteProfile"] = (profileId) => {
    setDb((prev) => {
      const profiles = prev.profiles.filter((p) => p.id !== profileId);
      const activeProfileId = prev.activeProfileId === profileId ? (profiles[0]?.id ?? null) : prev.activeProfileId;
      return {
        ...prev,
        profiles,
        activeProfileId,
        profilePreferences: prev.profilePreferences.filter((p) => p.profileId !== profileId),
        logEntries: prev.logEntries.filter((e) => e.profileId !== profileId),
        medications: prev.medications.filter((m) => m.profileId !== profileId),
        medicationDoses: prev.medicationDoses.filter((d) => d.profileId !== profileId),
        wearableConnections: prev.wearableConnections.filter((c) => c.profileId !== profileId),
        documents: prev.documents.filter((d) => d.profileId !== profileId),
        labPanels: prev.labPanels.filter((l) => l.profileId !== profileId),
      };
    });
  };

  const setActiveProfileId: AppDataContextValue["setActiveProfileId"] = (profileId) => {
    setDb((prev) => ({ ...prev, activeProfileId: profileId }));
  };

  const getPreferences: AppDataContextValue["getPreferences"] = (profileId) => {
    const found = db.profilePreferences.find((p) => p.profileId === profileId);
    return mergePreferencesWithCatalog(found ?? createDefaultPreferences(profileId));
  };

  const upsertPreferences = (profileId: string, patch: Partial<ProfilePreferences>) => {
    setDb((prev) => {
      const existing = prev.profilePreferences.find((p) => p.profileId === profileId);
      const base = mergePreferencesWithCatalog(existing ?? createDefaultPreferences(profileId));
      const next = { ...base, ...patch };
      const rest = prev.profilePreferences.filter((p) => p.profileId !== profileId);
      return { ...prev, profilePreferences: [...rest, next] };
    });
  };

  const setButtonStyle: AppDataContextValue["setButtonStyle"] = (profileId, mode) =>
    upsertPreferences(profileId, { buttonStyle: mode });
  const setDashboardItems: AppDataContextValue["setDashboardItems"] = (profileId, items) =>
    upsertPreferences(profileId, { dashboardItems: items });
  const setNavItems: AppDataContextValue["setNavItems"] = (profileId, items) =>
    upsertPreferences(profileId, { navItems: items });
  const updatePreferences: AppDataContextValue["updatePreferences"] = (profileId, patch) =>
    upsertPreferences(profileId, patch);

  const listLogEntries: AppDataContextValue["listLogEntries"] = (profileId) =>
    db.logEntries.filter((e) => e.profileId === profileId);

  const addLogEntry: AppDataContextValue["addLogEntry"] = (entry) => {
    const full: AnyLogEntry = { ...entry, id: id(), createdAt: nowIso(), updatedAt: nowIso() };
    setDb((prev) => ({ ...prev, logEntries: [...prev.logEntries, full] }));
    return full;
  };

  const addLogEntries: AppDataContextValue["addLogEntries"] = (entries) => {
    const now = nowIso();
    const full = entries.map((entry): AnyLogEntry => ({ ...entry, id: id(), createdAt: now, updatedAt: now }) as AnyLogEntry);
    setDb((prev) => ({ ...prev, logEntries: [...prev.logEntries, ...full] }));
    return full.length;
  };

  const updateLogEntry: AppDataContextValue["updateLogEntry"] = (entryId, patch) => {
    setDb((prev) => ({
      ...prev,
      logEntries: prev.logEntries.map((e) => (e.id === entryId ? ({ ...e, ...patch, updatedAt: nowIso() } as AnyLogEntry) : e)),
    }));
  };

  const deleteLogEntry: AppDataContextValue["deleteLogEntry"] = (entryId) => {
    setDb((prev) => ({ ...prev, logEntries: prev.logEntries.filter((e) => e.id !== entryId) }));
  };

  const listMedications: AppDataContextValue["listMedications"] = (profileId) =>
    db.medications.filter((m) => m.profileId === profileId);

  const addMedication: AppDataContextValue["addMedication"] = (med) => {
    const full: Medication = { ...med, id: id(), createdAt: nowIso() };
    setDb((prev) => ({ ...prev, medications: [...prev.medications, full] }));
    return full;
  };

  const updateMedication: AppDataContextValue["updateMedication"] = (medId, patch) => {
    setDb((prev) => ({
      ...prev,
      medications: prev.medications.map((m) => (m.id === medId ? { ...m, ...patch } : m)),
    }));
  };

  const deleteMedication: AppDataContextValue["deleteMedication"] = (medId) => {
    setDb((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== medId),
      medicationDoses: prev.medicationDoses.filter((d) => d.medicationId !== medId),
    }));
  };

  const listDoses: AppDataContextValue["listDoses"] = (profileId) =>
    db.medicationDoses.filter((d) => d.profileId === profileId);

  const addDose: AppDataContextValue["addDose"] = (dose) => {
    const full: MedicationDose = { ...dose, id: id(), createdAt: nowIso() };
    setDb((prev) => ({ ...prev, medicationDoses: [...prev.medicationDoses, full] }));
    return full;
  };

  const listConnections: AppDataContextValue["listConnections"] = (profileId) =>
    db.wearableConnections.filter((c) => c.profileId === profileId);

  const connectWearable: AppDataContextValue["connectWearable"] = async (profileId, platform) => {
    const adapter = getWearableAdapter(platform);
    const result = await adapter.connect(profileId);
    const connection: WearableConnection = { ...result, id: id() };
    setDb((prev) => ({ ...prev, wearableConnections: [...prev.wearableConnections, connection] }));
  };

  const disconnectWearable: AppDataContextValue["disconnectWearable"] = (connectionId) => {
    setDb((prev) => ({
      ...prev,
      wearableConnections: prev.wearableConnections.map((c) =>
        c.id === connectionId ? { ...c, status: "disconnected" as const } : c,
      ),
    }));
  };

  const syncWearable: AppDataContextValue["syncWearable"] = async (connectionId) => {
    const connection = db.wearableConnections.find((c) => c.id === connectionId);
    if (!connection) return 0;
    const adapter = getWearableAdapter(connection.platform);
    const since = connection.lastSyncAt ? new Date(connection.lastSyncAt) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newEntries = await adapter.sync(connection.profileId, since);
    setDb((prev) => ({
      ...prev,
      logEntries: [...prev.logEntries, ...newEntries],
      wearableConnections: prev.wearableConnections.map((c) =>
        c.id === connectionId ? { ...c, lastSyncAt: nowIso() } : c,
      ),
    }));
    return newEntries.length;
  };

  const listDocuments: AppDataContextValue["listDocuments"] = (profileId) =>
    db.documents.filter((d) => d.profileId === profileId);

  const addDocument: AppDataContextValue["addDocument"] = (doc) => {
    const full: MedicalDocument = { ...doc, id: id(), uploadedAt: nowIso() };
    setDb((prev) => ({ ...prev, documents: [...prev.documents, full] }));
    return full;
  };

  const updateDocument: AppDataContextValue["updateDocument"] = (docId, patch) => {
    setDb((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.id === docId ? { ...d, ...patch } : d)),
    }));
  };

  const deleteDocument: AppDataContextValue["deleteDocument"] = (docId) => {
    setDb((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.id !== docId) }));
  };

  const listLabPanels: AppDataContextValue["listLabPanels"] = (profileId) =>
    db.labPanels.filter((l) => l.profileId === profileId);

  const addLabPanel: AppDataContextValue["addLabPanel"] = (panel) => {
    const full: LabPanel = { ...panel, id: id(), createdAt: nowIso(), updatedAt: nowIso() };
    setDb((prev) => ({ ...prev, labPanels: [...prev.labPanels, full] }));
    return full;
  };

  const updateLabPanel: AppDataContextValue["updateLabPanel"] = (panelId, patch) => {
    setDb((prev) => ({
      ...prev,
      labPanels: prev.labPanels.map((l) => (l.id === panelId ? { ...l, ...patch, updatedAt: nowIso() } : l)),
    }));
  };

  const deleteLabPanel: AppDataContextValue["deleteLabPanel"] = (panelId) => {
    setDb((prev) => ({ ...prev, labPanels: prev.labPanels.filter((l) => l.id !== panelId) }));
  };

  const exportBackup: AppDataContextValue["exportBackup"] = () => serializeBackup(db);

  const importBackup: AppDataContextValue["importBackup"] = (json) => {
    const restored = parseBackup(json);
    setDb(restored);
  };

  const value: AppDataContextValue = {
    profiles: db.profiles,
    activeProfileId: db.activeProfileId,
    activeProfile,
    setActiveProfileId,
    addProfile,
    updateProfile,
    deleteProfile,
    getPreferences,
    setButtonStyle,
    setDashboardItems,
    setNavItems,
    updatePreferences,
    logEntries: db.logEntries,
    listLogEntries,
    addLogEntry,
    addLogEntries,
    updateLogEntry,
    deleteLogEntry,
    medications: db.medications,
    listMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    medicationDoses: db.medicationDoses,
    listDoses,
    addDose,
    wearableConnections: db.wearableConnections,
    listConnections,
    connectWearable,
    disconnectWearable,
    syncWearable,
    documents: db.documents,
    listDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    labPanels: db.labPanels,
    listLabPanels,
    addLabPanel,
    updateLabPanel,
    deleteLabPanel,
    storageError,
    exportBackup,
    importBackup,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = React.useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function usePreferences(profileId: string | null): ProfilePreferences | null {
  const { getPreferences } = useAppData();
  return React.useMemo(() => (profileId ? getPreferences(profileId) : null), [profileId, getPreferences]);
}

export type { PageId };
