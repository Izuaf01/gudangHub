"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-12 px-4 bg-canvas text-ink text-base border border-hairline rounded-3xl",
          "placeholder:text-stone outline-none transition-all",
          "focus:border-ink focus:ring-2 focus:ring-ink/8",
          error && "border-sale focus:border-sale focus:ring-sale/10",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
