import type { ShipmentStatus } from "@/features/shipments/types/shipment";

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  created: "Created",
  "in-transit": "In transit",
  delivered: "Delivered",
  "failed-delivery": "Failed delivery",
  returned: "Returned",
};

export function formatShipmentDateTime(value: string | null): string {
  if (!value) {
    return "Not exported";
  }

  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year} ${time.slice(0, 5)}`;
}