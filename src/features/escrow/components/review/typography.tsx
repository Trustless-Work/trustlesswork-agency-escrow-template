import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TypographyProps = {
  children: ReactNode;
  className?: string;
};

export function Eyebrow({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-xs font-medium text-neutral-500", className)}>
      {children}
    </p>
  );
}

export function PageHeading({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "max-w-3xl text-[28px] font-medium leading-[0.98] tracking-[-1.5px] text-neutral-950 sm:text-[38px] sm:tracking-[-2px] lg:text-[50px] lg:leading-[0.91] lg:tracking-[-3px]",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function SectionHeading({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        "text-[22px] font-medium leading-[1.05] tracking-[-0.8px] text-neutral-950 sm:text-[26px] lg:text-[30px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function Subheading({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn("text-sm font-semibold tracking-tight text-neutral-900", className)}
    >
      {children}
    </h3>
  );
}

export function BodyText({ children, className }: TypographyProps) {
  return (
    <p
      className={cn(
        "text-base font-medium leading-[1.45] tracking-[-0.01em] text-neutral-900",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function MutedText({ children, className }: TypographyProps) {
  return (
    <p
      className={cn(
        "text-sm font-medium leading-5 text-neutral-500",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function MicroLabel({ children, className }: TypographyProps) {
  return (
    <p
      className={cn(
        "text-base font-semibold tracking-tight text-neutral-400",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function MonoText({ children, className }: TypographyProps) {
  return (
    <span
      className={cn(
        "font-mono text-xs tracking-tight text-neutral-500",
        className,
      )}
    >
      {children}
    </span>
  );
}
