import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="w-full bg-background">
        <div className="mx-auto flex h-14 w-full max-w-max-width-content items-center justify-center px-margin-mobile">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Icon name="medication" filled className="text-[28px]" />
            <span className="font-headline-md text-headline-md">MedTrak</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-grow flex-col items-center justify-center px-margin-mobile py-10">
        <div className="w-full max-w-max-width-content">{children}</div>
      </main>
    </div>
  );
}
