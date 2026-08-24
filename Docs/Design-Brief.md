# MedTrak — Design Brief

The MedTrak interface is built on a single design system: **"Warm Kinship."** This brief summarizes that system so a designer or stakeholder can understand it at a glance. All values are drawn from `design/warm_kinship/DESIGN.md`.

## Design Philosophy

Warm Kinship is built for families managing health together. Its personality centers on **reliability and domestic warmth**, deliberately moving away from the cold, sterile aesthetics of typical medical software. The style is **Corporate / Modern with a Tactile lean**: generous whitespace and soft lighting effects make the interface feel approachable and human.

The goal is to evoke **organized care, not clinical urgency**. High legibility and large interactive zones keep the system accessible to users of all ages — from parents to seniors.

## Color Palette

The palette is anchored by a deep **navy** primary for authority and trust, set against a **warm white** background (rather than a pure clinical white) to reduce eye strain and feel more "home-like." Status colors are reserved for meaning: green for success, amber for warnings, red strictly for critical alerts.

| Name | Hex | Usage |
| --- | --- | --- |
| Primary (Navy) | `#001839` | Headers, primary actions, brand identity; primary buttons use navy with white text. |
| On-Primary | `#ffffff` | Text/icons on navy surfaces. |
| Primary Container | `#0f2d56` | Tonal navy container for supporting primary elements. |
| Success (Green) | `#006e2d` | Completed doses, healthy trends, progress-ring fill. |
| Success Container | `#7cf994` | Low-saturation green backing for chips and success accents. |
| Warning / Tertiary accent | `#df7c0f` (amber) | Low-stock alerts and upcoming appointments. |
| Error (Red) | `#ba1a1a` | Reserved strictly for missed medications and critical health warnings. |
| Error Container | `#ffdad6` | Soft red backing for error states. |
| Background / Surface | `#fcf9f8` | Warm white base layer (Level 0). |
| Surface Container Lowest | `#ffffff` | Pure white card surfaces (Level 1), contrasting against the warm background. |
| Surface Container Low | `#f6f3f2` | Slightly tinted container surface. |
| Surface Container | `#f0edec` | Grouped-content surface. |
| On-Surface (Off-Black) | `#1c1b1b` | All primary text — high contrast on the warm background. |
| On-Surface Variant | `#44474f` | Secondary text and supporting labels. |
| Outline | `#74777f` | Sparingly used borders (inputs, inactive states). |
| Outline Variant | `#c4c6d0` | Low-contrast dividers and hairlines. |

> Note: the design system uses `#fcf9f8` for UI surfaces (the Stitch token), while the PWA manifest sets `background_color` to `#f8f7f4` per the original brief.

## Typography

The system uses **Plus Jakarta Sans** throughout, chosen for its friendly, rounded terminals and exceptional readability. The **minimum font size is locked at 16px** to ensure accessibility for every family member. Body text keeps a generous 1.5× line height to make dosage instructions and schedules easy to read; labels are smaller but emboldened and tracked out to distinguish them from interactive body text.

| Style | Size / Line height | Weight | Notes |
| --- | --- | --- | --- |
| Headline Large | 32px / 40px | 700 | Tight letter-spacing (−0.02em) for clear hierarchy. |
| Headline Large (mobile) | 28px / 36px | 700 | Mobile step-down of the large headline. |
| Headline Medium | 24px / 32px | 600 | Section headers. |
| Body Large | 18px / 28px | 400 | Emphasized body copy. |
| Body Medium | 16px / 24px | 400 | Default body — the 16px accessibility floor. |
| Label Medium | 14px / 20px | 600 | Tracked out (+0.05em) to read as a label, not a link. |
| Button Text | 16px / 24px | 600 | Button labels. |

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for core content, centered to maintain focus and reduce scanning effort.

- **8px scale** — an 8px linear scale governs all padding and margins for consistent vertical rhythm (gutter 16px, mobile side margins 20px).
- **56px touch targets** — every interactive element (buttons, inputs, list items) maintains a minimum height of 56px.
- **640px mobile reading column** — content is restricted to a 640px central column so line lengths stay comfortable and the desktop experience mirrors the ease of mobile. Mobile uses a fluid single-column layout with 20px side margins.
- **Responsive desktop layout** — building on the mobile-first foundation, MedTrak adds a responsive desktop layout with **sidebar navigation** and **wider, multi-column dashboards** for the caretaker views, while patient reading content keeps its focused central column.
- **Public landing page** — a full-width marketing layout (top bar, hero with a product preview, feature grid, patient/caretaker role split, and a call-to-action band) that breaks out of the focused app column while keeping the same tokens, type scale, and soft elevation.

## Components

- **Buttons** — Primary buttons use a navy background with white text and are 56px tall. Secondary buttons use a navy outline over a transparent background.
- **Input fields** — 56px-tall containers with **floating labels** that sit inside the field; on focus the label scales down to the top-left and the border thickens to a 2px navy stroke.
- **Cards** — Centered in the layout, borderless; they rely on soft elevation shadows and pure-white contrast against the warm background rather than outlines.
- **Medication chips** — Small pill-type/timing indicators using low-saturation versions of the success/warning colors so they don't overpower text.
- **Dosage lists** — List items are 64px tall with 16px horizontal padding, featuring a leading medication-type icon and a trailing chevron or checkbox.
- **Progress ring** — A custom component showing daily adherence, filling completed segments in success green.
- **Vitals trend cards** — Each health-reading type gets a card showing the latest value, a status chip (Normal / Elevated / Low / High), and a single-series sparkline colored by that status. Meaning is never carried by color alone — the status chip's icon and label always accompany it.

## Data Visualization

Trends are shown with restraint. Vitals use a single-series **sparkline** — a thin 2px line with no axes or gridlines — colored by the latest reading's **status** (the reserved green / amber / red palette), never by identity. Because that color carries clinical meaning, it is always paired with an icon-and-label status chip and an accessible text description of the trend, so the state stays legible without relying on color. The result reads as a calm, glanceable health snapshot rather than a dense dashboard.

## Elevation & Depth

Depth is built from **tonal layers** and soft, natural shadows:

- **Level 0 (Background):** the warm white base layer.
- **Level 1 (Cards):** pure white (`#ffffff`) surfaces with a very soft, diffused shadow (`0px 4px 20px rgba(15, 45, 86, 0.08)`).
- **Level 2 (Modals / Overlays):** a slightly tighter shadow with more spread, so overlays feel closer to the user.

Outlines are used sparingly — mainly for input fields and inactive button states — as a low-contrast 1px border.

## Shape Language

The shape language is **"Soft-Square,"** balancing professionalism with friendliness through a subtle nested hierarchy:

- **Cards:** 12px radius — a distinct, containerized feel that softens the layout.
- **Buttons & inputs:** 8px radius — slightly tighter than cards, making internal elements feel more "functional" than their containers.
- **Chips:** always pill-shaped (fully rounded) to distinguish them from actionable buttons.

## Iconography

Icons use **Material Symbols Outlined**, keeping the interface light and legible in line with the friendly, approachable tone of the system. The vitals feature draws health-specific glyphs (blood pressure, glucose, temperature, weight, heart rate, oxygen) from the same set for consistency.
