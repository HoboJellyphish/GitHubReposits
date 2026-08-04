import { Icon } from "@/components/Icon";

export function AuthHero({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-6 inline-block rounded-full bg-surface-container-lowest p-4 soft-elevation">
        <Icon name={icon} className="text-[48px] text-primary" />
      </div>
      <h1 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile text-primary">{title}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
    </div>
  );
}
