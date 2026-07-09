import type { Shipment, ShipmentStatus } from "@/features/shipments/types/shipment";
import type { ShipmentFilters } from "@/features/shipments/types/shipment-filters";

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

export function filterShipments(
  shipments: Shipment[],
  filters: ShipmentFilters,
): Shipment[] {
  return shipments.filter((shipment) => {
    const shipmentCodeMatches = shipment.trackingCode
      .toLowerCase()
      .includes(filters.trackingCode.trim().toLowerCase());

    const dispatchDate = shipment.dispatchDate.slice(0, 10);
    const statusDate = shipment.statusDate.slice(0, 10);

    const dispatchDateMatches =
      (!filters.dispatchDateFrom ||
        dispatchDate >= filters.dispatchDateFrom) &&
      (!filters.dispatchDateTo || dispatchDate <= filters.dispatchDateTo);

    const statusDateMatches =
      (!filters.statusDateFrom || statusDate >= filters.statusDateFrom) &&
      (!filters.statusDateTo || statusDate <= filters.statusDateTo);

    const statusMatches =
      filters.status === "all" || shipment.status === filters.status;

    const proofOfDeliveryMatches =
      filters.proofOfDelivery === "all" ||
      shipment.proofOfDelivery === filters.proofOfDelivery;

    return (
      shipmentCodeMatches &&
      dispatchDateMatches &&
      statusDateMatches &&
      statusMatches &&
      proofOfDeliveryMatches
    );
  });
}