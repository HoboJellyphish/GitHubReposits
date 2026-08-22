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
import { Labs } from "@/pages/Labs";
import { Documents } from "@/pages/Documents";
import { Tips } from "@/pages/Tips";
import { Settings } from "@/pages/Settings";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
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

function AppShell() {
  const { profiles, activeProfile } = useAppData();
  const [page, setPage] = React.useState<PageId>("dashboard");

  if (profiles.length === 0 || !activeProfile) {
    return <WelcomeTour />;
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
          {page === "labs" && <Labs />}
          {page === "documents" && <Documents />}
          {page === "tips" && <Tips />}
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
