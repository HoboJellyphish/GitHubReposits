# Publishing Sleep Tracker to the Google Play Store

This covers everything needed to get the app live on Android. The build itself can be done entirely from EAS Build (no local Android Studio needed); everything else is filled in through the Google Play Console in your browser.

## What's already done

- `eas.json` has a `production` profile configured to build a Play Store–ready `.aab` (Android App Bundle), with the build number auto-incrementing on each build.
- `app.json` sets the Android package name to `com.sleeptracker.app` and points to the app icon/adaptive icon.
- `PRIVACY_POLICY.md` — the required privacy policy text, also published as a live page: **[Sleep Tracker Privacy Policy](https://claude.ai/code/artifact/95f9721b-236c-4bf9-9005-e8ab6c92d242)**. That page is private by default — open it and use its share menu to make it public before pasting the link into Play Console, since Google's reviewers and your users both need to be able to open it.

## What only you can do

### 1. Create a Google Play Developer account

Go to [play.google.com/console/signup](https://play.google.com/console/signup), sign in with the Google account you want to publish under, and pay the one-time **$25 USD** registration fee. Approval is usually quick but can take up to 48 hours.

### 2. Build the production Android bundle

On your computer, from the `sleep-tracker` folder:

```
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

This produces a `.aab` file in the cloud (10–20 min) and gives you a download link when it's done.

### 3. Create the app in Play Console

1. In [Play Console](https://play.google.com/console), click **Create app**.
2. App name: `Sleep Tracker` (or whatever you'd like it to show as).
3. Default language, and select **App** (not game), **Free**.
4. Accept the declarations and click **Create app**.

### 4. Fill in the store listing

Under **Grow → Store presence → Main store listing**:

- **Short description** (80 chars): e.g. "Track sleep, naps, and medication times with one tap. Simple and private."
- **Full description**: describe the one-tap sleep/wake/nap tracking, medication logging with timestamps, and editable history — all stored on-device.
- **App icon**: 512×512 — export a larger version of `assets/icon.png`, or design a real one now that you're publishing for real.
- **Feature graphic**: 1024×500 banner image (required).
- **Screenshots**: at least 2, taken from the app running in an emulator or on your phone (Play Console requires real screenshots, not mockups).

### 5. Complete Data Safety

Under **Policy → App content → Data safety**, since this app collects nothing and sends nothing off-device, you'll answer:

- "Does your app collect or share any of the required user data types?" → **No**

That's genuinely accurate here — there's no analytics, no accounts, no network calls at all.

### 6. Fill in the rest of App content

Still under **Policy → App content**, complete each required section:

- **Privacy policy** — paste your published privacy policy URL from above.
- **Ads** — No, the app has no ads.
- **Content rating** — fill out the questionnaire; a local logging app like this typically rates "Everyone."
- **Target audience** — set the appropriate age range.
- **News app / COVID-19 / Government app** declarations — No to all.

### 7. Upload the build

Under **Release → Testing → Internal testing** (recommended first — lets you install and verify it before going public), click **Create new release**, upload the `.aab` from step 2, add release notes, and save.

Once you've verified it installs and works correctly via internal testing, promote the same build to **Production** from the Play Console release flow.

### 8. Submit for review

Play Console will show a checklist of anything incomplete. Once everything's green, submit. Google's review typically takes anywhere from a few hours to a few days for a first submission.

## After it's live

For future updates: bump nothing manually — `autoIncrement: true` in `eas.json` handles the build number. Just run `eas build --platform android --profile production` again after making changes, then upload the new `.aab` as a new release in Play Console.
