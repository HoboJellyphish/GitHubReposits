import type { ProfilePreferences } from "@/types";
import { ALL_TRACKER_IDS, CORE_TRACKER_IDS } from "@/lib/trackers";
import { NAV_ORDER } from "@/lib/nav";

export const AVATAR_PALETTE = [
  { emoji: "🦊", color: "oklch(0.65 0.18 40)" },
  { emoji: "🐼", color: "oklch(0.5 0.02 260)" },
  { emoji: "🐨", color: "oklch(0.55 0.05 250)" },
  { emoji: "🐯", color: "oklch(0.6 0.19 60)" },
  { emoji: "🦁", color: "oklch(0.62 0.15 75)" },
  { emoji: "🐸", color: "oklch(0.58 0.16 145)" },
  { emoji: "🐙", color: "oklch(0.5 0.2 320)" },
  { emoji: "🦋", color: "oklch(0.55 0.18 260)" },
  { emoji: "🐳", color: "oklch(0.5 0.14 220)" },
  { emoji: "🦉", color: "oklch(0.45 0.06 60)" },
  { emoji: "🐢", color: "oklch(0.55 0.13 155)" },
  { emoji: "🐝", color: "oklch(0.68 0.16 90)" },
];

export function randomAvatar() {
  return AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)];
}

export function createDefaultPreferences(profileId: string): ProfilePreferences {
  return {
    profileId,
    buttonStyle: "both",
    dashboardItems: ALL_TRACKER_IDS.map((trackerId, index) => ({
      id: `${profileId}-${trackerId}`,
      trackerId,
      visible: CORE_TRACKER_IDS.includes(trackerId),
      order: index,
      group: "General",
    })),
    navItems: NAV_ORDER.map((pageId, index) => ({
      id: pageId,
      visible: true,
      order: index,
    })),
  };
}
