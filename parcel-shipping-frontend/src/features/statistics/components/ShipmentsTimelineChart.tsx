"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { StatisticsChartCard } from "@/features/statistics/components/StatisticsChartCard";
import type { StatisticsShipment } from "@/features/statistics/types/statistics";
import { buildShipmentsTimeline } from "@/features/statistics/utils/statistics-utils";

type ShipmentsTimelineChartProps = {
  shipments: readonly StatisticsShipment[];
};

const tooltipContentStyle = {
  border: "1px solid #eadfd8",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  boxShadow: "0 8px 24px rgba(6, 6, 6, 0.08)",
  fontSize: "12px",
};

export function ShipmentsTimelineChart({
  shipments,
}: ShipmentsTimelineChartProps) {
  const data = useMemo(() => buildShipmentsTimeline(shipments), [shipments]);

  return (
    <StatisticsChartCard
      icon={BarChart3}
      title="Shipments by period"
      description="Number of shipments grouped by dispatch date."
      isEmpty={data.length === 0}
    >
      <div className="h-[310px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 12,
              right: 10,
              bottom: 4,
              left: -14,
            }}
          >
            <defs>
              <linearGradient
                id="shipments-timeline-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#5c3317" stopOpacity={0.28} />

                <stop offset="95%" stopColor="#5c3317" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#eadfd8"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              minTickGap={24}
              tick={{
                fill: "#6b625d",
                fontSize: 11,
              }}
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              width={38}
              tick={{
                fill: "#6b625d",
                fontSize: 11,
              }}
            />

            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={{
                color: "#060606",
                fontWeight: 700,
              }}
              itemStyle={{
                color: "#5c3317",
                fontWeight: 600,
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                paddingBottom: "16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#060606",
              }}
            />

            <Area
              type="monotone"
              dataKey="count"
              name="Shipments"
              stroke="#5c3317"
              strokeWidth={2.5}
              fill="url(#shipments-timeline-fill)"
              activeDot={{
                r: 5,
                fill: "#5c3317",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="sr-only">
        The chart contains {data.length} date periods and represents{" "}
        {shipments.length} shipments.
      </p>
    </StatisticsChartCard>
  );
}
