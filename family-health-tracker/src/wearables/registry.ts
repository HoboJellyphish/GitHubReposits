// Central place that resolves a platform to its adapter implementation.
// Every platform currently resolves to the simulated adapter; pointing a
// platform at a real SDK-backed adapter later is a one-line change here.
import type { WearablePlatform } from "@/types";
import type { WearableAdapter } from "./types";
import { createMockAdapter } from "./mockAdapter";

const ALL_PLATFORMS: WearablePlatform[] = [
  "apple_health",
  "google_fit",
  "fitbit",
  "garmin",
  "whoop",
  "oura",
  "mock",
];

const adapterCache = new Map<WearablePlatform, WearableAdapter>();

export function getWearableAdapter(platform: WearablePlatform): WearableAdapter {
  let adapter = adapterCache.get(platform);
  if (!adapter) {
    adapter = createMockAdapter(platform);
    adapterCache.set(platform, adapter);
  }
  return adapter;
}

export function listWearableAdapters(): WearableAdapter[] {
  return ALL_PLATFORMS.map(getWearableAdapter);
}
