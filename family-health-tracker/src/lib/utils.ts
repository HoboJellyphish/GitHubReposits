import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared hover/tap treatment for any Card that's really a button in
// disguise (tapped to open a dialog, drill into detail, etc.) — kept in one
// place so every list across the app feels the same instead of each page
// having picked its own shadow strength.
export const interactiveCard = "cursor-pointer transition-all duration-150 hover:border-primary/30 hover:shadow-md active:scale-[0.99]";
