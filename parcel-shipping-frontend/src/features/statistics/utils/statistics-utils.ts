import type {
  ProofOfDeliveryStatus,
  ShipmentStatus,
} from "@/features/shipments/types/shipment";
import { shipmentStatusLabels } from "@/features/shipments/utils/shipment-utils";
import { destinationCoordinates } from "@/features/statistics/data/morocco-destinations";
import type {
  StatisticsDestinationCount,
  StatisticsDestinationItem,
  StatisticsDistributionItem,
  StatisticsPeriodCount,
  StatisticsPodStatusCount,
  StatisticsShipmentStatusCount,
  StatisticsTimelinePoint,
} from "@/features/statistics/types/statistics";

const shipmentStatusOrder: readonly ShipmentStatus[] = [
  "created",
  "in-transit",
  "delivered",
  "failed-delivery",
  "returned",
];

const proofOfDeliveryOrder: readonly ProofOfDeliveryStatus[] = [
  "available",
  "missing",
];

const proofOfDeliveryLabels: Record<ProofOfDeliveryStatus, string> = {
  available: "Available",
  missing: "Missing",
};

const timelineDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

function parseIsoDate(value: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = value.split("-").map(Number);

  return {
    year,
    month,
    day,
  };
}

function formatTimelineDate(value: string): string {
  const { year, month, day } = parseIsoDate(value);

  return timelineDateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}

function getNextIsoDate(value: string): string {
  const { year, month, day } = parseIsoDate(value);

  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));

  return nextDate.toISOString().slice(0, 10);
}

export function buildShipmentStatusDistribution(
  items: readonly StatisticsShipmentStatusCount[],
): StatisticsDistributionItem[] {
  const counts = new Map(items.map((item) => [item.status, item.count]));

  return shipmentStatusOrder
    .map((status) => ({
      key: status,
      label: shipmentStatusLabels[status],
      count: counts.get(status) ?? 0,
    }))
    .filter((item) => item.count > 0);
}

export function buildProofOfDeliveryDistribution(
  items: readonly StatisticsPodStatusCount[],
): StatisticsDistributionItem[] {
  const counts = new Map(
    items.map((item) => [item.proofOfDelivery, item.count]),
  );

  return proofOfDeliveryOrder
    .map((status) => ({
      key: status,
      label: proofOfDeliveryLabels[status],
      count: counts.get(status) ?? 0,
    }))
    .filter((item) => item.count > 0);
}

export function buildShipmentsTimeline(
  items: readonly StatisticsPeriodCount[],
): StatisticsTimelinePoint[] {
  if (items.length === 0) {
    return [];
  }

  const countByDate = new Map(items.map((item) => [item.period, item.count]));

  const periods = Array.from(countByDate.keys()).sort();

  const firstPeriod = periods[0];

  const lastPeriod = periods[periods.length - 1];

  const timeline: StatisticsTimelinePoint[] = [];

  let currentPeriod = firstPeriod;

  while (currentPeriod <= lastPeriod) {
    timeline.push({
      period: currentPeriod,
      label: formatTimelineDate(currentPeriod),
      count: countByDate.get(currentPeriod) ?? 0,
    });

    currentPeriod = getNextIsoDate(currentPeriod);
  }

  return timeline;
}

export function buildDestinationDistribution(
  items: readonly StatisticsDestinationCount[],
): StatisticsDestinationItem[] {
  return items
    .map((item) => {
      const destination = item.destination.trim();

      const coordinates = destinationCoordinates[destination];

      if (!coordinates) {
        return null;
      }

      return {
        key: destination
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        label: destination,
        count: item.count,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    })
    .filter(
      (destination): destination is StatisticsDestinationItem =>
        destination !== null,
    )
    .sort(
      (firstDestination, secondDestination) =>
        secondDestination.count - firstDestination.count ||
        firstDestination.label.localeCompare(secondDestination.label),
    );
}