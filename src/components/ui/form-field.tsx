import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-sale ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-sale">{error}</p>}
      {!error && hint && <p className="text-xs text-mute">{hint}</p>}
    </div>
  );
}
