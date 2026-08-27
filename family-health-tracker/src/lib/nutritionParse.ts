// Best-effort extraction of common Nutrition Facts fields from OCR'd text.
// OCR on a real label is never perfect (digits get misread, especially a
// unit letter like "g" turning into "9"), so every value this produces is
// meant to be reviewed and corrected by a person before it's saved — never
// applied silently.
export interface ParsedNutrition {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}

function findNumber(text: string, ...labels: string[]): number | undefined {
  for (const label of labels) {
    // Tolerates a line break between the label and the number, and a
    // number OCR has split with a stray space (e.g. "230" read as "2 30").
    const re = new RegExp(`${label}\\s*:?\\s*\\n?\\s*(\\d{1,4}(?:\\s\\d{1,3})?(?:\\.\\d+)?)`, "i");
    const m = text.match(re);
    if (m) {
      const n = Number(m[1].replace(/\s+/g, ""));
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

export function parseNutritionLabel(text: string): ParsedNutrition {
  return {
    calories: findNumber(text, "Calories"),
    fatG: findNumber(text, "Total Fat"),
    sodiumMg: findNumber(text, "Sodium"),
    carbsG: findNumber(text, "Total Carbohydrate", "Total Carb"),
    fiberG: findNumber(text, "Dietary Fiber", "Fiber"),
    sugarG: findNumber(text, "Total Sugars", "Sugars"),
    proteinG: findNumber(text, "Protein"),
  };
}
