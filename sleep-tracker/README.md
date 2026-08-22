# Sleep Tracker

A clean, simple sleep tracker built with [Expo](https://expo.dev) / React Native that runs on both iOS and Android from a single codebase.

## Features

- **One-tap tracking** — three rounded icon buttons on the home screen: an open eye to log waking up, a closed eye to log going to sleep, and a two-tone pill icon that opens the medication log. Every tap is stamped with the current time automatically.
- **Medication log with your own list** — tap the pill button, pick a medication from a list you build once (name + usual dose via the "C" customize button), and the dose/time are pre-filled but stay editable before you save.
- **Recent activity** — the last few logs sit right on the home screen; tap the pencil icon on any entry to fix a time or detail.
- **Full history & export** — swipe/tap up to the History screen for everything you've ever logged, grouped by day and editable. Download the whole history as an Excel spreadsheet (`.xlsx`), a PDF, or a plain Markdown (`.md`) file from there.
- **Menu** — the hamburger menu in the corner holds an optional display name and a "Replay tutorial" button.
- **First-run tutorial** — a short guided tour of the four main areas appears the first time the app opens, and never again unless replayed from the menu.
- **Local persistence** — all data (logs, your medication list, your name) is stored on-device with `AsyncStorage`; no account or network connection is used at any point.

## Tech stack

- Expo (React Native, TypeScript)
- React Navigation (native stack)
- `@react-native-async-storage/async-storage` for persistence
- `@react-native-community/datetimepicker` for editing timestamps
- `react-native-svg` for the two-tone pill icon
- `expo-print` + `expo-sharing` + `expo-file-system` + `xlsx` for the PDF/Excel/Markdown export

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
App.tsx                              Root component (providers + navigation)
src/
  types.ts                           LogEntry, Medication, UserProfile data models
  storage/                           AsyncStorage read/write per data type
  context/
    LogsContext.tsx                  Log entries + derived "currently asleep" state
    MedicationCatalogContext.tsx     The user's saved medication list
    PreferencesContext.tsx           Display name + first-run tutorial state
  navigation/RootNavigator.tsx       Home / MedLog / History stack
  screens/
    HomeScreen.tsx                   Three bubble buttons + recent activity + menu
    MedLogScreen.tsx                 Pick a medication, confirm dose/time, save
    HistoryScreen.tsx                Full log grouped by day, edit/delete, export
  components/
    IconBubble.tsx                   The rounded icon-button used everywhere
    PillIcon.tsx                     Custom two-tone capsule graphic (react-native-svg)
    EntryRow.tsx / EditEntryModal.tsx
    CustomizeMedicationsModal.tsx    Add/remove medications + default dose
    MedicationPickerSheet.tsx        Choose a medication when logging one
    OptionsMenu.tsx                  Name field + replay tutorial
    TutorialOverlay.tsx              First-run guided tour
    ExportSheet.tsx                  Excel / PDF / Markdown export choices
  utils/
    export.ts                       Builds and shares the .xlsx/.pdf/.md files
    time.ts, id.ts
```

## Data model

Every action creates a `LogEntry`:

```ts
{
  id: string;
  type: 'SLEEP_START' | 'SLEEP_END' | 'MEDICATION';
  timestamp: number;       // editable, when the event happened
  medicationName?: string;
  dosage?: string;
  notes?: string;
  createdAt: number;       // when the record was first logged
  updatedAt: number;       // last edit time
}
```

Medications you add via the Customize screen are stored separately as a small catalog so they're one tap to log:

```ts
{
  id: string;
  name: string;
  defaultDose?: string;
}
```

## Notes

- `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash.png`, and `assets/favicon.png` are simple placeholder graphics — swap them for real branded artwork before shipping to the App Store / Play Store.
- To build production binaries for the app stores, use [EAS Build](https://docs.expo.dev/build/introduction/) (`npx eas build --platform ios` / `--platform android`). Build profiles live in `eas.json`.
