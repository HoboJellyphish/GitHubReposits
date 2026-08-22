import * as React from "react";
import { Button } from "@/components/ui/button";
import { ProfileEditDialog } from "@/components/dialogs/ProfileEditDialog";
import {
  ShieldCheck,
  HeartPulse,
  TrendingUp,
  Bell,
  Download,
  ChevronLeft,
} from "lucide-react";

interface Slide {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: ShieldCheck,
    title: "Everything stays on this device",
    body: "No account, no server, no network calls — ever. Your family's health data is never sent anywhere, not even to us. You can check this yourself: the app works identically in airplane mode.",
  },
  {
    icon: HeartPulse,
    title: "Track anything, for anyone",
    body: "Heart rate, sleep, meals, medications, weight, blood pressure, glucose, mood, symptoms, water, and steps. Add a profile for every household member — each keeps its own data and its own layout.",
  },
  {
    icon: TrendingUp,
    title: "See the patterns",
    body: "Trend charts for every metric, plus a Family view that compares household members side by side and flags how closely their numbers move together.",
  },
  {
    icon: Bell,
    title: "Labs, tips, and reminders",
    body: "Log lab panels like thyroid or vitamin results with automatic reference-range flagging. Browse healthy tips, and turn on optional, on-device-only reminders whenever you want them.",
  },
  {
    icon: Download,
    title: "Bring your history with you",
    body: "Import data from an Apple Health export or a CSV file, or snap a photo of a nutrition label to auto-fill a meal. Every optional feature here asks first and never leaves the device.",
  },
];

export function WelcomeTour() {
  const [step, setStep] = React.useState(0);
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const isLast = step === SLIDES.length;

  if (isLast) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <HeartPulse className="h-8 w-8 text-primary" />
        </div>
        <div className="max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">You're all set</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a profile for yourself or a family member to get started. Every profile keeps its own data,
            medications, and layout — from a household of one to a dozen.
          </p>
        </div>
        <Button size="lg" onClick={() => setProfileDialogOpen(true)}>
          Create your first profile
        </Button>
        <button
          type="button"
          onClick={() => setStep(0)}
          className="flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
        >
          <ChevronLeft className="h-3 w-3" /> Back to the tour
        </button>
        <ProfileEditDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
      </div>
    );
  }

  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <div className="max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{slide.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{slide.body}</p>
      </div>

      <div className="flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-6 bg-primary" : "w-1.5 bg-primary/25"
            }`}
          />
        ))}
      </div>

      <div className="flex w-full max-w-sm items-center gap-3">
        {step > 0 ? (
          <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : (
          <Button variant="ghost" className="flex-1" onClick={() => setStep(SLIDES.length)}>
            Skip
          </Button>
        )}
        <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
          {step === SLIDES.length - 1 ? "Get started" : "Next"}
        </Button>
      </div>
    </div>
  );
}
