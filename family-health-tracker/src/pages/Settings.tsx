import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { getTracker } from "@/lib/trackers";
import { NAV_CATALOG } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileEditDialog } from "@/components/dialogs/ProfileEditDialog";
import { WearableConnectDialog } from "@/components/dialogs/WearableConnectDialog";
import type { ButtonDisplayMode, DashboardItemPref, NavItemPref } from "@/types";
import {
  ChevronUp,
  ChevronDown,
  Type,
  Eye as EyeIcon,
  LayoutGrid,
  Watch,
  Plug,
  RefreshCw,
  Pencil,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Bell,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { backupFileName, BackupParseError } from "@/data/backup";
import {
  requestNotificationPermission,
  scheduleTipsReminder,
  cancelTipsReminder,
  scheduleMedicationReminders,
  cancelMedicationReminders,
} from "@/lib/reminders";
import { ImportDataDialog } from "@/components/dialogs/ImportDataDialog";

function reorder<T extends { order: number }>(items: T[], index: number, direction: -1 | 1): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const target = index + direction;
  if (target < 0 || target >= sorted.length) return items;
  [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
  return sorted.map((item, i) => ({ ...item, order: i }));
}

const BUTTON_STYLE_OPTIONS: { value: ButtonDisplayMode; label: string; description: string }[] = [
  { value: "icon", label: "Icon only", description: "Compact — press-and-hold for a label" },
  { value: "text", label: "Text only", description: "Word labels, no symbols" },
  { value: "both", label: "Icon + Text", description: "Icon with a label underneath" },
];

export function Settings() {
  const {
    activeProfile,
    profiles,
    getPreferences,
    setButtonStyle,
    setDashboardItems,
    setNavItems,
    updatePreferences,
    deleteProfile,
    listConnections,
    disconnectWearable,
    syncWearable,
    listMedications,
    exportBackup,
    importBackup,
  } = useAppData();
  const [editProfileOpen, setEditProfileOpen] = React.useState(false);
  const [wearableOpen, setWearableOpen] = React.useState(false);
  const [importDataOpen, setImportDataOpen] = React.useState(false);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [notifPermissionDenied, setNotifPermissionDenied] = React.useState(false);
  const importInputRef = React.useRef<HTMLInputElement>(null);

  if (!activeProfile) return null;

  const prefs = getPreferences(activeProfile.id);
  const dashboardSorted = [...prefs.dashboardItems].sort((a, b) => a.order - b.order);
  const navSorted = [...prefs.navItems].sort((a, b) => a.order - b.order);
  const connections = listConnections(activeProfile.id);
  const groups = Array.from(new Set(dashboardSorted.map((i) => i.group)));

  const patchDashboardItem = (id: string, patch: Partial<DashboardItemPref>) => {
    setDashboardItems(
      activeProfile.id,
      prefs.dashboardItems.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  };

  const moveDashboardItem = (index: number, direction: -1 | 1) => {
    setDashboardItems(activeProfile.id, reorder(dashboardSorted, index, direction));
  };

  const patchNavItem = (id: NavItemPref["id"], patch: Partial<NavItemPref>) => {
    setNavItems(
      activeProfile.id,
      prefs.navItems.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  };

  const moveNavItem = (index: number, direction: -1 | 1) => {
    setNavItems(activeProfile.id, reorder(navSorted, index, direction));
  };

  const handleSync = async (connectionId: string) => {
    setSyncingId(connectionId);
    try {
      await syncWearable(connectionId);
    } finally {
      setSyncingId(null);
    }
  };

  const handleExport = () => {
    const json = exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFileName();
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const json = reader.result as string;
      if (
        !confirm(
          "Restoring a backup replaces every profile, entry, and document currently on this device. This can't be undone. Continue?",
        )
      ) {
        return;
      }
      try {
        importBackup(json);
      } catch (err) {
        setImportError(err instanceof BackupParseError ? err.message : "Couldn't read that backup file.");
      }
    };
    reader.onerror = () => setImportError("Couldn't read that file.");
    reader.readAsText(file);
  };

  const handleToggleTipsReminder = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setNotifPermissionDenied(true);
        return;
      }
      setNotifPermissionDenied(false);
      await scheduleTipsReminder(prefs.tipsReminderTime);
    } else {
      await cancelTipsReminder();
    }
    updatePreferences(activeProfile.id, { tipsReminderEnabled: enabled });
  };

  const handleTipsTimeChange = async (time: string) => {
    updatePreferences(activeProfile.id, { tipsReminderTime: time });
    if (prefs.tipsReminderEnabled) await scheduleTipsReminder(time);
  };

  const handleToggleMedicationReminders = async (enabled: boolean) => {
    const meds = listMedications(activeProfile.id);
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setNotifPermissionDenied(true);
        return;
      }
      setNotifPermissionDenied(false);
      await scheduleMedicationReminders(meds);
    } else {
      await cancelMedicationReminders(meds);
    }
    updatePreferences(activeProfile.id, { medicationRemindersEnabled: enabled });
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Everything here applies only to {activeProfile.name}'s profile.</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="dashboard">
            <LayoutGrid className="mr-1.5 h-3.5 w-3.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="nav">Navigation</TabsTrigger>
          <TabsTrigger value="display">
            <Type className="mr-1.5 h-3.5 w-3.5" /> Display
          </TabsTrigger>
          <TabsTrigger value="wearables">
            <Watch className="mr-1.5 h-3.5 w-3.5" /> Wearables
          </TabsTrigger>
          <TabsTrigger value="reminders">
            <Bell className="mr-1.5 h-3.5 w-3.5" /> Reminders
          </TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="backup">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardContent className="flex flex-col gap-1 p-4">
              <p className="mb-2 text-xs text-muted-foreground">
                Choose exactly which trackers appear on the dashboard, and in what order. Assign a group name to
                organize them into sections.
              </p>
              {dashboardSorted.map((item, index) => {
                const tracker = getTracker(item.trackerId);
                return (
                  <div key={item.id} className="flex items-center gap-2 border-b border-border py-2 last:border-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in oklch, ${tracker.colorVar} 18%, transparent)` }}>
                      <tracker.icon className="h-4 w-4" style={{ color: tracker.colorVar }} />
                    </span>
                    <span className="w-28 shrink-0 truncate text-sm font-medium">{tracker.label}</span>
                    <Input
                      value={item.group}
                      onChange={(e) => patchDashboardItem(item.id, { group: e.target.value })}
                      placeholder="Group"
                      className="h-8 flex-1 text-xs"
                      list="dashboard-groups"
                    />
                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        onClick={() => moveDashboardItem(index, -1)}
                        disabled={index === 0}
                        className="text-muted-foreground disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDashboardItem(index, 1)}
                        disabled={index === dashboardSorted.length - 1}
                        className="text-muted-foreground disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <Switch checked={item.visible} onCheckedChange={(v) => patchDashboardItem(item.id, { visible: v })} />
                  </div>
                );
              })}
              <datalist id="dashboard-groups">
                {groups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nav">
          <Card>
            <CardContent className="flex flex-col gap-1 p-4">
              <p className="mb-2 text-xs text-muted-foreground">Show, hide, and reorder the main navigation.</p>
              {navSorted.map((item, index) => {
                const page = NAV_CATALOG[item.id];
                return (
                  <div key={item.id} className="flex items-center gap-2 border-b border-border py-2 last:border-0">
                    <page.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">{page.label}</span>
                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        onClick={() => moveNavItem(index, -1)}
                        disabled={index === 0}
                        className="text-muted-foreground disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveNavItem(index, 1)}
                        disabled={index === navSorted.length - 1}
                        className="text-muted-foreground disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <Switch checked={item.visible} onCheckedChange={(v) => patchNavItem(item.id, { visible: v })} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-xs text-muted-foreground">
                Applies to every button in the app — navigation, dashboard tiles, and quick-log actions.
              </p>
              {BUTTON_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setButtonStyle(activeProfile.id, opt.value)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border p-3 text-left",
                    prefs.buttonStyle === opt.value ? "border-primary bg-primary/5" : "border-border",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                  {prefs.buttonStyle === opt.value && <EyeIcon className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wearables">
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={() => setWearableOpen(true)} className="self-start">
              <Plug className="h-4 w-4" /> Connect a Device
            </Button>
            {connections.length === 0 && (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">No wearables connected yet.</CardContent>
              </Card>
            )}
            {connections.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <Watch className="h-5 w-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium capitalize">{c.platform.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.status === "connected" ? "Connected" : "Disconnected"}
                      {c.lastSyncAt && ` · synced ${formatRelative(c.lastSyncAt)}`}
                    </p>
                  </div>
                  {c.status === "connected" && (
                    <>
                      <Button size="sm" variant="outline" disabled={syncingId === c.id} onClick={() => handleSync(c.id)}>
                        <RefreshCw className={cn("h-3.5 w-3.5", syncingId === c.id && "animate-spin")} /> Sync
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => disconnectWearable(c.id)}>
                        Disconnect
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reminders">
          <div className="flex flex-col gap-3">
            <Card>
              <CardContent className="flex flex-col gap-2 p-4 text-xs text-muted-foreground">
                <p>
                  Reminders use this device's own notification system — nothing is scheduled, sent, or logged
                  anywhere else. Both are off unless you turn them on here.
                </p>
                {notifPermissionDenied && (
                  <p className="flex items-center gap-1.5 text-destructive">
                    <BellOff className="h-3.5 w-3.5 shrink-0" /> Notification permission was denied. Enable it for
                    this app in your device settings, then try again.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Daily healthy tip</p>
                    <p className="text-xs text-muted-foreground">One reminder a day with a wellness tip.</p>
                  </div>
                  <Switch checked={prefs.tipsReminderEnabled} onCheckedChange={handleToggleTipsReminder} />
                </div>
                {prefs.tipsReminderEnabled && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Time</Label>
                    <Input
                      type="time"
                      value={prefs.tipsReminderTime}
                      onChange={(e) => handleTipsTimeChange(e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium">Medication reminders</p>
                  <p className="text-xs text-muted-foreground">
                    Uses the reminder time already set on each medication (edit those under Medications).
                  </p>
                </div>
                <Switch checked={prefs.medicationRemindersEnabled} onCheckedChange={handleToggleMedicationReminders} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profiles">
          <div className="flex flex-col gap-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-3">
                <ProfileAvatar profile={activeProfile} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{activeProfile.name}</p>
                  <p className="text-xs text-muted-foreground">Currently selected profile</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditProfileOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                {profiles.length > 1 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Remove ${activeProfile.name}'s profile and all of their data? This can't be undone.`)) {
                        deleteProfile(activeProfile.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <div className="flex flex-col gap-3">
            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <p className="text-sm font-medium">Back up everything</p>
                <p className="text-xs text-muted-foreground">
                  Downloads one file with every profile in this household — all entries, medications, and
                  documents. Nothing here is ever backed up automatically or sent anywhere; this is the only copy
                  besides what's on this device. Worth doing before uninstalling the app or switching phones.
                </p>
                <Button onClick={handleExport} className="self-start">
                  <Download className="h-4 w-4" /> Export Backup File
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <p className="text-sm font-medium">Restore from a backup</p>
                <p className="text-xs text-muted-foreground">
                  Replaces everything currently on this device with what's in the backup file. Use this to bring
                  data back after reinstalling, or to move it to a different phone.
                </p>
                <Button variant="outline" onClick={() => importInputRef.current?.click()} className="self-start">
                  <Upload className="h-4 w-4" /> Choose Backup File
                </Button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                    e.target.value = "";
                  }}
                />
                {importError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {importError}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <p className="text-sm font-medium">Import from another health app</p>
                <p className="text-xs text-muted-foreground">
                  Bring in history from an Apple Health export, or a CSV file exported from another app. This adds
                  to what's already here — unlike Restore, it doesn't replace anything. Everything is parsed on
                  this device; the file never goes anywhere else.
                </p>
                <Button variant="outline" onClick={() => setImportDataOpen(true)} className="self-start">
                  <Upload className="h-4 w-4" /> Import Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ProfileEditDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} profile={activeProfile} />
      <WearableConnectDialog open={wearableOpen} onOpenChange={setWearableOpen} profileId={activeProfile.id} />
      <ImportDataDialog open={importDataOpen} onOpenChange={setImportDataOpen} profileId={activeProfile.id} />
    </div>
  );
}
