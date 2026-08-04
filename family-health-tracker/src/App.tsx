import * as React from "react";
import { AppDataProvider, useAppData } from "@/state/AppDataContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { Nav } from "@/components/nav/Nav";
import { Dashboard } from "@/pages/Dashboard";
import { Timeline } from "@/pages/Timeline";
import { Trends } from "@/pages/Trends";
import { Family } from "@/pages/Family";
import { Medications } from "@/pages/Medications";
import { Documents } from "@/pages/Documents";
import { Settings } from "@/pages/Settings";
import { ProfileEditDialog } from "@/components/dialogs/ProfileEditDialog";
import { Button } from "@/components/ui/button";
import { HeartPulse, ShieldCheck } from "lucide-react";
import type { PageId } from "@/types";

function useSystemTheme() {
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
}

function Onboarding() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <HeartPulse className="h-8 w-8 text-primary" />
      </div>
      <div className="max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Family Health Tracker</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a profile for yourself or a family member to get started. Every profile keeps its own data,
          medications, and layout — from a household of one to a dozen.
        </p>
      </div>
      <Button size="lg" onClick={() => setOpen(true)}>
        Create your first profile
      </Button>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> All data stays on this device.
      </p>
      <ProfileEditDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function AppShell() {
  const { profiles, activeProfile } = useAppData();
  const [page, setPage] = React.useState<PageId>("dashboard");

  if (profiles.length === 0 || !activeProfile) {
    return <Onboarding />;
  }

  return (
    <div className="flex min-h-svh flex-col sm:flex-row">
      <Nav current={page} onNavigate={setPage} />
      <div className="flex min-w-0 flex-1 flex-col">
        <ProfileSwitcher />
        <main className="min-w-0 flex-1">
          {page === "dashboard" && <Dashboard onOpenSettings={() => setPage("settings")} />}
          {page === "log" && <Timeline />}
          {page === "trends" && <Trends />}
          {page === "family" && <Family />}
          {page === "medications" && <Medications />}
          {page === "documents" && <Documents />}
          {page === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  useSystemTheme();
  return (
    <AppDataProvider>
      <TooltipProvider delayDuration={300}>
        <AppShell />
      </TooltipProvider>
    </AppDataProvider>
  );
}
