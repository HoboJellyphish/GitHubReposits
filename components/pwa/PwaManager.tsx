"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { isPushSupported, getVapidKey, subscribeToPush } from "@/lib/push";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const A2HS_KEY = "mt-a2hs-dismissed";
const NOTIF_KEY = "mt-notif-dismissed";

/**
 * Handles the two post-login PWA nudges:
 *  1. Add-to-home-screen prompt (when the browser offers it)
 *  2. Enable push reminders (when supported, configured and not yet decided)
 * Both are dismissible and remembered in localStorage.
 */
export function PwaManager({ memberId }: { memberId: string }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"install" | "notify" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      if (localStorage.getItem(A2HS_KEY) !== "1") setMode("install");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => setMode(null));

    // If no install prompt is available, consider nudging for notifications.
    const t = setTimeout(() => {
      setMode((current) => {
        if (current) return current;
        if (
          localStorage.getItem(NOTIF_KEY) !== "1" &&
          isPushSupported() &&
          getVapidKey() &&
          Notification.permission === "default"
        ) {
          return "notify";
        }
        return null;
      });
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      clearTimeout(t);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setMode(null);
  }

  async function enableNotifications() {
    setBusy(true);
    await subscribeToPush(memberId);
    setBusy(false);
    setMode(null);
  }

  function dismiss() {
    localStorage.setItem(mode === "install" ? A2HS_KEY : NOTIF_KEY, "1");
    setMode(null);
  }

  if (!mode) return null;

  const isInstall = mode === "install";

  return (
    <div className="fixed inset-x-0 bottom-[88px] z-[60] mx-auto max-w-max-width-content px-margin-mobile">
      <div className="flex items-center gap-3 rounded-xl bg-primary p-4 text-on-primary soft-elevation">
        <Icon name={isInstall ? "install_mobile" : "notifications_active"} filled className="text-[24px]" />
        <div className="flex-1">
          <p className="font-button-text text-button-text">
            {isInstall ? "Install MedTrak" : "Turn on reminders"}
          </p>
          <p className="font-label-md text-[13px] text-on-primary/80">
            {isInstall
              ? "Add to your home screen for quick access."
              : "Get notified when it’s time for a dose."}
          </p>
        </div>
        <button
          onClick={isInstall ? install : enableNotifications}
          disabled={busy}
          className="rounded-lg bg-on-primary/15 px-4 py-2 font-label-md text-label-md transition-colors hover:bg-on-primary/25 disabled:opacity-60"
        >
          {isInstall ? "Install" : busy ? "…" : "Enable"}
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="text-on-primary/70 hover:text-on-primary">
          <Icon name="close" />
        </button>
      </div>
    </div>
  );
}
