import Link from "next/link";
import { Icon } from "@/components/Icon";

/** Brand header used across the main tab screens. */
export function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-touch-target w-full max-w-max-width-content items-center justify-between px-margin-mobile">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Icon name="medication" filled className="text-[28px]" />
          <span className="font-headline-md text-headline-md tracking-tight">MedTrak</span>
        </Link>
        {right}
      </div>
    </header>
  );
}
