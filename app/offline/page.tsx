import type { Metadata } from "next";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-margin-mobile text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-lowest soft-elevation">
        <Icon name="cloud_off" className="text-[40px] text-primary" />
      </div>
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
        You&apos;re offline
      </h1>
      <p className="max-w-xs font-body-md text-body-md text-on-surface-variant">
        MedTrak needs a connection to load this screen. Your recently viewed pages are still
        available — reconnect to sync the latest.
      </p>
    </div>
  );
}
