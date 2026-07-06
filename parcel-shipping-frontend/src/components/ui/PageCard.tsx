import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type PageCardProps = ComponentPropsWithoutRef<"section">;

export function PageCard({ className, ...props }: PageCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-surface shadow-sm",
        className,
      )}
      {...props}
    />
  );
}