// Core domain types for the Family Health Tracker.
// All data stays on-device (localStorage) — see src/data/storage.ts.

export type TrackerId =
  | "heartRate"
  | "sleep"
  | "meals"
  | "medications"
  | "weight"
  | "bloodPressure"
  | "glucose"
  | "mood"
  | "symptoms"
  | "water"
  | "steps";

export type ButtonDisplayMode = "icon" | "text" | "both";

export type EntrySource = "manual" | "wearable" | "document" | "import";

export type WearablePlatform =
  | "apple_health"
  | "google_fit"
  | "fitbit"
  | "garmin"
  | "whoop"
  | "oura"
  | "mock";

export interface Profile {
  id: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  dob: string | null;
  createdAt: string;
}

export interface HeartRateData {
  bpm: number;
  context: "resting" | "active" | "unknown";
}

export interface SleepData {
  state: "asleep" | "awake";
  qualityRating?: number;
  interruptions?: number;
  durationMinutes?: number;
  linkedEntryId?: string;
}

export interface MealData {
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "drink" | "other";
  category?: string;
  portion?: string;
  photoDataUrl?: string;
  // Optional nutrition facts — filled in manually or via the nutrition-label
  // photo scanner (which pre-fills these for review, never saves them
  // unreviewed).
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}

export interface WeightData {
  kg: number;
}

export interface BloodPressureData {
  systolic: number;
  diastolic: number;
}

export interface GlucoseData {
  mgdl: number;
}

export interface MoodData {
  rating: number;
}

export interface SymptomsData {
  description: string;
  severity: number;
}

export interface WaterData {
  ml: number;
}

export interface StepsData {
  count: number;
}

export type TrackerDataMap = {
  heartRate: HeartRateData;
  sleep: SleepData;
  meals: MealData;
  medications: Record<string, never>;
  weight: WeightData;
  bloodPressure: BloodPressureData;
  glucose: GlucoseData;
  mood: MoodData;
  symptoms: SymptomsData;
  water: WaterData;
  steps: StepsData;
};

export interface LogEntry<T extends TrackerId = TrackerId> {
  id: string;
  profileId: string;
  trackerId: T;
  timestamp: string;
  source: EntrySource;
  wearablePlatform?: WearablePlatform;
  documentId?: string;
  note?: string;
  data: TrackerDataMap[T];
  createdAt: string;
  updatedAt: string;
}

export type AnyLogEntry = LogEntry<TrackerId>;

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
  color: string;
  icon: string;
  active: boolean;
  reminderTimes: string[];
  createdAt: string;
}

export type DoseStatus = "taken" | "missed" | "skipped";

export interface MedicationDose {
  id: string;
  profileId: string;
  medicationId: string;
  timestamp: string;
  status: DoseStatus;
  note?: string;
  createdAt: string;
}

export type WearableConnectionStatus = "connected" | "disconnected";

export interface WearableConnection {
  id: string;
  profileId: string;
  platform: WearablePlatform;
  status: WearableConnectionStatus;
  connectedAt: string;
  lastSyncAt?: string;
}

export type PageId = "dashboard" | "log" | "trends" | "family" | "medications" | "labs" | "documents" | "tips" | "settings";

export type DocumentCategory = "lab_result" | "imaging" | "visit_summary" | "prescription" | "immunization" | "other";

export interface MedicalDocument {
  id: string;
  profileId: string;
  title: string;
  category: DocumentCategory;
  documentDate: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  fileSize: number;
  note?: string;
  uploadedAt: string;
}

export interface DashboardItemPref {
  id: string;
  trackerId: TrackerId;
  visible: boolean;
  order: number;
  group: string;
}

export interface NavItemPref {
  id: PageId;
  visible: boolean;
  order: number;
}

export interface ProfilePreferences {
  profileId: string;
  buttonStyle: ButtonDisplayMode;
  dashboardItems: DashboardItemPref[];
  navItems: NavItemPref[];
  // Local reminder notifications — entirely opt-in and off by default. When
  // enabled, scheduling happens with the OS's on-device notification APIs
  // only (see src/lib/reminders.ts); nothing is ever sent anywhere.
  medicationRemindersEnabled: boolean;
  tipsReminderEnabled: boolean;
  tipsReminderTime: string;
}

export type LabPanelType = "thyroid" | "vitamins" | "lipid" | "metabolic" | "cbc" | "hormone" | "other";

export interface LabValue {
  name: string;
  value: number;
  unit: string;
  referenceLow?: number;
  referenceHigh?: number;
}

export interface LabPanel {
  id: string;
  profileId: string;
  panelType: LabPanelType;
  title: string;
  testDate: string;
  values: LabValue[];
  documentId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppDatabase {
  profiles: Profile[];
  logEntries: AnyLogEntry[];
  medications: Medication[];
  medicationDoses: MedicationDose[];
  wearableConnections: WearableConnection[];
  profilePreferences: ProfilePreferences[];
  documents: MedicalDocument[];
  labPanels: LabPanel[];
  activeProfileId: string | null;
}
