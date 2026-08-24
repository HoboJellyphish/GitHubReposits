"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Icon } from "@/components/Icon";
import { isPushSupported, getVapidKey, subscribeToPush, unsubscribeFromPush } from "@/lib/push";

export function PushToggle({
  memberId,
  initialEnabled,
}: {
  memberId: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [supported, setSupported] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isPushSupported());
    setConfigured(Boolean(getVapidKey()));
  }, []);

  async function toggle(next: boolean) {
    setBusy(true);
    setNote(null);
    const res = next ? await subscribeToPush(memberId) : await unsubscribeFromPush(memberId);
    setBusy(false);
    if (res.error) {
      setNote(res.error);
      return;
    }
    setEnabled(next);
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <Icon name="notifications" filled />
          </div>
          <div>
            <p className="font-button-text text-button-text text-on-surface">Push reminders</p>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Get dose reminders on this device
            </p>
          </div>
        </div>
        <Toggle
          checked={enabled}
          onChange={toggle}
          disabled={busy || !supported || !configured}
          label="Push reminders"
        />
      </div>
      {!supported && (
        <p className="mt-3 font-label-md text-label-md text-on-surface-variant">
          This device doesn&apos;t support push notifications.
        </p>
      )}
      {supported && !configured && (
        <p className="mt-3 font-label-md text-label-md text-on-surface-variant">
          Add VAPID keys to enable push (see README).
        </p>
      )}
      {note && (
        <p className="mt-3 rounded-lg bg-error-container px-4 py-2 font-label-md text-label-md text-on-error-container">
          {note}
        </p>
      )}
    </Card>
  );
}
