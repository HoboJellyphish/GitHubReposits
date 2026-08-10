// Parses numbers out of speech-recognition transcripts. Chrome/Android's
// recognizer already returns digits for most spoken numbers ("seventy two"
// -> "72"), so the digit regex handles the common case; the word-number
// fallback below covers recognizers/languages that spell numbers out.
const ONES: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

function wordsToWholeNumber(words: string[]): number | null {
  let total = 0;
  let current = 0;
  let matched = false;
  for (const raw of words) {
    const w = raw.toLowerCase();
    if (w === "and") continue;
    if (w in ONES) {
      current += ONES[w];
      matched = true;
    } else if (w in TENS) {
      current += TENS[w];
      matched = true;
    } else if (w === "hundred") {
      current = (current || 1) * 100;
      matched = true;
    } else if (matched) {
      // Stop at the first word that breaks the numeric phrase.
      break;
    }
  }
  return matched ? total + current : null;
}

/**
 * Extracts the first number spoken in free text — digits ("72", "98.6") or
 * spelled-out words ("seventy two", "ninety eight point six"). Returns null
 * if nothing in the text parses as a number.
 */
export function extractSpokenNumber(text: string): number | null {
  const cleaned = text.trim();
  const digitMatch = cleaned.match(/-?\d+(\.\d+)?/);
  if (digitMatch) return Number(digitMatch[0]);

  const [wholePart, fractionPart] = cleaned.toLowerCase().split(/\bpoint\b/);
  const whole = wordsToWholeNumber(wholePart.trim().split(/\s+/).filter(Boolean));
  if (whole === null) return null;
  if (!fractionPart) return whole;

  const fractionDigits = fractionPart
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ONES[w.toLowerCase()])
    .filter((n): n is number => n !== undefined);
  if (fractionDigits.length === 0) return whole;
  return Number(`${whole}.${fractionDigits.join("")}`);
}

/**
 * Extracts two numbers in spoken order — for readings like "118 over 76" or
 * "one eighteen seventy six". Returns null unless at least two are found.
 */
export function extractTwoSpokenNumbers(text: string): [number, number] | null {
  const digits = text.match(/-?\d+(\.\d+)?/g);
  if (digits && digits.length >= 2) return [Number(digits[0]), Number(digits[1])];
  return null;
}
