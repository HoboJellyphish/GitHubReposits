# Sleep Tracker

A clean, simple sleep tracker built with [Expo](https://expo.dev) / React Native that runs on both iOS and Android from a single codebase.

## Features

- **One-tap tracking** — big, obvious buttons for going to sleep, waking up, starting/ending a nap, and logging medication.
- **Live status** — the home screen always shows whether you're currently asleep, napping, or awake, plus a summary of your last sleep.
- **Medication log** — record what you took, an optional dosage and notes; every entry is automatically time-stamped.
- **History & editing** — every logged event (sleep, wake, nap, medication) is listed on the History tab grouped by day. Tap any entry to correct its time, edit medication details, or delete it.
- **Local persistence** — all data is stored on-device with `AsyncStorage`; no account or network connection required.

## Tech stack

- Expo (React Native, TypeScript)
- React Navigation (bottom tabs)
- `@react-native-async-storage/async-storage` for persistence
- `@react-native-community/datetimepicker` for editing timestamps

## Getting started

```bash
npm install
npx expo start
```

From the Expo CLI output you can:

- Press `i` to launch the iOS simulator (macOS + Xcode required), or scan the QR code with the **Expo Go** app on a physical iPhone.
- Press `a` to launch an Android emulator (Android Studio required), or scan the QR code with **Expo Go** on a physical Android device.

## Installing on your phone (no Xcode/Android Studio required)

### Fastest: Expo Go (live preview)

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (App Store / Play Store) on your phone. The app runs live — no separate install step, but your computer needs to keep `expo start` running and your phone needs to be on the same network.

### Real installable app: EAS Build (free cloud build)

This produces an actual `.apk` (Android) or a simulator/TestFlight build (iOS) without needing a Mac or local Android SDK.

```bash
npm install -g eas-cli
eas login                 # create a free account at expo.dev if you don't have one
eas build:configure       # links this project to your Expo account (writes extra.eas.projectId into app.json)

# Android — installable .apk, download link when the build finishes
eas build --platform android --profile preview

# iOS — requires an Apple Developer account for a real device;
# use the simulator profile if you just want to try it in the iOS Simulator
eas build --platform ios --profile preview-device   # real device (needs Apple Developer account, $99/yr)
eas build --platform ios --profile preview           # iOS Simulator only (free, no device install)
```

Build profiles are already defined in `eas.json`:

- `development` — dev client build for iterating with `expo start`
- `preview` — Android APK + iOS Simulator build, for quick sharing/testing
- `preview-device` — Android APK + iOS build installable on a real iPhone (needs the device registered with your Apple Developer account)
- `production` — store-ready builds for App Store / Play Store submission

When an Android build finishes, `eas build` prints a URL — open it on your phone's browser and tap to install (you may need to allow "install unknown apps" the first time). iOS real-device builds are installed via TestFlight or by registering the device's UDID with `eas device:create` before building.

## Project structure

```
App.tsx                      Root component (providers + navigation)
src/
  types.ts                   LogEntry data model
  storage/logStorage.ts      AsyncStorage read/write
  context/LogsContext.tsx    App-wide log state + derived status (asleep/napping/etc.)
  navigation/RootNavigator.tsx
  screens/
    HomeScreen.tsx           Quick-action buttons + current status + recent activity
    HistoryScreen.tsx        Full log grouped by day, tap to edit/delete
  components/
    PrimaryButton.tsx
    StatusCard.tsx
    EntryRow.tsx
    MedicationModal.tsx      "Log medication" form
    EditEntryModal.tsx       Edit/delete any log entry
  theme.ts                   Colors, spacing, typography
  utils/                     Time formatting, id generation
```

## Data model

Every action creates a `LogEntry`:

```ts
{
  id: string;
  type: 'SLEEP_START' | 'SLEEP_END' | 'NAP_START' | 'NAP_END' | 'MEDICATION';
  timestamp: number;       // editable, when the event happened
  medicationName?: string;
  dosage?: string;
  notes?: string;
  createdAt: number;       // when the record was first logged
  updatedAt: number;       // last edit time
}
```

## Notes

- `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`, and `assets/favicon.png` are simple placeholder graphics — swap them for real branded artwork before shipping to the App Store / Play Store.
- To build production binaries for the app stores, use [EAS Build](https://docs.expo.dev/build/introduction/) (`npx eas build --platform ios` / `--platform android`). Build profiles live in `eas.json`.
