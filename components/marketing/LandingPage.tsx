import Link from "next/link";
import { Icon } from "@/components/Icon";

const FEATURES: { icon: string; title: string; body: string }[] = [
  { icon: "today", title: "Today, at a glance", body: "Every dose due today, grouped by time of day — confirm each one with a single tap." },
  { icon: "history", title: "Adherence history", body: "A calendar view of what was taken, missed, or skipped, so patterns are easy to spot." },
  { icon: "medication", title: "Medication management", body: "Set schedules, forms and dosages for each family member — daily, alternate days, or weekly." },
  { icon: "inventory_2", title: "Inventory & refills", body: "Track supply levels and get low-stock alerts before anyone runs out." },
  { icon: "group", title: "Family groups", body: "Caretakers manage the whole family; patients track themselves. Join with a simple invite code." },
  { icon: "notifications_active", title: "Reminders, installable", body: "Dose reminders and an installable app that works on any phone — no app store needed." },
];

const PATIENT_POINTS = [
  "See your own medications and today's doses",
  "Confirm doses with one tap",
  "Review your adherence history over time",
];
const CARETAKER_POINTS = [
  "Manage medications, schedules and inventory for everyone",
  "Log doses on a patient's behalf",
  "Spot low stock and missed doses at a glance",
];

/** Primary call-to-action, styled as the app's navy button. */
function CtaPrimary({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-touch-target items-center justify-center gap-2 rounded-lg bg-primary px-6 font-button-text text-button-text text-on-primary shadow-soft transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

/** Secondary / outline call-to-action. */
function CtaSecondary({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-touch-target items-center justify-center gap-2 rounded-lg border border-outline bg-transparent px-6 font-button-text text-button-text text-primary transition-all duration-200 hover:bg-surface-container-low active:scale-[0.98] ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Icon name="medication" filled className="text-[26px]" />
            <span className="font-headline-md text-headline-md tracking-tight">MedTrak</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/sign-in"
              className="rounded-lg px-4 py-2 font-button-text text-button-text text-primary transition-colors hover:bg-surface-container-low"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="hidden rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text text-on-primary transition-all hover:opacity-90 active:scale-[0.98] sm:inline-flex"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5 font-label-md text-label-md text-primary">
              <Icon name="shield_with_heart" filled className="text-[18px]" />
              Family medication tracker
            </span>
            <h1 className="mt-6 font-headline-lg text-[40px] font-extrabold leading-[1.1] tracking-tight text-primary sm:text-[52px]">
              Care for your family&apos;s health, together.
            </h1>
            <p className="mt-5 max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              MedTrak helps families track medications, confirm doses, and stay ahead of refills —
              for patients and the caretakers who look after them.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaPrimary href="/auth/sign-up">
                Get started
                <Icon name="arrow_forward" className="text-[20px]" />
              </CtaPrimary>
              <CtaSecondary href="/auth/sign-in">I already have an account</CtaSecondary>
            </div>
            <p className="mt-4 flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
              <Icon name="install_mobile" className="text-[18px]" />
              Works in your browser and installs like an app.
            </p>
          </div>

          {/* Decorative product preview */}
          <div className="hidden md:block">
            <div className="mx-auto max-w-sm rounded-xl bg-surface-container-lowest p-6 soft-elevation">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-headline-md text-headline-md text-on-surface">Today</p>
                  <p className="font-label-md text-label-md text-on-surface-variant">3 of 4 taken</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 font-label-md text-label-md text-on-secondary-container">
                  <Icon name="check_circle" filled className="text-[16px]" />
                  On track
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: "wb_sunny", name: "Amlodipine", dose: "5mg · 8:00 AM", done: true },
                  { icon: "wb_sunny", name: "Metformin", dose: "500mg · 8:00 AM", done: true },
                  { icon: "wb_twilight", name: "Atorvastatin", dose: "20mg · 7:00 PM", done: false },
                ].map((row) => (
                  <div key={row.name} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary">
                      <Icon name={row.icon} className="text-[20px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-button-text text-button-text text-on-surface">{row.name}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant">{row.dose}</p>
                    </div>
                    <Icon
                      name={row.done ? "check_circle" : "radio_button_unchecked"}
                      filled={row.done}
                      className={row.done ? "text-secondary" : "text-outline"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-outline-variant/30 bg-surface-container-low/40">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <h2 className="font-headline-lg text-headline-lg text-primary">
                Everything your family&apos;s medications need
              </h2>
              <p className="mt-3 font-body-lg text-body-lg text-on-surface-variant">
                One calm, organized place for doses, schedules, supplies and history.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl bg-surface-container-lowest p-6 soft-elevation">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                    <Icon name={f.icon} filled className="text-[24px]" />
                  </span>
                  <h3 className="mt-4 font-headline-md text-headline-md text-on-surface">{f.title}</h3>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <h2 className="font-headline-lg text-headline-lg text-primary">Built for both sides of care</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {[
              { icon: "personal_injury", title: "For patients", points: PATIENT_POINTS },
              { icon: "supervisor_account", title: "For caretakers", points: CARETAKER_POINTS },
            ].map((role) => (
              <div key={role.title} className="rounded-xl bg-surface-container-lowest p-8 soft-elevation">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <Icon name={role.icon} filled className="text-[24px]" />
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">{role.title}</h3>
                </div>
                <ul className="mt-6 space-y-3">
                  {role.points.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <Icon name="check_circle" filled className="mt-0.5 text-[20px] text-secondary" />
                      <span className="font-body-md text-body-md text-on-surface">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-5 pb-20 lg:px-8">
          <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-xl bg-primary px-8 py-14 text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-primary">
              Start caring, together — today.
            </h2>
            <p className="mx-auto mt-3 max-w-xl font-body-lg text-body-lg text-primary-fixed-dim">
              Set up your family group in a minute and add your first medication.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="inline-flex h-touch-target items-center justify-center gap-2 rounded-lg bg-on-primary px-6 font-button-text text-button-text text-primary transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Get started
                <Icon name="arrow_forward" className="text-[20px]" />
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex h-touch-target items-center justify-center rounded-lg px-6 font-button-text text-button-text text-on-primary underline-offset-4 transition-colors hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2 text-primary">
            <Icon name="medication" filled className="text-[22px]" />
            <span className="font-headline-md text-headline-md tracking-tight">MedTrak</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">
            A family medication tracker.
          </p>
          <Link
            href="/auth/sign-in"
            className="font-label-md text-label-md text-primary transition-colors hover:underline"
          >
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
