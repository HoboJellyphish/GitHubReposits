"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const PATIENT_NAV: NavItem[] = [
  { href: "/patient/today", label: "Today", icon: "today" },
  { href: "/patient/vitals", label: "Vitals", icon: "vital_signs" },
  { href: "/patient/history", label: "History", icon: "history" },
  { href: "/patient/settings", label: "Settings", icon: "settings" },
];

export const CARETAKER_NAV: NavItem[] = [
  { href: "/caretaker/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/caretaker/patients", label: "Patients", icon: "group" },
  { href: "/caretaker/inventory", label: "Inventory", icon: "inventory_2" },
  { href: "/caretaker/settings", label: "Settings", icon: "settings" },
];

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-max-width-content items-center justify-around rounded-t-xl bg-surface-container-lowest px-gutter pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-nav-top lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[48px] flex-col items-center justify-center rounded-full px-4 py-1 transition-all duration-200 active:scale-90",
              active
                ? "bg-primary-fixed text-primary"
                : "text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            <Icon name={item.icon} filled={active} />
            <span className="font-label-md text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Desktop counterpart to {@link BottomNav}: a persistent left sidebar shown only
 * at `lg+`. Same nav items, rendered as a vertical rail with the brand at the
 * top and an optional footer (the user's avatar) at the bottom.
 */
export function SideNav({ items, footer }: { items: NavItem[]; footer?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-40 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-lowest px-4 py-6 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2 text-primary">
        <Icon name="medication" filled className="text-[28px]" />
        <span className="font-headline-md text-headline-md tracking-tight">MedTrak</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[48px] items-center gap-3 rounded-lg px-3 font-label-md text-label-md transition-colors",
                active
                  ? "bg-primary-fixed text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <Icon name={item.icon} filled={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {footer && <div className="mt-4 border-t border-outline-variant/40 pt-4">{footer}</div>}
    </aside>
  );
}
