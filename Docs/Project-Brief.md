# MedTrak — Project Brief

## Overview

MedTrak is a family medication tracker delivered as a production-grade Progressive Web App (PWA). It gives a household a single, shared place to keep every family member's medications organized — what to take, when to take it, whether it's been taken, and whether there's enough left in the cabinet. It also lets families record basic health readings — like blood pressure, glucose, or temperature — so wellbeing trends are visible alongside medication adherence.

### Problem & Goal

Managing medication across a family is error-prone: doses get missed, schedules live in someone's head, and supplies run out unexpectedly. This is harder still when one person cares for others — a parent managing a child's or a senior relative's medication.

MedTrak's goal is to make organized care feel calm and reliable. It centers on two everyday jobs: helping each person confirm the doses they need to take today, and giving a caretaker clear oversight of everyone they look after — without the cold, clinical feel of typical medical software.

## Target Users

MedTrak supports two roles within a shared family group.

### Patient

- Sees their own medications and the doses scheduled for today.
- Confirms each dose as it's taken.
- Reviews their adherence history over time.

### Caretaker

- Manages every patient in the family group, not just themselves.
- Adds and edits medications, schedules, and forms for any patient.
- Tracks and manages inventory across the group.
- Confirms doses on a patient's behalf.

A caretaker can add a **managed patient** who has no login of their own (useful for a child or a senior). Patients can also self-join a family group using an invite code and choose their role.

## Core Features

- **Today doses + confirm** — Each patient's home view lists the doses due today; taking a dose is a single confirmation tap, with the list updating in real time.
- **History / adherence calendar** — A calendar view of past doses so patients and caretakers can see adherence trends at a glance.
- **Vitals & health trends** — Patients (or caretakers on their behalf) log readings — blood pressure, glucose, temperature, weight, heart rate, SpO₂. A deterministic "rules + trends" layer classifies each reading against reference ranges (Normal / Elevated / Low / High) and detects a trend direction, surfaced as trend cards with sparklines on the patient's Vitals tab and the caretaker's patient-detail view. It is framed as informational guidance, not a diagnosis.
- **Medication management** — Add and edit medications with their schedules and forms (e.g. pill types and timings), scoped to the family group.
- **Inventory & low-stock alerts** — Track how much of each medication remains and surface low-stock warnings before supplies run out.
- **Family groups & invite codes** — Create a family group or join an existing one with an invite code, with roles assigned per member.
- **Notifications / PWA install** — Installable on mobile with an offline fallback; push-notification subscription and setup are built in.
- **Authentication** — Full auth flow: sign in, sign up, forgot password, and password reset/update.
- **Public landing page** — A marketing entry page (features, roles, calls to action) for signed-out visitors; signed-in users are routed straight into the app.

## Tech Stack

Versions are drawn from `package.json`.

- **Framework:** Next.js 14 (`14.2.15`), App Router, TypeScript (`^5.6.2`)
- **UI / Runtime:** React `^18.3.1`, React DOM `^18.3.1`
- **Styling:** Tailwind CSS (`^3.4.13`) with `@tailwindcss/forms` (`^0.5.9`), implementing the "Warm Kinship" design system; PostCSS and Autoprefixer in the toolchain
- **Backend:** Supabase — Postgres, Auth, Row Level Security (RLS), and Realtime — via `@supabase/supabase-js` (`^2.45.4`) and `@supabase/ssr` (`^0.5.2`)
- **PWA:** `@ducanh2912/next-pwa` (`^10.2.9`) — service worker, offline fallback, installable, push-ready (the actively maintained fork, chosen because the original `next-pwa` breaks with the App Router)

Security is enforced by Supabase Row Level Security policies rather than by hiding keys — the app talks to Supabase as the signed-in user, and every table is scoped by family-group membership. Authentication is gated by Next.js middleware on the Edge runtime, which also handles role-based redirects.

## Data Model

MedTrak's schema uses `mt_*` prefixed tables in Postgres, scoped by family group and protected by RLS.

| Table | Purpose |
| --- | --- |
| `mt_family_groups` | A household/care group; carries the invite code used to join. |
| `mt_members` | People in a group and their role (patient or caretaker); a managed patient can exist with no user account (`user_id` null). |
| `mt_medications` | Medications belonging to a family group. |
| `mt_schedules` | Dosing schedules for a medication (when/how often a dose is due). |
| `mt_inventory` | Remaining stock per medication, powering low-stock alerts. |
| `mt_logs` | Dose events — the record of confirmed/taken doses, used for the adherence history. |
| `mt_readings` | Vitals readings (blood pressure, glucose, temperature, weight, heart rate, SpO₂) per patient, powering the health-trends view. |
| `mt_notification_prefs` | Per-member notification preferences. |

Realtime replication is enabled for `mt_logs` and `mt_inventory`, so dose confirmations and inventory changes propagate live across the group.

## Platforms

- **Installable PWA** on mobile — add to home screen, works offline with a dedicated offline fallback, and is push-ready.
- **Responsive browser / desktop** — the layout scales from a single-column mobile experience (with a fixed bottom tab bar) up to a desktop view with a persistent **sidebar navigation** and wider, multi-column dashboards; forms and settings keep a focused reading column.
- **Public landing page** — signed-out visitors arrive on a marketing page; signing in routes them into the app.

## Status & Roadmap

- **Working build.** MedTrak is a functioning application, not a prototype — auth, family groups, medications, dosing, history, inventory, and vitals are implemented end to end.
- **Walkthrough-ready.** The build ships with a re-runnable seeder that populates a realistic demo family — **"The Al-Rashid Family"** (Noura, a caretaker; patients Abdullah, Yousef, and Fatima) — with medications across every form and frequency, ~30 days of adherence history, low-stock alerts, and vitals readings, so it can be demonstrated immediately.
- **Responsive desktop + landing page.** Beyond the original mobile-first designs, a responsive desktop layout (sidebar navigation, multi-column dashboards) and a public marketing landing page have been added.
- **Vitals with rules-and-trends intelligence.** Health readings with deterministic classification against reference ranges and trend detection — kept explainable and framed as informational, not diagnostic.

### Roadmap

- **Narrative health summaries (future).** The vitals layer is intentionally deterministic today. A natural-language summary layer — e.g. "blood pressure trending down over two weeks while adherence held at 94%" — could be layered on top of the same computed trends without changing the underlying rules.

### Known scope boundaries

- **Push delivery** — subscription and endpoint storage are implemented, but actually *sending* pushes requires a server component using the VAPID private key (e.g. a Supabase Edge Function or cron), which is intentionally out of scope for this build.
- **Time zones** — "Today" is currently computed in the server's time zone; multi-time-zone production use would derive the day from the user's locale.
