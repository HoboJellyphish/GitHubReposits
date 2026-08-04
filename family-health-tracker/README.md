# Family Health Tracker

A multi-profile household health tracker that scales from a single user up to a large family. Every profile keeps its own data, its own fully customizable UI, and its own medication list, with a family view for cross-profile comparisons.

All data — including anything synced from wearables — stays on this device (`localStorage`). There is no backend, no analytics, and no network calls anywhere in the app.

## Features

- **Profiles** — create any number of household members, each with independent data. A scrollable/searchable switcher keeps this usable at any size.
- **Timestamped logging** — quick-log with "now," or backdate an entry with a full date/time picker. A filterable, chronological activity log ties it all together.
- **Trackers** — heart rate, sleep (with an awake/asleep eye icon that reflects real state), meals, weight, blood pressure, glucose, mood, symptoms, and water intake. New tracker types can be added to `src/lib/trackers.ts` without touching existing data.
- **Medications** — a personal, searchable medication list per profile; dose logging with taken/missed/skipped states; reminder-time scaffolding.
- **Wearable sync** — an abstracted data-source layer (`src/wearables/`) with a simulated adapter feeding realistic heart-rate and sleep data end-to-end. Swapping in a real Apple Health / Health Connect / Fitbit / Garmin / Whoop / Oura SDK means implementing the same `WearableAdapter` interface — nothing downstream changes.
- **Documents** — upload older lab results, imaging reports, or visit summaries (PDF/image, kept on-device) and see them woven into the same activity timeline as tracked data.
- **Charts** — individual trend charts (day/week/month/custom) and a family comparison view, built with Recharts.
- **Per-profile customization engine** — an item-by-item show/hide/reorder/group editor for both the dashboard and the main navigation, plus a single icon/text/both toggle that restyles every button in the app.
- **Mobile-first** — bottom tab bar on small screens, a sidebar on larger ones, large tap targets, safe-area-aware layout, and a PWA manifest/service worker so it installs cleanly on Android and iOS home screens.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, Radix UI primitives, Recharts, lucide-react.

## Development

```bash
npm install
npm run dev
```

```bash
npm run build   # type-check + production build
npm run lint    # oxlint
```

## Android (Google Play)

The app ships as a native Android project via [Capacitor](https://capacitorjs.com/), wrapping the same web build in a thin native shell — same code, same on-device-only data model.

```bash
npm run android:sync   # build the web app + sync it into android/
npm run android:open   # ...and open the project in Android Studio
```

CI builds a signed release App Bundle automatically: pushing to `main` (or running the workflow manually) triggers `.github/workflows/build-android.yml`, which builds, signs with the upload keystore stored in repo secrets, and uploads `app-release.aab` as a workflow artifact ready to upload to Play Console.

Required repository secrets (see the keystore delivery README for the actual values):

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

The keystore itself is never committed — `android/.gitignore` excludes `*.jks`, `*.keystore`, and `keystore.properties`.
