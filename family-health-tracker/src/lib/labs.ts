import type { LabPanelType, LabValue } from "@/types";
import { Activity, Pill as PillIcon, HeartPulse, Droplets, TestTube2, FlaskConical, type LucideIcon } from "lucide-react";

export interface LabPanelTypeDef {
  value: LabPanelType;
  label: string;
  icon: LucideIcon;
  /** Common analytes for this panel type, with typical adult reference
   * ranges. These are starting points, not medical guidance — reference
   * ranges vary by lab, assay method, age, and sex, so every value stays
   * editable and the UI always shows "typical range, check your own report." */
  presetValues: Omit<LabValue, "value">[];
}

export const LAB_PANEL_TYPES: LabPanelTypeDef[] = [
  {
    value: "thyroid",
    label: "Thyroid Panel",
    icon: Activity,
    presetValues: [
      { name: "TSH", unit: "mIU/L", referenceLow: 0.4, referenceHigh: 4.0 },
      { name: "Free T4", unit: "ng/dL", referenceLow: 0.8, referenceHigh: 1.8 },
      { name: "Free T3", unit: "pg/mL", referenceLow: 2.3, referenceHigh: 4.2 },
      { name: "TPO Antibodies", unit: "IU/mL", referenceLow: 0, referenceHigh: 34 },
    ],
  },
  {
    value: "vitamins",
    label: "Vitamin Panel",
    icon: PillIcon,
    presetValues: [
      { name: "Vitamin D, 25-OH", unit: "ng/mL", referenceLow: 30, referenceHigh: 100 },
      { name: "Vitamin B12", unit: "pg/mL", referenceLow: 200, referenceHigh: 900 },
      { name: "Folate", unit: "ng/mL", referenceLow: 2.7, referenceHigh: 17.0 },
      { name: "Ferritin", unit: "ng/mL", referenceLow: 20, referenceHigh: 250 },
      { name: "Iron", unit: "mcg/dL", referenceLow: 60, referenceHigh: 170 },
    ],
  },
  {
    value: "lipid",
    label: "Lipid Panel",
    icon: HeartPulse,
    presetValues: [
      { name: "Total Cholesterol", unit: "mg/dL", referenceHigh: 200 },
      { name: "LDL Cholesterol", unit: "mg/dL", referenceHigh: 100 },
      { name: "HDL Cholesterol", unit: "mg/dL", referenceLow: 40 },
      { name: "Triglycerides", unit: "mg/dL", referenceHigh: 150 },
    ],
  },
  {
    value: "metabolic",
    label: "Metabolic Panel",
    icon: Droplets,
    presetValues: [
      { name: "Glucose", unit: "mg/dL", referenceLow: 70, referenceHigh: 99 },
      { name: "BUN", unit: "mg/dL", referenceLow: 7, referenceHigh: 20 },
      { name: "Creatinine", unit: "mg/dL", referenceLow: 0.6, referenceHigh: 1.2 },
      { name: "Sodium", unit: "mmol/L", referenceLow: 135, referenceHigh: 145 },
      { name: "Potassium", unit: "mmol/L", referenceLow: 3.5, referenceHigh: 5.0 },
      { name: "Calcium", unit: "mg/dL", referenceLow: 8.5, referenceHigh: 10.2 },
    ],
  },
  {
    value: "cbc",
    label: "Complete Blood Count",
    icon: TestTube2,
    presetValues: [
      { name: "WBC", unit: "K/uL", referenceLow: 4.5, referenceHigh: 11.0 },
      { name: "RBC", unit: "M/uL", referenceLow: 4.2, referenceHigh: 5.9 },
      { name: "Hemoglobin", unit: "g/dL", referenceLow: 12.0, referenceHigh: 17.5 },
      { name: "Hematocrit", unit: "%", referenceLow: 36, referenceHigh: 52 },
      { name: "Platelets", unit: "K/uL", referenceLow: 150, referenceHigh: 400 },
    ],
  },
  {
    value: "hormone",
    label: "Hormone Panel",
    icon: FlaskConical,
    presetValues: [
      { name: "Testosterone", unit: "ng/dL" },
      { name: "Cortisol", unit: "mcg/dL" },
      { name: "Estradiol", unit: "pg/mL" },
    ],
  },
  { value: "other", label: "Other / Custom", icon: FlaskConical, presetValues: [] },
];

export function getLabPanelType(value: LabPanelType): LabPanelTypeDef {
  return LAB_PANEL_TYPES.find((t) => t.value === value) ?? LAB_PANEL_TYPES[LAB_PANEL_TYPES.length - 1];
}

export type LabFlag = "low" | "high" | "normal" | "unknown";

export function flagFor(value: LabValue): LabFlag {
  if (value.referenceLow !== undefined && value.value < value.referenceLow) return "low";
  if (value.referenceHigh !== undefined && value.value > value.referenceHigh) return "high";
  if (value.referenceLow === undefined && value.referenceHigh === undefined) return "unknown";
  return "normal";
}
