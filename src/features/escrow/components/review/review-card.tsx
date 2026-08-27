import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MutedText, SectionHeading } from "./typography";

type ReviewCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function ReviewCard({
  title,
  description,
  children,
  className,
  bodyClassName,
}: ReviewCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[24px] border border-zinc-500/[0.10] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all",
        className,
      )}
    >
      {(title || description) && (
        <div className="space-y-1 px-4 pt-4 sm:px-6 sm:pt-6">
          {title ? <SectionHeading>{title}</SectionHeading> : null}
          {description ? <MutedText>{description}</MutedText> : null}
        </div>
      )}
      <div className={cn("flex-1 space-y-4 p-4 sm:p-6", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
