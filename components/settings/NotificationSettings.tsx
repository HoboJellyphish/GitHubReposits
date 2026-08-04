"use client";

import { useState, useTransition } from "react";
import { updateNotificationPrefs } from "@/lib/actions/settings";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Icon } from "@/components/Icon";
import type { NotificationPrefs } from "@/lib/types";

const REMINDER_OPTIONS = [
  { value: 0, label: "At dose time" },
  { value: 5, label: "5 min before" },
  { value: 10, label: "10 min before" },
  { value: 15, label: "15 min before" },
  { value: 30, label: "30 min before" },
  { value: 60, label: "1 hour before" },
];

export function NotificationSettings({
  memberId,
  initial,
  showLowStock,
}: {
  memberId: string;
  initial: Partial<NotificationPrefs>;
  showLowStock?: boolean;
}) {
  const [prefs, setPrefs] = useState({
    reminder_minutes: initial.reminder_minutes ?? 0,
    missed_dose_alerts: initial.missed_dose_alerts ?? true,
    low_stock_alerts: initial.low_stock_alerts ?? true,
  });
  const [, startTransition] = useTransition();

  function save(next: typeof prefs) {
    setPrefs(next);
    startTransition(async () => {
      await updateNotificationPrefs({ memberId, prefs: next });
    });
  }

  return (
    <Card padding="md" className="divide-y divide-outline-variant/40">
      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <Icon name="schedule" className="text-on-surface-variant" />
          <span className="font-body-md text-body-md text-on-surface">Reminder timing</span>
        </div>
        <select
          value={prefs.reminder_minutes ?? 0}
          onChange={(e) => save({ ...prefs, reminder_minutes: Number(e.target.value) })}
          className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-label-md text-label-md text-primary focus:border-primary focus:ring-0"
        >
          {REMINDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Icon name="notifications_active" className="text-on-surface-variant" />
          <span className="font-body-md text-body-md text-on-surface">Missed dose alerts</span>
        </div>
        <Toggle
          checked={prefs.missed_dose_alerts}
          onChange={(v) => save({ ...prefs, missed_dose_alerts: v })}
          label="Missed dose alerts"
        />
      </div>

      {showLowStock && (
        <div className="flex items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-3">
            <Icon name="inventory_2" className="text-on-surface-variant" />
            <span className="font-body-md text-body-md text-on-surface">Low stock alerts</span>
          </div>
          <Toggle
            checked={prefs.low_stock_alerts}
            onChange={(v) => save({ ...prefs, low_stock_alerts: v })}
            label="Low stock alerts"
          />
        </div>
      )}
    </Card>
  );
}
