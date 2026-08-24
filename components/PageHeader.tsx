import Link from "next/link";
import { Icon } from "@/components/Icon";

/** Back-button header for focused sub-pages (forms, detail views). */
export function PageHeader({
  title,
  backHref,
  right,
}: {
  title: string;
  backHref: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-touch-target w-full max-w-max-width-content items-center gap-2 px-margin-mobile">
        <Link
          href={backHref}
          aria-label="Go back"
          className="-ml-2 flex h-10 w-10 items-center justify-center text-primary transition-transform active:scale-90"
        >
          <Icon name="arrow_back" className="text-[28px]" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate font-headline-md text-headline-md text-primary">{title}</h1>
        {right}
      </div>
    </header>
  );
}
