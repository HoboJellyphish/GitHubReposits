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
- To build production binaries for the app stores, use [EAS Build](https://docs.expo.dev/build/introduction/) (`npx eas build --platform ios` / `--platform android`).
