"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-ink text-canvas hover:opacity-85 active:scale-95",
        secondary: "bg-soft-cloud text-ink hover:bg-hairline-soft",
        danger: "bg-sale text-canvas hover:opacity-85 active:scale-95",
        ghost:
          "bg-transparent text-ink border border-hairline hover:bg-soft-cloud",
        link: "bg-transparent text-ink underline p-0 h-auto",
      },
      size: {
        md: "h-12 px-8 text-base rounded-[30px]",
        sm: "h-10 px-4 text-sm rounded-[30px]",
        xs: "h-8 px-3 text-xs rounded-[30px]",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
