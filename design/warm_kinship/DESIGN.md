---
name: Warm Kinship
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#44474f'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#74777f'
  outline-variant: '#c4c6d0'
  surface-tint: '#455f8a'
  primary: '#001839'
  on-primary: '#ffffff'
  primary-container: '#0f2d56'
  on-primary-container: '#7c95c4'
  inverse-primary: '#adc7f9'
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#2b1300'
  on-tertiary: '#ffffff'
  tertiary-container: '#492400'
  on-tertiary-container: '#df7c0f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f9'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#2d4771'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  touch-target: 56px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: auto
  max-width-content: 640px
---

## Brand & Style
The brand personality focuses on reliability and domestic warmth, moving away from the cold, sterile aesthetics often associated with medical software. This design system is built for families managing health together, prioritizing clarity, ease of use, and a sense of calm. 

The design style is **Corporate / Modern** with a **Tactile** lean. It uses generous whitespace and soft lighting effects to create an interface that feels approachable and human. The goal is to evoke a sense of organized care rather than clinical urgency. High legibility and large interactive zones ensure the system is accessible to users of all ages, from parents to seniors.

## Colors
The palette is grounded in a deep Navy primary, providing an anchor of authority and trust. The background uses a warm white rather than a pure clinical white to reduce eye strain and feel more "home-like."

- **Primary (Navy):** Used for headers, primary actions, and brand identification.
- **Success (Green):** Indicates completed doses or healthy trends.
- **Warning (Amber):** Used for low-stock alerts or upcoming appointments.
- **Alert (Red):** Reserved strictly for missed medications or critical health warnings.
- **Neutral (Off-Black):** Used for all primary text to ensure high contrast against the warm background.

## Typography
This design system utilizes **Plus Jakarta Sans** for its friendly, rounded terminals and exceptional readability. The minimum font size is locked at 16px to ensure accessibility for all family members.

Headlines use a tighter letter-spacing and heavier weight to create clear visual hierarchy, while body text maintains a generous line height (1.5x) to facilitate easy reading of dosage instructions and schedules. Labels are slightly smaller but emboldened and tracked out to distinguish them from interactive body text.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for core content, centered on the screen to maintain focus and reduce scanning effort. 

- **Desktop:** Content is restricted to a 640px central column to mirror the ease of mobile interaction and prevent long line lengths.
- **Mobile:** Uses 20px side margins with a fluid 1-column layout.
- **Touch Targets:** All interactive elements (buttons, inputs, list items) must maintain a minimum height of 56px.
- **Rhythm:** An 8px linear scale is used for all padding and margins to ensure a consistent vertical rhythm.

## Elevation & Depth
Depth is created through **Tonal Layers** and soft, natural shadows. 

- **Level 0 (Background):** The warm white (#F8F7F4) base layer.
- **Level 1 (Cards):** Pure white (#FFFFFF) surfaces with a very soft, diffused shadow (0px 4px 20px rgba(15, 45, 86, 0.08)). These cards house the primary content.
- **Level 2 (Modals/Overlays):** These use a slightly tighter shadow with more spread to appear closer to the user.

Outlines are used sparingly, primarily for input fields and inactive button states, using a low-contrast 1px border (#E2E2E2).

## Shapes
The shape language is "Soft-Square," balancing professionalism with friendliness. 

- **Cards:** Defined at 12px to give them a distinct, containerized feel that softens the overall layout.
- **Buttons & Inputs:** Defined at 8px. This slight reduction in radius compared to cards creates a subtle nested hierarchy where internal elements feel more "functional" than their containers.
- **Chips:** Always pill-shaped (fully rounded) to differentiate them from actionable buttons.

## Components

- **Buttons:** Primary buttons use the Navy background with white text. They are 56px tall. Secondary buttons use a Navy outline with a transparent background.
- **Input Fields:** Utilize **Floating Labels** that sit inside the 56px tall container. On focus, the label scales down and moves to the top-left, while the border thickens to 2px Navy.
- **Cards:** Centered in the layout. They contain no borders, relying instead on the soft elevation shadows and the pure white color contrast against the warm background.
- **Medication Chips:** Small indicators for pill types or timings. These use low-saturation versions of the Success/Warning colors to ensure they don't overpower the text.
- **Dosage Lists:** List items are 64px tall with 16px horizontal padding. They feature a leading icon (medication type) and a trailing chevron or checkbox.
- **Progress Ring:** A custom component used to show daily adherence, utilizing the Success Green for completed segments.