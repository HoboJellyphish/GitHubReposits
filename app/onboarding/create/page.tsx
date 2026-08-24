"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createFamilyGroup } from "@/app/onboarding/actions";
import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { FloatingInput } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";

export default function CreateFamilyPage() {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Prefill the caretaker's name from their sign-up metadata.
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
      const res = await createFamilyGroup({ name, displayName });
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
          Create family group
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          You&apos;ll be the caretaker — managing medications and inviting others.
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FloatingInput
            id="family-name"
            label="Family group name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <Button type="submit" icon="check" loading={pending}>
            Create group
          </Button>
        </form>
      </Card>
    </>
  );
}
