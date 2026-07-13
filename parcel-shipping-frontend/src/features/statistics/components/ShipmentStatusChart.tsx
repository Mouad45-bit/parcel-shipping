"use client";

import { useMemo } from "react";
import type { ShipmentStatus } from "@/features/shipments/types/shipment";
import { StatisticsDonutChart } from "@/features/statistics/components/StatisticsDonutChart";
import type { StatisticsShipmentStatusCount } from "@/features/statistics/types/statistics";
import { buildShipmentStatusDistribution } from "@/features/statistics/utils/statistics-utils";

type ShipmentStatusChartProps = {
  items:
    readonly StatisticsShipmentStatusCount[];
};

const statusColors: Record<
  ShipmentStatus,
  string
> = {
  created: "#d97706",
  "in-transit": "#0284c7",
  delivered: "#047857",
  "failed-delivery": "#be123c",
  returned: "#c2410c",
};

export function ShipmentStatusChart({
  items,
}: ShipmentStatusChartProps) {
  const data = useMemo(
    () =>
      buildShipmentStatusDistribution(
        items,
      ).map((item) => ({
        ...item,
        color:
          statusColors[
            item.key as ShipmentStatus
          ],
      })),
    [items],
  );

  return (
    <StatisticsDonutChart
      title="Shipment statuses"
      description="Distribution of shipments by their current status."
      data={data}
      centerLabel="Shipments"
    />
  );
}