import type { StatisticsSummary as StatisticsSummaryData } from "@/features/statistics/types/statistics";

type StatisticsSummaryProps = {
  summary: StatisticsSummaryData;
};

export function StatisticsSummary({
  summary,
}: StatisticsSummaryProps) {
  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-ink">
            {summary.totalShipments}{" "}
            {summary.totalShipments === 1
              ? "Shipment"
              : "Shipments"}
          </p>

          <p className="mt-1 text-sm font-medium text-ink/55">
            Statistics calculated from the current filters.
          </p>
        </div>

        <p className="text-sm font-semibold text-ink/70 sm:self-end">
          POD exported:{" "}
          {summary.exportedPodCount} / Pending:{" "}
          {summary.pendingPodExportCount}
        </p>
      </div>
    </section>
  );
}
