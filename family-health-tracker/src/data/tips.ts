// Bundled with the app — nothing here is fetched from anywhere, so the
// content is static and won't reflect new research. General wellness
// information only, not medical advice; talk to a clinician for anything
// specific to a real condition or diagnosis.
export type TipCategory = "hydration" | "sleep" | "nutrition" | "movement" | "recovery" | "stress";

export interface Tip {
  id: string;
  category: TipCategory;
  title: string;
  body: string;
}

export const TIP_CATEGORIES: { value: TipCategory; label: string }[] = [
  { value: "hydration", label: "Hydration" },
  { value: "sleep", label: "Sleep" },
  { value: "nutrition", label: "Nutrition" },
  { value: "movement", label: "Movement" },
  { value: "recovery", label: "Recovery" },
  { value: "stress", label: "Stress & Mind" },
];

export const TIPS: Tip[] = [
  { id: "hyd-1", category: "hydration", title: "Start the day with water", body: "A glass of water before your first coffee or tea helps rehydrate after a night's sleep and can ease morning grogginess." },
  { id: "hyd-2", category: "hydration", title: "Thirst comes late", body: "By the time you feel thirsty, you're often already mildly dehydrated. Sipping through the day beats one big glass when you notice you're parched." },
  { id: "hyd-3", category: "hydration", title: "Food counts too", body: "Fruits and vegetables like cucumber, watermelon, and oranges are 85–95% water and add up over a day of meals." },
  { id: "hyd-4", category: "hydration", title: "Check the color", body: "Pale yellow urine is a simple, reliable sign you're well hydrated; dark yellow is a nudge to drink more." },
  { id: "hyd-5", category: "hydration", title: "More after activity", body: "Sweating from exercise or heat means replacing more than usual — a bottle of water alongside a workout helps you recover faster." },

  { id: "sleep-1", category: "sleep", title: "Keep a consistent wake time", body: "Waking up at the same time every day — even on weekends — helps steady your body clock more than a fixed bedtime does." },
  { id: "sleep-2", category: "sleep", title: "Dim the lights before bed", body: "Bright light in the evening, especially from screens, delays the body's natural release of melatonin. Dimming lights an hour before bed can help you fall asleep faster." },
  { id: "sleep-3", category: "sleep", title: "Cool rooms sleep better", body: "A bedroom around 65–68°F (18–20°C) tends to support deeper sleep than a warm room." },
  { id: "sleep-4", category: "sleep", title: "Caffeine has a long tail", body: "Caffeine can stay active in your system for 6+ hours. An afternoon coffee may still be affecting your sleep that night." },
  { id: "sleep-5", category: "sleep", title: "Naps under 30 minutes", body: "A short nap can restore alertness without leaving you groggy or making it harder to fall asleep that night." },
  { id: "sleep-6", category: "sleep", title: "Wind-down routines work", body: "Doing the same low-key activities before bed each night — reading, stretching, a warm shower — signals to your body that sleep is coming." },

  { id: "nutr-1", category: "nutrition", title: "Half the plate, produce", body: "Filling half your plate with vegetables or fruit is a simple way to boost fiber and micronutrients without counting anything." },
  { id: "nutr-2", category: "nutrition", title: "Protein at every meal", body: "Spreading protein across breakfast, lunch, and dinner — rather than loading it into one meal — supports steadier energy and muscle maintenance." },
  { id: "nutr-3", category: "nutrition", title: "Fiber slows the sugar spike", body: "Pairing carbs with fiber (like fruit with skin, or whole grains) slows how fast sugar hits your bloodstream compared to refined carbs alone." },
  { id: "nutr-4", category: "nutrition", title: "Read the serving size first", body: "A label's calorie and sugar numbers only make sense next to the serving size — a bag can easily contain 3–4 servings." },
  { id: "nutr-5", category: "nutrition", title: "Frozen counts as fresh", body: "Frozen fruits and vegetables are typically flash-frozen at peak ripeness and can match fresh produce in nutrients, often for less money." },
  { id: "nutr-6", category: "nutrition", title: "Slow down at meals", body: "It takes roughly 20 minutes for fullness signals to catch up with your stomach — eating slower gives your body a chance to tell you when to stop." },

  { id: "mov-1", category: "movement", title: "Movement snacks add up", body: "Three 10-minute walks spread through the day give similar benefits to one 30-minute walk, if a single block of time is hard to find." },
  { id: "mov-2", category: "movement", title: "Stand up every hour", body: "Long unbroken sitting is linked to worse outcomes even for people who exercise regularly — a quick stand-and-stretch each hour helps." },
  { id: "mov-3", category: "movement", title: "Strength training isn't just for muscle", body: "Resistance exercise (even bodyweight) helps bone density, balance, and metabolic health, not only visible muscle." },
  { id: "mov-4", category: "movement", title: "Warm up before, stretch after", body: "A short warm-up (light cardio) primes muscles for exertion; static stretching is generally more useful after activity, once muscles are warm." },
  { id: "mov-5", category: "movement", title: "Stairs are a free workout", body: "Taking the stairs instead of the elevator for a few flights is a small, repeatable way to add cardiovascular effort to an ordinary day." },

  { id: "rec-1", category: "recovery", title: "Rest is part of the plan", body: "Muscles and tissue actually rebuild during rest, not during the activity itself — a scheduled rest day is doing real work, not \"nothing.\"" },
  { id: "rec-2", category: "recovery", title: "Sleep is the biggest recovery lever", body: "More than any supplement or gadget, consistent, adequate sleep is the single largest factor in how well the body recovers from illness or exertion." },
  { id: "rec-3", category: "recovery", title: "Gentle movement can speed recovery", body: "For many minor illnesses and everyday soreness, light movement — a short walk, gentle stretching — supports recovery better than complete inactivity, once you're feeling up to it." },
  { id: "rec-4", category: "recovery", title: "Fluids and electrolytes after illness", body: "Fever, vomiting, or diarrhea can deplete fluids and electrolytes faster than usual — water plus a source of electrolytes (broth, an oral rehydration drink) helps more than water alone." },
  { id: "rec-5", category: "recovery", title: "Track symptoms, not just feelings", body: "Logging a symptom's severity day to day — even a rough 1–5 scale — makes it much easier to tell a clinician whether something is actually improving." },
  { id: "rec-6", category: "recovery", title: "Give it time before judging progress", body: "Recovery from most illnesses or injuries isn't linear — a day that feels worse than yesterday doesn't necessarily mean things are heading backward." },

  { id: "str-1", category: "stress", title: "Slow breathing calms the body", body: "Breathing out longer than you breathe in (e.g. 4 seconds in, 6 seconds out) activates the body's relaxation response within a couple of minutes." },
  { id: "str-2", category: "stress", title: "Name it to tame it", body: "Simply labeling a feeling — \"I'm anxious about this\" — has been shown to reduce its intensity, compared to leaving it unnamed." },
  { id: "str-3", category: "stress", title: "Short breaks prevent burnout", body: "Brief breaks between focused tasks help sustain attention through the day better than pushing straight through for hours." },
  { id: "str-4", category: "stress", title: "Sunlight early in the day", body: "Morning light exposure helps regulate mood and the sleep-wake cycle — even 10–15 minutes outside can help." },
  { id: "str-5", category: "stress", title: "Connection is protective", body: "Regular contact with people you trust is one of the most consistently protective factors for mental health across studies." },
];

export function tipsByCategory(category: TipCategory): Tip[] {
  return TIPS.filter((t) => t.category === category);
}

/** A stable "tip of the day" — same tip all day for a given date, cycling
 * through the list, no randomness needed. */
export function tipOfTheDay(date: Date = new Date()): Tip {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return TIPS[dayIndex % TIPS.length];
}
