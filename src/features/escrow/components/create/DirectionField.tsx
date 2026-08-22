import { ArrowDownLeft, ArrowUpRight, Check } from "lucide-react";
import type { PaymentDirection } from "@/types/agency-escrow";
import { cn } from "@/lib/utils";
import { DIRECTION_OPTIONS, getDirectionCopy } from "./create-flow";

type DirectionFieldProps = {
  value: PaymentDirection;
  onChange: (value: PaymentDirection) => void;
  name: string;
};

const ICONS: Record<PaymentDirection, typeof ArrowDownLeft> = {
  receivable: ArrowDownLeft,
  payable: ArrowUpRight,
};

export function DirectionField({ value, onChange, name }: DirectionFieldProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Payment direction"
      className="grid gap-3 sm:grid-cols-2"
    >
      {DIRECTION_OPTIONS.map((direction) => {
        const copy = getDirectionCopy(direction);
        const Icon = ICONS[direction];
        const selected = value === direction;

        return (
          <label
            key={direction}
            className={cn(
              "relative flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-emerald-500/40",
              selected
                ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10"
                : "border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600",
            )}
          >
            <input
              type="radio"
              name={name}
              value={direction}
              checked={selected}
              onChange={() => onChange(direction)}
              className="sr-only"
            />
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                selected
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
              {copy.optionLabel}
            </span>
            <span className="text-xs leading-5 text-neutral-600 dark:text-neutral-400">
              {copy.optionHint}
            </span>
            {selected && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
