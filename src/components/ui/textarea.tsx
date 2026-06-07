"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-4 py-3 bg-canvas text-ink text-base border border-hairline rounded-2xl",
          "placeholder:text-stone outline-none resize-y transition-all min-h-25",
          "focus:border-ink focus:ring-2 focus:ring-ink/8",
          error && "border-sale focus:border-sale",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
