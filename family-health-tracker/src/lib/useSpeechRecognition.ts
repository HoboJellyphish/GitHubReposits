import * as React from "react";

// The Web Speech API isn't part of TypeScript's bundled DOM types (it's
// still non-standard), so the shape used here is declared locally rather
// than relying on a global augmentation.
interface SpeechRecognitionResultLike {
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

function errorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
    case "permission-denied":
      return "Microphone access was denied.";
    case "no-speech":
      return "Didn't catch that — try again.";
    case "audio-capture":
      return "No microphone found.";
    default:
      return "Voice input failed. Try again.";
  }
}

/**
 * Wraps the browser's built-in speech recognition for one-shot dictation:
 * tap to start, speak, get a final transcript. This uses whatever engine
 * the device/browser provides — on some platforms that's on-device, on
 * others it calls out to the OS's cloud speech service, which is the one
 * place in this app that isn't guaranteed to stay fully offline.
 */
export function useSpeechRecognition(onResult: (text: string) => void, lang = "en-US") {
  const [listening, setListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = React.useRef(onResult);
  onResultRef.current = onResult;

  const start = React.useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Voice input isn't supported on this browser.");
      return;
    }
    setError(null);
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      if (transcript) onResultRef.current(transcript);
    };
    recognition.onerror = (event) => {
      setError(errorMessage(event.error));
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [lang]);

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  React.useEffect(() => () => recognitionRef.current?.stop(), []);

  return { listening, error, start, stop };
}
