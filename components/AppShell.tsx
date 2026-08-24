import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav, SideNav, type NavItem } from "@/components/BottomNav";
import { Avatar } from "@/components/ui/Avatar";

/**
 * Page chrome for the main tab screens.
 *
 * - **Mobile / tablet:** a centered max-width column with a sticky brand header
 *   and a fixed bottom navigation bar (padding clears the nav).
 * - **Desktop (lg+):** a persistent left sidebar (brand + vertical nav + the
 *   user's avatar) beside a wider content area; the bottom bar and mobile
 *   header are hidden.
 */
export function AppShell({
  navItems,
  userName,
  settingsHref,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  settingsHref: string;
  children: React.ReactNode;
}) {
  // Avatar shown in the mobile header — a consistent tap target to Settings.
  const headerAvatar = (
    <Link href={settingsHref} aria-label="Settings">
      <Avatar name={userName} size={40} />
    </Link>
  );

  // Richer avatar + name block anchored at the bottom of the desktop sidebar.
  const sidebarFooter = (
    <Link
      href={settingsHref}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-container-high"
    >
      <Avatar name={userName} size={40} />
      <span className="min-w-0">
        <span className="block truncate font-button-text text-button-text text-on-surface">
          {userName}
        </span>
        <span className="block font-label-md text-label-md text-on-surface-variant">Settings</span>
      </span>
    </Link>
  );

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-background lg:flex-row">
      <SideNav items={navItems} footer={sidebarFooter} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader right={headerAvatar} />
        <main className="mx-auto w-full max-w-max-width-content flex-1 px-margin-mobile pb-28 pt-4 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
}
