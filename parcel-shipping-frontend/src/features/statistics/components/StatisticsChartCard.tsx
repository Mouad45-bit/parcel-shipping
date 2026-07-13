"use client";

import {
  type ReactNode,
  useState,
} from "react";
import {
  ChartNoAxesCombined,
  Maximize2,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type StatisticsChartCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  expandedContent?: ReactNode;
};

export function StatisticsChartCard({
  icon: Icon,
  title,
  description,
  isEmpty = false,
  emptyMessage =
    "No data matches the current filters.",
  children,
  expandedContent,
}: StatisticsChartCardProps) {
  const [isExpanded, setIsExpanded] =
    useState(false);

  const canExpand =
    expandedContent !== undefined;

  return (
    <>
      <section className="flex min-h-[410px] flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
        <header className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-3">
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
          </div>

          {canExpand ? (
            <button
              type="button"
              onClick={() =>
                setIsExpanded(true)
              }
              disabled={isEmpty}
              aria-label={`Expand ${title}`}
              className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-primary transition hover:border-primary/25 hover:bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-40"
            >
              <Maximize2 size={17} />
            </button>
          ) : null}
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

      {canExpand ? (
        <Modal
          isOpen={isExpanded}
          title={title}
          description={description}
          size="wide"
          onClose={() =>
            setIsExpanded(false)
          }
        >
          <div className="p-5 sm:p-6">
            {expandedContent}
          </div>
        </Modal>
      ) : null}
    </>
  );
}