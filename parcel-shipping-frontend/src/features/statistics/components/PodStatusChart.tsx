"use client";

import {
  useMemo,
} from "react";
import type { ProofOfDeliveryStatus } from "@/features/shipments/types/shipment";
import { StatisticsDonutChart } from "@/features/statistics/components/StatisticsDonutChart";
import type { StatisticsShipment } from "@/features/statistics/types/statistics";
import { buildProofOfDeliveryDistribution } from "@/features/statistics/utils/statistics-utils";

type PodStatusChartProps = {
  shipments:
    readonly StatisticsShipment[];
};

const podStatusColors: Record<
  ProofOfDeliveryStatus,
  string
> = {
  available: "#5c3317",
  missing: "#9ca3af",
};

export function PodStatusChart({
  shipments,
}: PodStatusChartProps) {
  const data = useMemo(
    () =>
      buildProofOfDeliveryDistribution(
        shipments,
      ).map((item) => ({
        ...item,
        color:
          podStatusColors[
            item.key as ProofOfDeliveryStatus
          ],
      })),
    [shipments],
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
