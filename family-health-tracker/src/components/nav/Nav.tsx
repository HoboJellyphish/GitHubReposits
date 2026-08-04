import * as React from "react";
import { useAppData } from "@/state/AppDataContext";
import { NAV_CATALOG } from "@/lib/nav";
import type { PageId } from "@/types";
import { AppButton } from "@/components/AppButton";

export function Nav({ current, onNavigate }: { current: PageId; onNavigate: (page: PageId) => void }) {
  const { activeProfileId, getPreferences } = useAppData();
  const prefs = activeProfileId ? getPreferences(activeProfileId) : null;

  const items = React.useMemo(() => {
    if (!prefs) return [];
    return [...prefs.navItems]
      .filter((i) => i.visible)
      .sort((a, b) => a.order - b.order)
      .map((i) => NAV_CATALOG[i.id]);
  }, [prefs]);

  if (items.length === 0) return null;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-card/95 px-1 pt-1 backdrop-blur sm:hidden"
        style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
      >
        {items.map((item) => (
          <AppButton
            key={item.id}
            layout="nav"
            icon={item.icon}
            label={item.label}
            active={current === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      <nav className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col gap-1 border-r border-border bg-card/60 p-3 sm:flex">
        <div className="mb-2 px-2 pt-1 text-lg font-semibold tracking-tight">Family Health</div>
        {items.map((item) => (
          <AppButton
            key={item.id}
            layout="inline"
            variant={current === item.id ? "default" : "ghost"}
            icon={item.icon}
            label={item.label}
            active={current === item.id}
            onClick={() => onNavigate(item.id)}
            className={
              "!w-full " +
              (current === item.id
                ? "!justify-start !bg-primary/10 !text-primary"
                : "!justify-start !text-muted-foreground hover:!text-foreground")
            }
          />
        ))}
      </nav>
    </>
  );
}
