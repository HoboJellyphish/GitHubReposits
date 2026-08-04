import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function OnboardingChoicePage() {
  return (
    <>
      <div className="mb-10 text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-lowest soft-elevation">
          <Icon name="family_history" className="text-[40px] text-primary" />
        </div>
        <h1 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile text-primary">
          Set up your family
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Choose how you want to get started.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Create (primary) */}
        <Link
          href="/onboarding/create"
          className="group relative min-h-[140px] overflow-hidden rounded-xl bg-primary p-8 text-left text-on-primary soft-elevation transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
        >
          <div className="absolute -right-4 -top-4 opacity-10 transition-transform duration-500 group-hover:scale-110">
            <Icon name="family_restroom" className="text-[120px]" />
          </div>
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-on-primary/10 p-2">
              <Icon name="add_home" filled />
            </div>
            <span className="font-headline-md text-headline-md">Start a family group</span>
          </div>
          <p className="max-w-[85%] font-body-md text-body-md text-on-primary/80">
            You&apos;ll manage medications and share an invite code.
          </p>
          <div className="mt-6 flex items-center gap-2 self-end font-button-text text-button-text">
            <span>Continue</span>
            <Icon name="arrow_forward" className="text-lg" />
          </div>
        </Link>

        {/* Join (outlined) */}
        <Link
          href="/onboarding/join"
          className="group relative min-h-[140px] overflow-hidden rounded-xl border-2 border-primary bg-surface-container-lowest p-8 text-left text-primary soft-elevation transition-all duration-300 hover:bg-surface-container-low active:scale-[0.98]"
        >
          <div className="absolute -right-4 -top-4 text-primary opacity-[0.04] transition-transform duration-500 group-hover:scale-110">
            <Icon name="group_add" className="text-[120px]" />
          </div>
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/5 p-2">
              <Icon name="group_add" />
            </div>
            <span className="font-headline-md text-headline-md">Join a family group</span>
          </div>
          <p className="max-w-[85%] font-body-md text-body-md text-on-surface-variant">
            Enter an invite code from your caretaker.
          </p>
          <div className="mt-6 flex items-center gap-2 self-end font-button-text text-button-text">
            <span>Enter code</span>
            <Icon name="qr_code_scanner" className="text-lg" />
          </div>
        </Link>
      </div>

      <div className="mt-10 flex items-start gap-4 rounded-xl border border-outline-variant/30 bg-surface-container p-6">
        <Icon name="shield_with_heart" filled className="mt-1 text-on-tertiary-container" />
        <div className="flex flex-col gap-1">
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-primary">
            Privacy first
          </h4>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your health data is protected and only shared with the family members you approve.
          </p>
        </div>
      </div>
    </>
  );
}
