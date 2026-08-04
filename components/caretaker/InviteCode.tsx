"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context) — ignore.
    }
  }

  return (
    <Card padding="lg" className="flex flex-col items-center gap-3 text-center">
      <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
        Invite code
      </span>
      <span className="font-headline-lg text-headline-lg tracking-[0.3em] text-primary">
        {code}
      </span>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Share this code so family members can join your group.
      </p>
      <button
        onClick={copy}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-lg px-6 font-button-text text-button-text transition-colors",
          copied ? "bg-secondary-container text-on-secondary-container" : "bg-primary text-on-primary",
        )}
      >
        <Icon name={copied ? "check" : "content_copy"} className="text-[20px]" />
        {copied ? "Copied!" : "Copy code"}
      </button>
    </Card>
  );
}
