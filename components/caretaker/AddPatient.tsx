"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPatient } from "@/lib/actions/patients";
import { Card } from "@/components/ui/Card";
import { FloatingInput } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";

export function AddPatient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createPatient({ displayName: name });
      if (res.error) {
        setError(res.error);
        return;
      }
      setName("");
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button variant="secondary" icon="person_add" onClick={() => setOpen(true)}>
        Add a patient
      </Button>
    );
  }

  return (
    <Card padding="md">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FloatingInput
          id="new-patient-name"
          label="Patient name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        {error && (
          <p className="rounded-lg bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Add patient
          </Button>
        </div>
      </form>
    </Card>
  );
}
