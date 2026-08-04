/**
 * MedTrak demo data seeder.
 *
 * Seeds the live Supabase project with a realistic family so every screen is
 * populated for a walkthrough. Uses ONLY the public anon key: it signs up (or
 * signs in) a demo caretaker and inserts the family under that authenticated
 * session, so Row Level Security is satisfied exactly the way the real app
 * satisfies it — no service-role key required.
 *
 * It is IDEMPOTENT and re-runnable: members are reused (and renamed in place if
 * the demo names change), medications + logs are wiped and rebuilt each run
 * against the current clock. Run it shortly before a walkthrough so "today"
 * looks live:
 *
 *     npm run seed
 *
 * Demo logins it creates (password for both):  MedTrak2026!
 *   • Caretaker:  demo.caretaker@medtrak.app   (Noura)
 *   • Patient:    demo.patient@medtrak.app     (Fatima)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

/* ------------------------------------------------------------------ config */

const CARETAKER = { email: "demo.caretaker@medtrak.app", password: "MedTrak2026!", name: "Noura Al-Rashid" };
const PATIENT_LOGIN = { email: "demo.patient@medtrak.app", password: "MedTrak2026!", name: "Fatima Al-Rashid" };
const FAMILY_NAME = "The Al-Rashid Family";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL_ || !ANON) throw new Error("Missing Supabase env in .env.local");

const newClient = () => createClient(URL_, ANON, { auth: { persistSession: false } });

/* --------------------------------------------------------------- helpers */

function die(label, error) {
  if (error) {
    console.error(`\n✗ ${label}:`, error.message ?? error);
    process.exit(1);
  }
}

/** Sign in; if the account doesn't exist yet, sign up. Returns the user id. */
async function ensureAccount(client, { email, password }) {
  let { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    ({ data, error } = await client.auth.signUp({ email, password }));
    die(`sign up ${email}`, error);
  }
  if (!data?.user) die(`no user for ${email}`, new Error("no session"));
  return data.user.id;
}

const pad = (n) => String(n).padStart(2, "0");
const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const epochDay = (d) => Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86_400_000);

function isDueOn(freq, specificDays, date) {
  if (freq === "weekly") return (specificDays ?? []).includes(date.getDay());
  if (freq === "alternate_days") return epochDay(date) % 2 === 0;
  return true; // daily
}

/** Deterministic 0..99 so re-runs produce the same history pattern. */
function hash(...nums) {
  let h = 2166136261;
  for (const n of nums) {
    h ^= n;
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100;
}

/* ----------------------------------------------------------------- data */

// key → member; `login: true` means this patient has their own sign-in.
const PATIENTS = [
  { key: "abdullah", name: "Abdullah Al-Rashid", userId: null },        // grandfather (managed)
  { key: "yousef", name: "Yousef Al-Rashid", userId: null },           // son (managed)
  { key: "fatima", name: PATIENT_LOGIN.name, userId: null, login: true }, // mother (has login)
];

const MEDS = [
  { patient: "abdullah", name: "Amlodipine", form: "tablet", amount: 5, unit: "mg",
    notes: "For blood pressure. Take one tablet each morning.",
    frequency: "daily", specificDays: null,
    slots: [{ label: "morning", time: "08:00", qty: 1 }],
    inventory: { qty: 3, threshold: 7 } },                              // critical (low)
  { patient: "abdullah", name: "Metformin", form: "tablet", amount: 500, unit: "mg",
    notes: "Diabetes. Take with meals, three times a day.",
    frequency: "daily", specificDays: null,
    slots: [{ label: "morning", time: "08:00", qty: 1 }, { label: "afternoon", time: "13:30", qty: 1 }, { label: "evening", time: "19:00", qty: 1 }],
    inventory: { qty: 12, threshold: 7 } },                             // warning (low-ish)
  { patient: "abdullah", name: "Atorvastatin", form: "tablet", amount: 20, unit: "mg",
    notes: "For cholesterol. Take at night.",
    frequency: "daily", specificDays: null,
    slots: [{ label: "night", time: "22:00", qty: 1 }],
    inventory: { qty: 60, threshold: 10 } },
  { patient: "abdullah", name: "Vitamin B12", form: "injection", amount: 1000, unit: "mcg",
    notes: "Injection every other day.",
    frequency: "alternate_days", specificDays: null,
    slots: [{ label: "morning", time: "09:00", qty: 1 }],
    inventory: { qty: 20, threshold: 14 } },
  { patient: "yousef", name: "Salbutamol Inhaler", form: "other", amount: 100, unit: "mcg",
    notes: "Asthma reliever — two puffs (100mcg each).",
    frequency: "daily", specificDays: null,
    slots: [{ label: "morning", time: "07:30", qty: 2 }, { label: "night", time: "21:00", qty: 2 }],
    inventory: { qty: 120, threshold: 7 } },
  { patient: "yousef", name: "Cetirizine", form: "syrup", amount: 5, unit: "ml",
    notes: "For seasonal allergies. One spoon at night.",
    frequency: "daily", specificDays: null,
    slots: [{ label: "night", time: "21:00", qty: 1 }],
    inventory: { qty: 30, threshold: 7 } },
  { patient: "fatima", name: "Levothyroxine", form: "tablet", amount: 50, unit: "mcg",
    notes: "Thyroid. Empty stomach, 30 min before breakfast.",
    frequency: "daily", specificDays: null,
    slots: [{ label: "morning", time: "06:30", qty: 1 }],
    inventory: { qty: 45, threshold: 10 } },
  { patient: "fatima", name: "Vitamin D3", form: "capsule", amount: 1000, unit: "IU",
    notes: "One capsule every Sunday.",
    frequency: "weekly", specificDays: [0],
    slots: [{ label: "morning", time: "09:00", qty: 1 }],
    inventory: { qty: 8, threshold: 14 } },
  { patient: "fatima", name: "Omega-3", form: "capsule", amount: 1000, unit: "mg",
    notes: "With dinner.",
    frequency: "daily", specificDays: null,
    slots: [{ label: "evening", time: "19:30", qty: 1 }],
    inventory: { qty: 20, threshold: 10 } },
];

const HISTORY_DAYS = 30;

/* ------------------------------------------------------------------ main */

async function main() {
  console.log("MedTrak seeder — connecting to", URL_);

  // 1) Auth: caretaker on the main client, the login-patient on her own client.
  const supa = newClient();
  const patientClient = newClient();
  const caretakerUid = await ensureAccount(supa, CARETAKER);
  const patientUid = await ensureAccount(patientClient, PATIENT_LOGIN);
  PATIENTS.find((p) => p.login).userId = patientUid;
  console.log("✓ authenticated caretaker + patient demo accounts");

  // 2) Family group — reuse the caretaker's existing membership if present.
  let groupId, caretakerMemberId;
  {
    const { data: myMember } = await supa
      .from("mt_members")
      .select("id, family_group_id")
      .eq("user_id", caretakerUid)
      .eq("role", "caretaker")
      .maybeSingle();

    if (myMember) {
      groupId = myMember.family_group_id;
      caretakerMemberId = myMember.id;
      await supa.from("mt_family_groups").update({ name: FAMILY_NAME }).eq("id", groupId);
      await supa.from("mt_members").update({ display_name: CARETAKER.name }).eq("id", caretakerMemberId);
      console.log("✓ reusing existing family group", groupId);
    } else {
      let code, inserted;
      for (let i = 0; i < 6 && !inserted; i++) {
        code = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
        const { data, error } = await supa
          .from("mt_family_groups")
          .insert({ name: FAMILY_NAME, invite_code: code })
          .select("id")
          .single();
        if (!error) inserted = data;
        else if (error.code !== "23505") die("create family group", error);
      }
      groupId = inserted.id;
      const { data: cm, error: cmErr } = await supa
        .from("mt_members")
        .insert({ user_id: caretakerUid, family_group_id: groupId, role: "caretaker", display_name: CARETAKER.name })
        .select("id")
        .single();
      die("create caretaker member", cmErr);
      caretakerMemberId = cm.id;
      console.log("✓ created family group", groupId, "invite code", code);
    }
  }

  // 3) Ensure patient members. Reuse existing rows (renaming in place) so the
  //    demo can be re-pointed to different names without orphaning rows — the
  //    DB has no member-DELETE policy, but caretakers may UPDATE members.
  const { data: existingP } = await supa
    .from("mt_members").select("id, user_id").eq("family_group_id", groupId).eq("role", "patient");
  const pool = existingP ?? [];
  const used = new Set();
  const memberIdByKey = {};
  for (const p of PATIENTS) {
    let row = p.userId
      ? pool.find((m) => m.user_id === p.userId) ?? pool.find((m) => !used.has(m.id) && m.user_id == null)
      : pool.find((m) => !used.has(m.id) && m.user_id == null);
    if (row) {
      used.add(row.id);
      await supa.from("mt_members")
        .update({ display_name: p.name, user_id: p.userId ?? row.user_id ?? null })
        .eq("id", row.id);
      memberIdByKey[p.key] = row.id;
    } else {
      const { data, error } = await supa
        .from("mt_members")
        .insert({ user_id: p.userId, family_group_id: groupId, role: "patient", display_name: p.name })
        .select("id").single();
      die(`create patient ${p.name}`, error);
      memberIdByKey[p.key] = data.id;
    }
  }
  console.log("✓ patient members ready:", PATIENTS.map((p) => p.name).join(", "));

  // 4) Reset: delete existing meds (+schedules/inventory) and logs for the group.
  const patientIds = Object.values(memberIdByKey);
  const { data: oldMeds } = await supa.from("mt_medications").select("id").eq("family_group_id", groupId);
  const oldMedIds = (oldMeds ?? []).map((m) => m.id);
  await supa.from("mt_logs").delete().in("patient_id", patientIds);
  await supa.from("mt_readings").delete().in("patient_id", patientIds);
  if (oldMedIds.length) {
    await supa.from("mt_inventory").delete().in("medication_id", oldMedIds);
    await supa.from("mt_schedules").delete().in("medication_id", oldMedIds);
    await supa.from("mt_medications").delete().in("id", oldMedIds);
  }
  console.log(`✓ cleared ${oldMedIds.length} old medication(s) and their logs`);

  // 5) Insert medications, schedules, inventory. Collect schedule rows for logs.
  const scheduleRows = [];
  for (let mi = 0; mi < MEDS.length; mi++) {
    const m = MEDS[mi];
    const patientId = memberIdByKey[m.patient];
    const { data: med, error: medErr } = await supa
      .from("mt_medications")
      .insert({
        patient_id: patientId, family_group_id: groupId, name: m.name, form: m.form,
        dosage_amount: m.amount, dosage_unit: m.unit, notes: m.notes, is_active: true,
      })
      .select("id").single();
    die(`insert med ${m.name}`, medErr);

    const { data: scheds, error: schErr } = await supa
      .from("mt_schedules")
      .insert(m.slots.map((s) => ({
        medication_id: med.id, time_label: s.label, scheduled_time: `${s.time}:00`,
        quantity: s.qty, frequency: m.frequency, specific_days: m.specificDays, is_active: true,
      })))
      .select("id, time_label");
    die(`insert schedules ${m.name}`, schErr);

    // Inventory `unit` reuses the medication's dosage unit (the app does the same,
    // and it's covered by the dosage_unit CHECK constraint).
    const { error: invErr } = await supa.from("mt_inventory").insert({
      medication_id: med.id, quantity_remaining: m.inventory.qty, unit: m.unit,
      low_stock_threshold_days: m.inventory.threshold, last_restocked_at: new Date().toISOString(),
    });
    die(`insert inventory ${m.name}`, invErr);

    m.slots.forEach((s, si) => {
      const sched = scheds.find((x) => x.time_label === s.label);
      scheduleRows.push({
        scheduleId: sched.id, patientId, medIndex: mi, slotIndex: si,
        time: s.time, qty: s.qty, frequency: m.frequency, specificDays: m.specificDays,
      });
    });
  }
  console.log(`✓ inserted ${MEDS.length} medications with schedules + inventory`);

  // 6) Generate logs: 30 days of history + a live "today" snapshot.
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const logs = [];
  let taken = 0, missed = 0, skipped = 0, pending = 0;

  for (let offset = HISTORY_DAYS; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const dateKey = toDateKey(date);
    const isToday = offset === 0;

    for (const sr of scheduleRows) {
      if (!isDueOn(sr.frequency, sr.specificDays, date)) continue;
      const [hh, mm] = sr.time.split(":").map(Number);
      const dueMinutes = hh * 60 + mm;

      let status;
      if (isToday) {
        if (dueMinutes > nowMinutes) { pending++; continue; } // not due yet → no log (pending)
        // A couple of deliberate exceptions today so the dashboard shows variety.
        const abdullahMetforminMorning = sr.medIndex === 1 && sr.slotIndex === 0;
        const yousefCetirizine = sr.medIndex === 5;
        if (abdullahMetforminMorning) { missed++; continue; }       // → "Attention"
        status = yousefCetirizine ? "skipped" : "taken";
      } else {
        const r = hash(offset, sr.medIndex, sr.slotIndex);
        if (r < 8) { missed++; continue; }        // no log ⇒ shows as missed in history
        status = r < 14 ? "skipped" : "taken";
      }

      const takenAt = status === "taken" ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm + (hash(offset, sr.medIndex) % 12)).toISOString() : null;
      logs.push({
        schedule_id: sr.scheduleId, patient_id: sr.patientId,
        confirmed_by_id: status === "taken" ? caretakerMemberId : null,
        log_date: dateKey, status, taken_at: takenAt,
        quantity_taken: status === "taken" ? sr.qty : null, notes: null,
      });
      if (status === "taken") taken++; else skipped++;
    }
  }

  for (let i = 0; i < logs.length; i += 500) {
    const { error } = await supa.from("mt_logs").insert(logs.slice(i, i + 500));
    die("insert logs batch", error);
  }
  console.log(`✓ inserted ${logs.length} dose logs  (taken ${taken}, skipped ${skipped}; ${missed} missed, ${pending} pending today)`);

  // 6b) Vitals readings so the caretaker's health view is populated.
  const round1 = (v) => Math.round(v * 10) / 10;
  const readings = [];
  const at = (daysAgo, hour) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, hash(daysAgo, hour) % 55).toISOString();
  const pushR = (key, type, p, s, unit, daysAgo, hour) => readings.push({
    patient_id: memberIdByKey[key], family_group_id: groupId, recorded_by_id: caretakerMemberId,
    type, value_primary: p, value_secondary: s, unit, taken_at: at(daysAgo, hour),
  });

  // Abdullah — hypertension trending down, elevated glucose, steady weight.
  for (let i = 12; i >= 0; i--) {
    const step = 12 - i;
    pushR("abdullah", "bp", Math.round(150 - step * 1.4 + ((hash(i, 1) % 7) - 3)), Math.round(95 - step * 0.8 + ((hash(i, 2) % 5) - 2)), "mmHg", i * 2, 8);
  }
  for (let i = 9; i >= 0; i--) {
    pushR("abdullah", "glucose", Math.round(150 - (9 - i) + ((hash(i, 3) % 20) - 8)), null, "mg/dL", i * 2 + 1, 7);
  }
  for (let i = 5; i >= 0; i--) pushR("abdullah", "weight", round1(82 + ((hash(i, 4) % 9) - 4) / 10), null, "kg", i * 4, 7);

  // Fatima — normal BP, steady weight and resting heart rate.
  for (let i = 8; i >= 0; i--) pushR("fatima", "bp", Math.round(118 + ((hash(i, 5) % 9) - 4)), Math.round(76 + ((hash(i, 6) % 7) - 3)), "mmHg", i * 2, 9);
  for (let i = 5; i >= 0; i--) pushR("fatima", "weight", round1(63 + ((hash(i, 7) % 7) - 3) / 10), null, "kg", i * 4, 9);
  for (let i = 6; i >= 0; i--) pushR("fatima", "heart_rate", Math.round(72 + ((hash(i, 8) % 12) - 6)), null, "bpm", i * 3, 9);

  // Yousef — asthma: SpO2 mostly normal with one dip, plus a brief fever episode.
  for (let i = 7; i >= 0; i--) pushR("yousef", "spo2", i === 2 ? 93 : 97 + (hash(i, 9) % 3), null, "%", i * 2, 8);
  for (let i = 5; i >= 0; i--) pushR("yousef", "heart_rate", Math.round(88 + ((hash(i, 10) % 14) - 7)), null, "bpm", i * 3, 8);
  pushR("yousef", "temperature", 37.6, null, "°C", 5, 20);
  pushR("yousef", "temperature", 36.9, null, "°C", 1, 8);

  for (let i = 0; i < readings.length; i += 500) {
    const { error } = await supa.from("mt_readings").insert(readings.slice(i, i + 500));
    die("insert readings batch", error);
  }
  console.log(`✓ inserted ${readings.length} vitals readings`);

  // 7) Notification preferences (caretaker on main client, patient on hers).
  await supa.from("mt_notification_prefs").upsert(
    { member_id: caretakerMemberId, push_enabled: false, reminder_minutes: 15, missed_dose_alerts: true, low_stock_alerts: true },
    { onConflict: "member_id" },
  );
  await patientClient.from("mt_notification_prefs").upsert(
    { member_id: memberIdByKey.fatima, push_enabled: false, reminder_minutes: 30, missed_dose_alerts: true, low_stock_alerts: false },
    { onConflict: "member_id" },
  );
  console.log("✓ notification preferences set");

  console.log("\n─────────────────────────────────────────────");
  console.log("  Seed complete. Demo logins (password: MedTrak2026!)");
  console.log(`  Caretaker : ${CARETAKER.email}`);
  console.log(`  Patient   : ${PATIENT_LOGIN.email}`);
  console.log("─────────────────────────────────────────────\n");
  process.exit(0);
}

main().catch((e) => {
  console.error("\n✗ Unexpected error:", e);
  process.exit(1);
});
