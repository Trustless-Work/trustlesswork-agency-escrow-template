import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Create-flow-only styled form primitives. They use explicit utility classes so
 * the screen renders correctly in the default light theme (the shared shadcn
 * token utilities are only defined for the dark media query in this template),
 * while still layering in `dark:` variants for a polished dark experience.
 */

export const fieldInputClass =
  "w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-950 shadow-sm outline-none transition placeholder:text-neutral-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:disabled:bg-neutral-800";

export function inputStateClass(hasError: boolean): string {
  return hasError
    ? "border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/70"
    : "border-neutral-300 focus:border-emerald-500 focus:ring-emerald-500/30 dark:border-neutral-700";
}

type FormSectionProps = {
  step?: number;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({
  step,
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-950",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {typeof step === "number" && (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
            {step}
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-neutral-400">Optional</span>
        )}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}
