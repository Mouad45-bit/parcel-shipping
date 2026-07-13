"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { StatisticsChartCard } from "@/features/statistics/components/StatisticsChartCard";
import type { StatisticsDistributionItem } from "@/features/statistics/types/statistics";

type ColoredDistributionItem =
  StatisticsDistributionItem & {
    color: string;
  };

type StatisticsDonutChartProps = {
  title: string;
  description: string;
  data: ColoredDistributionItem[];
  centerLabel: string;
};

const tooltipContentStyle = {
  border: "1px solid #eadfd8",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  boxShadow:
    "0 8px 24px rgba(6, 6, 6, 0.08)",
  fontSize: "12px",
};

export function StatisticsDonutChart({
  title,
  description,
  data,
  centerLabel,
}: StatisticsDonutChartProps) {
  const total = data.reduce(
    (sum, item) =>
      sum + item.count,
    0,
  );

  return (
    <StatisticsChartCard
      icon={PieChartIcon}
      title={title}
      description={description}
      isEmpty={total === 0}
    >
      <div className="relative h-[310px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="43%"
              innerRadius={67}
              outerRadius={101}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((item) => (
                <Cell
                  key={item.key}
                  fill={item.color}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={
                tooltipContentStyle
              }
              itemStyle={{
                color: "#060606",
                fontWeight: 600,
              }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#060606",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute left-1/2 top-[43%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span className="text-2xl font-bold text-ink">
            {total}
          </span>

          <span className="mt-0.5 text-sm font-semibold uppercase tracking-wide text-ink/45">
            {centerLabel}
          </span>
        </div>
      </div>

      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.key}>
            {item.label}: {item.count}
          </li>
        ))}
      </ul>
    </StatisticsChartCard>
  );
}
