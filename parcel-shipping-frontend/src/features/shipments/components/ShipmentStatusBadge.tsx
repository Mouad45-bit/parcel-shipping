import { cn } from "@/lib/utils";
import type { ShipmentStatus } from "@/features/shipments/types/shipment";
import { shipmentStatusLabels } from "@/features/shipments/utils/shipment-utils";

type ShipmentStatusBadgeProps = {
  status: ShipmentStatus;
};

const statusStyles: Record<ShipmentStatus, string> = {
  created: "bg-amber-50 text-amber-700 ring-amber-200",
  "in-transit": "bg-sky-50 text-sky-700 ring-sky-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "failed-delivery": "bg-rose-50 text-rose-700 ring-rose-200",
  returned: "bg-orange-50 text-orange-700 ring-orange-200",
};

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
        statusStyles[status],
      )}
    >
      {shipmentStatusLabels[status]}
    </span>
  );
}