"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { joinFamilyGroup } from "@/app/onboarding/actions";
import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { FloatingInput } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const ROLES: { key: Role; label: string; description: string; icon: string }[] = [
  {
    key: "patient",
    label: "Patient",
    description: "Track and confirm my own doses.",
    icon: "personal_injury",
  },
  {
    key: "caretaker",
    label: "Caretaker",
    description: "Help manage the whole family.",
    icon: "supervisor_account",
  },
];

export default function JoinFamilyPage() {
  const [code, setCode] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const meta = data.user?.user_metadata as { display_name?: string } | undefined;
        if (meta?.display_name) setDisplayName(meta.display_name);
      });
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await joinFamilyGroup({ code, role, displayName });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <>
      <Link
        href="/onboarding"
        className="mb-6 inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary"
      >
        <Icon name="arrow_back" className="text-[20px]" /> Back
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile text-primary">
          Join a family group
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Enter the invite code shared by your caretaker.
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FloatingInput
            id="invite-code"
            label="Invite code"
            type="text"
            required
            autoCapitalize="characters"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="uppercase tracking-[0.3em]"
          />

          <div>
            <span className="mb-3 block font-label-md text-label-md text-on-surface-variant">
              I am joining as
            </span>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const selected = role === r.key;
                return (
                  <button
                    type="button"
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all active:scale-[0.98]",
                      selected
                        ? "border-2 border-primary bg-primary-fixed/40"
                        : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low",
                    )}
                  >
                    <Icon name={r.icon} filled={selected} className="text-[24px] text-primary" />
                    <span className="font-button-text text-button-text text-on-surface">
                      {r.label}
                    </span>
                    <span className="font-body-md text-[13px] leading-tight text-on-surface-variant">
                      {r.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <FloatingInput
            id="display-name"
            label="Your name"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          {error && (
            <p className="rounded-lg bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
              {error}
            </p>
          )}
          <Button type="submit" icon="login" loading={pending}>
            Join group
          </Button>
        </form>
      </Card>
    </>
  );
}
