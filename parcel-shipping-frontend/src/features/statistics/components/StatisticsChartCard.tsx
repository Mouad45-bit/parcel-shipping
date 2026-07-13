import type {
  ReactNode,
} from "react";
import {
  ChartNoAxesCombined,
  type LucideIcon,
} from "lucide-react";

type StatisticsChartCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
};

export function StatisticsChartCard({
  icon: Icon,
  title,
  description,
  isEmpty = false,
  emptyMessage =
    "No data matches the current filters.",
  children,
}: StatisticsChartCardProps) {
  return (
    <section className="flex min-h-[410px] flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex items-center gap-3 border-b border-border pb-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/55 text-primary">
          <Icon
            aria-hidden="true"
            size={20}
          />
        </span>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-ink">
            {title}
          </h2>

          <p className="mt-0.5 text-xs leading-5 text-ink/50">
            {description}
          </p>
        </div>
      </header>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-secondary/35 text-primary">
            <ChartNoAxesCombined
              aria-hidden="true"
              size={22}
            />
          </span>

          <p className="mt-4 text-sm font-bold text-ink">
            No statistics available
          </p>

          <p className="mt-1 max-w-sm text-sm leading-6 text-ink/50">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 pt-5">
          {children}
        </div>
      )}
    </section>
  );
}
