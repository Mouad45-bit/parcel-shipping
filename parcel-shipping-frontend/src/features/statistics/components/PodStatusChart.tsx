"use client";

import { useMemo } from "react";
import type { ProofOfDeliveryStatus } from "@/features/shipments/types/shipment";
import { StatisticsDonutChart } from "@/features/statistics/components/StatisticsDonutChart";
import type { StatisticsPodStatusCount } from "@/features/statistics/types/statistics";
import { buildProofOfDeliveryDistribution } from "@/features/statistics/utils/statistics-utils";

type PodStatusChartProps = {
  items:
    readonly StatisticsPodStatusCount[];
};

const podStatusColors: Record<
  ProofOfDeliveryStatus,
  string
> = {
  available: "#5c3317",
  missing: "#9ca3af",
};

export function PodStatusChart({
  items,
}: PodStatusChartProps) {
  const data = useMemo(
    () =>
      buildProofOfDeliveryDistribution(
        items,
      ).map((item) => ({
        ...item,
        color:
          podStatusColors[
            item.key as
              ProofOfDeliveryStatus
          ],
      })),
    [items],
  );

  return (
    <StatisticsDonutChart
      title="Proof of delivery statuses"
      description="Distribution of available and missing proof of delivery."
      data={data}
      centerLabel="POD"
    />
  );
}