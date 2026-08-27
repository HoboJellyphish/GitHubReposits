import type { TrackerId } from "@/types";
import {
  Heart,
  Moon,
  UtensilsCrossed,
  Pill,
  Scale,
  Activity,
  Droplet,
  Smile,
  Stethoscope,
  GlassWater,
  Footprints,
  type LucideIcon,
} from "lucide-react";

export interface TrackerDefinition {
  id: TrackerId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  colorVar: string;
  unit?: string;
  quickLogLabel: string;
  isCore: boolean;
  description: string;
}

export const TRACKER_CATALOG: Record<TrackerId, TrackerDefinition> = {
  heartRate: {
    id: "heartRate",
    label: "Heart Rate",
    shortLabel: "Heart",
    icon: Heart,
    colorVar: "var(--color-tracker-heartRate)",
    unit: "bpm",
    quickLogLabel: "Log Heart Rate",
    isCore: true,
    description: "Manual entries and wearable-synced readings",
  },
  sleep: {
    id: "sleep",
    label: "Sleep",
    shortLabel: "Sleep",
    icon: Moon,
    colorVar: "var(--color-tracker-sleep)",
    quickLogLabel: "Log Sleep",
    isCore: true,
    description: "Bedtime, wake time, quality, interruptions",
  },
  meals: {
    id: "meals",
    label: "Meals",
    shortLabel: "Meals",
    icon: UtensilsCrossed,
    colorVar: "var(--color-tracker-meals)",
    quickLogLabel: "Log Meal",
    isCore: true,
    description: "Meals and snacks, with type, portion, photo",
  },
  medications: {
    id: "medications",
    label: "Medications",
    shortLabel: "Meds",
    icon: Pill,
    colorVar: "var(--color-tracker-medications)",
    quickLogLabel: "Log Dose",
    isCore: true,
    description: "Personal medication list and dose history",
  },
  weight: {
    id: "weight",
    label: "Weight",
    shortLabel: "Weight",
    icon: Scale,
    colorVar: "var(--color-tracker-weight)",
    unit: "kg",
    quickLogLabel: "Log Weight",
    isCore: false,
    description: "Body weight over time",
  },
  bloodPressure: {
    id: "bloodPressure",
    label: "Blood Pressure",
    shortLabel: "BP",
    icon: Activity,
    colorVar: "var(--color-tracker-bloodPressure)",
    unit: "mmHg",
    quickLogLabel: "Log Blood Pressure",
    isCore: false,
    description: "Systolic / diastolic readings",
  },
  glucose: {
    id: "glucose",
    label: "Glucose",
    shortLabel: "Glucose",
    icon: Droplet,
    colorVar: "var(--color-tracker-glucose)",
    unit: "mg/dL",
    quickLogLabel: "Log Glucose",
    isCore: false,
    description: "Blood glucose readings",
  },
  mood: {
    id: "mood",
    label: "Mood",
    shortLabel: "Mood",
    icon: Smile,
    colorVar: "var(--color-tracker-mood)",
    quickLogLabel: "Log Mood",
    isCore: false,
    description: "How you're feeling, on a simple scale",
  },
  symptoms: {
    id: "symptoms",
    label: "Symptoms",
    shortLabel: "Symptoms",
    icon: Stethoscope,
    colorVar: "var(--color-tracker-symptoms)",
    quickLogLabel: "Log Symptom",
    isCore: false,
    description: "Notes and severity for how you feel",
  },
  water: {
    id: "water",
    label: "Water Intake",
    shortLabel: "Water",
    icon: GlassWater,
    colorVar: "var(--color-tracker-water)",
    unit: "mL",
    quickLogLabel: "Log Water",
    isCore: false,
    description: "Hydration tracking",
  },
  steps: {
    id: "steps",
    label: "Steps",
    shortLabel: "Steps",
    icon: Footprints,
    colorVar: "var(--color-tracker-steps)",
    unit: "steps",
    quickLogLabel: "Log Steps",
    isCore: false,
    description: "Daily step count, manual or wearable-synced",
  },
};

export const ALL_TRACKER_IDS = Object.keys(TRACKER_CATALOG) as TrackerId[];
export const CORE_TRACKER_IDS = ALL_TRACKER_IDS.filter((id) => TRACKER_CATALOG[id].isCore);

export function getTracker(id: TrackerId): TrackerDefinition {
  return TRACKER_CATALOG[id];
}
