"use client";

import { cn } from "@/lib/utils";

type CheckboxAnimatedProps = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
};

export function CheckboxAnimated({
  checked,
  onChange,
  disabled,
  children,
}: CheckboxAnimatedProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-4 transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => !disabled && onChange?.(event.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        aria-hidden
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[3px] transition-colors duration-150"
        style={{
          borderColor: checked ? "transparent" : "#e4e4e7",
          background: checked ? "rgb(9 9 11)" : "rgb(249 250 251)",
          borderRadius: 30,
        }}
      >
        <svg
          width="50%"
          height="100%"
          viewBox="0 0 8.25 5.5"
          fill="none"
          stroke={checked ? "white" : "black"}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth="1"
          style={{ display: "block", overflow: "visible" }}
          aria-hidden
        >
          <path
            d="M 0 2.75 L 2.75 5.5 L 8.25 0"
            strokeDasharray="11.667261123657227"
            strokeDashoffset={checked ? 0 : 11.667261123657227}
            style={{
              transition: "stroke-dashoffset 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.15s",
              willChange: "transform",
              opacity: checked ? 1 : 0,
            }}
          />
        </svg>
      </span>
      {children ? <span className="flex-1">{children}</span> : null}
    </label>
  );
}
