// Local, on-device notification scheduling only — uses Capacitor's
// local-notifications plugin (native OS notification APIs on Android, a
// browser-Notification-based shim on web). There is no push service and no
// server: nothing here ever makes a network call, and no reminder fires
// unless the profile has explicitly turned it on in Settings.
import { LocalNotifications } from "@capacitor/local-notifications";
import { tipOfTheDay } from "@/data/tips";
import type { Medication } from "@/types";

const TIPS_NOTIFICATION_ID = 900001;
const MEDICATION_ID_BASE = 800000;

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === "granted";
  } catch {
    return false;
  }
}

function parseTime(hhmm: string): { hour: number; minute: number } {
  const [hour, minute] = hhmm.split(":").map((n) => Number(n) || 0);
  return { hour, minute };
}

export async function scheduleTipsReminder(time: string): Promise<void> {
  const { hour, minute } = parseTime(time);
  const tip = tipOfTheDay();
  await LocalNotifications.schedule({
    notifications: [
      {
        id: TIPS_NOTIFICATION_ID,
        title: "Healthy tip",
        body: tip.title,
        schedule: { on: { hour, minute }, allowWhileIdle: true },
      },
    ],
  });
}

export async function cancelTipsReminder(): Promise<void> {
  await LocalNotifications.cancel({ notifications: [{ id: TIPS_NOTIFICATION_ID }] });
}

/** Deterministic small int notification id from a medication id + reminder
 * slot index, so re-scheduling the same medication replaces its existing
 * notifications instead of piling up duplicates. */
function medicationNotificationId(medicationId: string, index: number): number {
  let hash = 0;
  for (let i = 0; i < medicationId.length; i++) hash = (hash * 31 + medicationId.charCodeAt(i)) >>> 0;
  return MEDICATION_ID_BASE + (hash % 100000) * 10 + index;
}

export async function scheduleMedicationReminders(medications: Medication[]): Promise<void> {
  const notifications = medications
    .filter((m) => m.active)
    .flatMap((m) =>
      m.reminderTimes.map((time, index) => {
        const { hour, minute } = parseTime(time);
        return {
          id: medicationNotificationId(m.id, index),
          title: `Take ${m.name}`,
          body: m.dosage || "Time for your dose",
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        };
      }),
    );
  if (notifications.length > 0) await LocalNotifications.schedule({ notifications });
}

export async function cancelMedicationReminders(medications: Medication[]): Promise<void> {
  const notifications = medications.flatMap((m) => m.reminderTimes.map((_, index) => ({ id: medicationNotificationId(m.id, index) })));
  if (notifications.length > 0) await LocalNotifications.cancel({ notifications });
}
