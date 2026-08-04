import type { PageId } from "@/types";
import { LayoutDashboard, ListTree, TrendingUp, Users, Settings, Pill, FileText, type LucideIcon } from "lucide-react";

export interface NavPageDefinition {
  id: PageId;
  label: string;
  icon: LucideIcon;
}

export const NAV_CATALOG: Record<PageId, NavPageDefinition> = {
  dashboard: { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  log: { id: "log", label: "Log", icon: ListTree },
  trends: { id: "trends", label: "Trends", icon: TrendingUp },
  family: { id: "family", label: "Family", icon: Users },
  medications: { id: "medications", label: "Medications", icon: Pill },
  documents: { id: "documents", label: "Documents", icon: FileText },
  settings: { id: "settings", label: "Settings", icon: Settings },
};

export const NAV_ORDER: PageId[] = ["dashboard", "log", "trends", "family", "medications", "documents", "settings"];
