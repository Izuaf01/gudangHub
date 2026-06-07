import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center px-3 py-0.5 text-xs font-medium rounded-full whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-soft-cloud text-ink",
        success: "bg-green-100 text-success",
        danger: "bg-red-100 text-sale",
        info: "bg-blue-100 text-info",
        warning: "bg-amber-100 text-warning",
        outline: "bg-transparent text-ink border border-hairline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
