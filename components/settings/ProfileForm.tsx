"use client";

import { useState, useTransition } from "react";
import { updateDisplayName } from "@/lib/actions/settings";
import { Card } from "@/components/ui/Card";
import { FloatingInput } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateDisplayName({ displayName: name });
      if (res.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <Card padding="lg">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <FloatingInput
          id="display-name"
          label="Display name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          required
        />
        {email && (
          <p className="px-1 font-label-md text-label-md text-on-surface-variant">
            Signed in as {email}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
            {error}
          </p>
        )}
        <Button type="submit" loading={pending} icon={saved ? "check" : undefined}>
          {saved ? "Saved" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
