import * as React from "react";
import { Input } from "@/components/ui/input";
import { VoiceInputButton } from "@/components/VoiceInputButton";
import { extractSpokenNumber } from "@/lib/voiceNumber";

export function VoiceNumberInput({
  value,
  onChange,
  voiceLabel,
  round = false,
  ...inputProps
}: {
  value: number;
  onChange: (n: number) => void;
  voiceLabel?: string;
  round?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "className">) {
  return (
    <div className="relative">
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="pr-10" {...inputProps} />
      <VoiceInputButton
        className="absolute right-1.5 top-1/2 -translate-y-1/2"
        label={voiceLabel ?? "Dictate value"}
        onResult={(text) => {
          const n = extractSpokenNumber(text);
          if (n !== null) onChange(round ? Math.round(n) : n);
        }}
      />
    </div>
  );
}
