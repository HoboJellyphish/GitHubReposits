// Abstract "data source" interface for wearable/health-platform integrations.
// Every platform (real or simulated) implements this shape so the rest of
// the app — sync buttons, timeline, charts — never needs to know which
// platform produced a reading. Swapping the mock adapter for a real
// platform SDK later only means implementing this interface again.
import type { AnyLogEntry, WearableConnection, WearablePlatform } from "@/types";

export interface WearableAdapter {
  platform: WearablePlatform;
  label: string;
  description: string;
  isSimulated: boolean;
  connect(profileId: string): Promise<Omit<WearableConnection, "id">>;
  disconnect(): Promise<void>;
  sync(profileId: string, since: Date): Promise<AnyLogEntry[]>;
}

export const WEARABLE_PLATFORM_LABELS: Record<WearablePlatform, string> = {
  apple_health: "Apple Health",
  google_fit: "Health Connect / Google Fit",
  fitbit: "Fitbit",
  garmin: "Garmin",
  whoop: "Whoop",
  oura: "Oura",
  mock: "Simulated Device",
};
