"use client";

import { useId, useMemo } from "react";
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
import type {
  StatisticsPeriodCount,
  StatisticsTimelinePoint,
} from "@/features/statistics/types/statistics";
import { buildShipmentsTimeline } from "@/features/statistics/utils/statistics-utils";

type ShipmentsTimelineChartProps = {
  periods: readonly StatisticsPeriodCount[];
};

type TimelineContentProps = {
  data: StatisticsTimelinePoint[];
  heightClassName: string;
  gradientId: string;
};

const tooltipContentStyle = {
  border: "1px solid #eadfd8",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  boxShadow: "0 8px 24px rgba(6, 6, 6, 0.08)",
  fontSize: "12px",
};

function TimelineContent({
  data,
  heightClassName,
  gradientId,
}: TimelineContentProps) {
  const maximumCount = data.reduce(
    (maximum, point) => Math.max(maximum, point.count),
    0,
  );

  const yAxisMaximum = maximumCount + 1;

  return (
    <div className={["w-full", heightClassName].join(" ")}>
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
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
              fontSize: 12,
              fontWeight: 600,
            }}
          />

          <YAxis
            allowDecimals={false}
            domain={[0, yAxisMaximum]}
            axisLine={false}
            tickLine={false}
            width={38}
            tick={{
              fill: "#6b625d",
              fontSize: 12,
              fontWeight: 600,
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
            fill={`url(#${gradientId})`}
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
  );
}

export function ShipmentsTimelineChart({
  periods,
}: ShipmentsTimelineChartProps) {
  const chartId = useId().replaceAll(":", "");

  const data = useMemo(() => buildShipmentsTimeline(periods), [periods]);

  const totalShipments = periods.reduce(
    (total, period) => total + period.count,
    0,
  );

  return (
    <StatisticsChartCard
      icon={BarChart3}
      title="Shipments by period"
      description="Number of shipments grouped by dispatch date."
      isEmpty={data.length === 0}
      expandedContent={
        <TimelineContent
          data={data}
          heightClassName="h-[min(68vh,620px)]"
          gradientId={`${chartId}-expanded`}
        />
      }
    >
      <TimelineContent
        data={data}
        heightClassName="h-[310px]"
        gradientId={`${chartId}-compact`}
      />

      <p className="sr-only">
        The chart contains {data.length} date periods and represents{" "}
        {totalShipments} shipments.
      </p>
    </StatisticsChartCard>
  );
}
