import type { AnyLogEntry, WearablePlatform } from "@/types";
import type { WearableAdapter } from "./types";
import { WEARABLE_PLATFORM_LABELS } from "./types";
import { id, nowIso } from "@/lib/format";

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function simulateHeartRateEntries(profileId: string, platform: WearablePlatform, since: Date, until: Date): AnyLogEntry[] {
  const entries: AnyLogEntry[] = [];
  const stepMs = 90 * 60 * 1000;
  for (let t = since.getTime(); t <= until.getTime(); t += stepMs + randomBetween(-10, 10) * 60 * 1000) {
    const ts = new Date(t);
    const hour = ts.getHours();
    const isActiveWindow = hour >= 8 && hour <= 20 && Math.random() < 0.3;
    const bpm = isActiveWindow ? randomBetween(95, 150) : randomBetween(56, 78);
    entries.push({
      id: id(),
      profileId,
      trackerId: "heartRate",
      timestamp: ts.toISOString(),
      source: "wearable",
      wearablePlatform: platform,
      data: { bpm, context: isActiveWindow ? "active" : "resting" },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }
  return entries;
}

function simulateSleepSessions(profileId: string, platform: WearablePlatform, since: Date, until: Date): AnyLogEntry[] {
  const entries: AnyLogEntry[] = [];
  const cursor = new Date(since);
  cursor.setHours(22, randomBetween(0, 45), 0, 0);
  while (cursor.getTime() < until.getTime()) {
    const bedtime = new Date(cursor);
    const durationMinutes = randomBetween(360, 510);
    const wake = new Date(bedtime.getTime() + durationMinutes * 60 * 1000);
    if (wake.getTime() <= until.getTime() && bedtime.getTime() >= since.getTime() - 24 * 60 * 60 * 1000) {
      const asleepId = id();
      entries.push({
        id: asleepId,
        profileId,
        trackerId: "sleep",
        timestamp: bedtime.toISOString(),
        source: "wearable",
        wearablePlatform: platform,
        data: { state: "asleep" },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      entries.push({
        id: id(),
        profileId,
        trackerId: "sleep",
        timestamp: wake.toISOString(),
        source: "wearable",
        wearablePlatform: platform,
        data: {
          state: "awake",
          durationMinutes,
          qualityRating: randomBetween(2, 5),
          interruptions: randomBetween(0, 3),
          linkedEntryId: asleepId,
        },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return entries;
}

function simulateStepEntries(profileId: string, platform: WearablePlatform, since: Date, until: Date): AnyLogEntry[] {
  const entries: AnyLogEntry[] = [];
  const cursor = new Date(since);
  cursor.setHours(23, 59, 0, 0);
  while (cursor.getTime() <= until.getTime()) {
    if (cursor.getTime() >= since.getTime()) {
      entries.push({
        id: id(),
        profileId,
        trackerId: "steps",
        timestamp: cursor.toISOString(),
        source: "wearable",
        wearablePlatform: platform,
        data: { count: randomBetween(3000, 12000) },
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return entries;
}

export function createMockAdapter(platform: WearablePlatform): WearableAdapter {
  return {
    platform,
    label: WEARABLE_PLATFORM_LABELS[platform],
    description:
      platform === "mock"
        ? "A simulated device for testing — generates realistic sample data."
        : `Simulated ${WEARABLE_PLATFORM_LABELS[platform]} connection. Swap in the real SDK later without touching the data model.`,
    isSimulated: true,
    async connect(_profileId: string) {
      await new Promise((r) => setTimeout(r, 400));
      return {
        profileId: _profileId,
        platform,
        status: "connected" as const,
        connectedAt: nowIso(),
      };
    },
    async disconnect() {
      await new Promise((r) => setTimeout(r, 150));
    },
    async sync(profileId: string, since: Date) {
      await new Promise((r) => setTimeout(r, 500));
      const until = new Date();
      return [
        ...simulateHeartRateEntries(profileId, platform, since, until),
        ...simulateSleepSessions(profileId, platform, since, until),
        ...simulateStepEntries(profileId, platform, since, until),
      ];
    },
  };
}
