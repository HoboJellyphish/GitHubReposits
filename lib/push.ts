import { updateNotificationPrefs } from "@/lib/actions/settings";

export interface PushResult {
  error?: string;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getVapidKey(): string | undefined {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || undefined;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/** Request permission, subscribe to push, and store the subscription. */
export async function subscribeToPush(memberId: string): Promise<PushResult> {
  if (!isPushSupported()) {
    return { error: "Push notifications aren't supported on this device." };
  }
  const vapid = getVapidKey();
  if (!vapid) {
    return { error: "Push isn't configured yet (missing VAPID public key)." };
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return {
      error: "Service worker isn't active. The PWA is disabled in development — try a production build.",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { error: "Notification permission was not granted." };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Cast needed: TS 5.7 types `Uint8Array` as `Uint8Array<ArrayBufferLike>`,
      // which the Web Push `BufferSource` type won't accept directly.
      applicationServerKey: urlBase64ToUint8Array(vapid) as unknown as BufferSource,
    });
  }

  const json = subscription.toJSON();
  const res = await updateNotificationPrefs({
    memberId,
    prefs: {
      push_enabled: true,
      push_endpoint: subscription.endpoint,
      push_p256dh: json.keys?.p256dh ?? null,
      push_auth: json.keys?.auth ?? null,
    },
  });
  return res.error ? { error: res.error } : {};
}

/** Remove the push subscription and clear the stored endpoint. */
export async function unsubscribeFromPush(memberId: string): Promise<PushResult> {
  if (isPushSupported()) {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
  }
  const res = await updateNotificationPrefs({
    memberId,
    prefs: {
      push_enabled: false,
      push_endpoint: null,
      push_p256dh: null,
      push_auth: null,
    },
  });
  return res.error ? { error: res.error } : {};
}
