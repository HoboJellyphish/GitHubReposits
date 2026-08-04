import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hobojellyphish.familyhealthtracker",
  appName: "Family Health Tracker",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
};

export default config;
