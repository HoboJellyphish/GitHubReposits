import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";

/* ---- Text input with a label above (no overlap, fully accessible) -------- */

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  /** Optional trailing node (e.g. a password visibility toggle). */
  trailing?: React.ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  function FloatingInput({ id, label, trailing, className, ...props }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </label>
        <div className="flex h-touch-target w-full items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 transition-all focus-within:border-2 focus-within:border-primary">
          <input
            ref={ref}
            id={id}
            className={cn(
              "h-full w-full border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0",
              className,
            )}
            {...props}
          />
          {trailing}
        </div>
      </div>
    );
  },
);

/* ---- Select with a label above ------------------------------------------- */

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  children: React.ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ id, label, className, children, ...props }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </label>
        <div className="flex h-touch-target items-center rounded-lg border border-outline-variant bg-surface-container-lowest px-4 transition-all focus-within:border-2 focus-within:border-primary">
          <select
            ref={ref}
            id={id}
            className={cn(
              "h-full w-full appearance-none border-none bg-transparent text-body-md text-on-surface outline-none focus:ring-0",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <Icon name="expand_more" className="pointer-events-none text-on-surface-variant" />
        </div>
      </div>
    );
  },
);

/* ---- Textarea ------------------------------------------------------------ */

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ id, label, className, ...props }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "min-h-[96px] w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-all focus:border-2 focus:border-primary focus:ring-0",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
