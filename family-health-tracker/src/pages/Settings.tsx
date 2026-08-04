import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { getTracker } from "@/lib/trackers";
import { NAV_CATALOG } from "@/lib/nav";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileEditDialog } from "@/components/dialogs/ProfileEditDialog";
import { WearableConnectDialog } from "@/components/dialogs/WearableConnectDialog";
import type { ButtonDisplayMode, DashboardItemPref, NavItemPref } from "@/types";
import { ChevronUp, ChevronDown, Type, Eye as EyeIcon, LayoutGrid, Watch, Plug, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";

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
    deleteProfile,
    listConnections,
    disconnectWearable,
    syncWearable,
  } = useAppData();
  const [editProfileOpen, setEditProfileOpen] = React.useState(false);
  const [wearableOpen, setWearableOpen] = React.useState(false);
  const [syncingId, setSyncingId] = React.useState<string | null>(null);

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
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
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
      </Tabs>

      <ProfileEditDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} profile={activeProfile} />
      <WearableConnectDialog open={wearableOpen} onOpenChange={setWearableOpen} profileId={activeProfile.id} />
    </div>
  );
}
