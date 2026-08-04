import { Icon } from "@/components/Icon";

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest/50 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
        <Icon name={icon} className="text-[28px] text-on-surface-variant" />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
      {description && (
        <p className="max-w-xs font-body-md text-body-md text-on-surface-variant">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
