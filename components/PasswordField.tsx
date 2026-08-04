"use client";

import { useState } from "react";
import { FloatingInput } from "@/components/ui/fields";
import { Icon } from "@/components/Icon";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
  label: string;
};

export function PasswordField({ id, label, ...props }: Props) {
  const [show, setShow] = useState(false);
  return (
    <FloatingInput
      id={id}
      label={label}
      type={show ? "text" : "password"}
      {...props}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name={show ? "visibility" : "visibility_off"} />
        </button>
      }
    />
  );
}
