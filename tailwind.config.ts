import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

/**
 * Warm Kinship design system (exported from Google Stitch / DESIGN.md).
 * Tokens are kept verbatim so component markup matches the Stitch exports.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#c4c6d0",
        "on-primary-fixed": "#001b3e",
        "tertiary-container": "#492400",
        tertiary: "#2b1300",
        outline: "#74777f",
        "surface-dim": "#dcd9d9",
        "surface-tint": "#455f8a",
        "inverse-surface": "#313030",
        background: "#fcf9f8",
        "surface-container-highest": "#e5e2e1",
        "on-primary": "#ffffff",
        "on-secondary-fixed-variant": "#005320",
        surface: "#fcf9f8",
        "on-surface-variant": "#44474f",
        "error-container": "#ffdad6",
        "tertiary-fixed": "#ffdcc3",
        "secondary-fixed-dim": "#62df7d",
        "primary-container": "#0f2d56",
        "on-tertiary": "#ffffff",
        "on-primary-fixed-variant": "#2d4771",
        "inverse-primary": "#adc7f9",
        "primary-fixed": "#d6e3ff",
        "on-error-container": "#93000a",
        "surface-container-lowest": "#ffffff",
        "secondary-fixed": "#7ffc97",
        "surface-container-low": "#f6f3f2",
        "surface-container": "#f0edec",
        "on-secondary": "#ffffff",
        "on-primary-container": "#7c95c4",
        "on-background": "#1c1b1b",
        error: "#ba1a1a",
        "on-secondary-container": "#007230",
        "on-tertiary-fixed": "#2f1500",
        "on-tertiary-container": "#df7c0f",
        "surface-container-high": "#ebe7e7",
        "surface-variant": "#e5e2e1",
        "on-tertiary-fixed-variant": "#6e3900",
        "surface-bright": "#fcf9f8",
        "on-surface": "#1c1b1b",
        "secondary-container": "#7cf994",
        primary: "#001839",
        "primary-fixed-dim": "#adc7f9",
        "on-secondary-fixed": "#002109",
        "tertiary-fixed-dim": "#ffb77d",
        "on-error": "#ffffff",
        secondary: "#006e2d",
        "inverse-on-surface": "#f3f0ef",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        "margin-desktop": "auto",
        gutter: "16px",
        base: "8px",
        "margin-mobile": "20px",
        "max-width-content": "640px",
        "touch-target": "56px",
      },
      maxWidth: {
        "max-width-content": "640px",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        "label-md": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        "button-text": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        "body-md": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        "headline-lg-mobile": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      fontSize: {
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600" }],
        "button-text": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      boxShadow: {
        soft: "0px 4px 20px rgba(15, 45, 86, 0.08)",
        "soft-sm": "0px 4px 20px rgba(15, 45, 86, 0.04)",
        "nav-top": "0px -4px 20px rgba(15, 45, 86, 0.08)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [forms],
};

export default config;
