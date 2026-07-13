import type { ShipmentFilters } from "@/features/shipments/types/shipment-filters";
import type {
  StatisticsShipment,
  StatisticsSummary,
} from "@/features/statistics/types/statistics";

function isDateInRange(
  dateTime: string,
  from: string,
  to: string,
): boolean {
  const date = dateTime.slice(0, 10);

  return (
    (!from || date >= from) &&
    (!to || date <= to)
  );
}

export function filterStatisticsShipments(
  shipments: readonly StatisticsShipment[],
  client: string,
  filters: ShipmentFilters,
): StatisticsShipment[] {
  const normalizedTrackingCode =
    filters.trackingCode
      .trim()
      .toLowerCase();

  return shipments.filter((shipment) => {
    if (shipment.client !== client) {
      return false;
    }

    const trackingCodeMatches =
      shipment.trackingCode
        .toLowerCase()
        .includes(normalizedTrackingCode);

    const dispatchDateMatches =
      isDateInRange(
        shipment.dispatchDate,
        filters.dispatchDateFrom,
        filters.dispatchDateTo,
      );

    const statusDateMatches =
      isDateInRange(
        shipment.statusDate,
        filters.statusDateFrom,
        filters.statusDateTo,
      );

    const statusMatches =
      filters.status === "all" ||
      shipment.status === filters.status;

    const proofOfDeliveryMatches =
      filters.proofOfDelivery === "all" ||
      shipment.proofOfDelivery ===
        filters.proofOfDelivery;

    return (
      trackingCodeMatches &&
      dispatchDateMatches &&
      statusDateMatches &&
      statusMatches &&
      proofOfDeliveryMatches
    );
  });
}

export function summarizeStatisticsShipments(
  shipments: readonly StatisticsShipment[],
): StatisticsSummary {
  const exportedPodCount =
    shipments.filter(
      (shipment) =>
        shipment.exportedAt !== null,
    ).length;

  return {
    totalShipments: shipments.length,
    exportedPodCount,
    pendingPodExportCount:
      shipments.length - exportedPodCount,
  };
}
