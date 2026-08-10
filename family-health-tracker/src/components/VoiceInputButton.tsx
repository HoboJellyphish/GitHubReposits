import { Mic } from "lucide-react";
import { useSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/useSpeechRecognition";
import { cn } from "@/lib/utils";

/**
 * A small mic toggle meant to sit inside a `relative`-positioned wrapper
 * next to an Input/Textarea. Renders nothing if this browser doesn't
 * support speech recognition, so it never shows up as a dead button.
 */
export function VoiceInputButton({
  onResult,
  label = "Dictate",
  className,
}: {
  onResult: (text: string) => void;
  label?: string;
  className?: string;
}) {
  const { listening, error, start, stop } = useSpeechRecognition(onResult);

  if (!isSpeechRecognitionSupported()) return null;

  return (
    <button
      type="button"
      onClick={() => (listening ? stop() : start())}
      aria-label={listening ? "Stop voice input" : label}
      title={error ?? (listening ? "Listening… tap to stop" : label)}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
        listening
          ? "animate-pulse bg-destructive/15 text-destructive"
          : error
            ? "text-destructive/70 hover:bg-destructive/10"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <Mic className="h-3.5 w-3.5" />
    </button>
  );
}
