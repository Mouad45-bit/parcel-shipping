import type {
  ProofOfDeliveryStatus,
  ShipmentStatus,
} from "@/features/shipments/types/shipment";
import type { ShipmentFilters } from "@/features/shipments/types/shipment-filters";
import { shipmentStatusLabels } from "@/features/shipments/utils/shipment-utils";
import type {
  StatisticsDestinationItem,
  StatisticsDistributionItem,
  StatisticsShipment,
  StatisticsSummary,
  StatisticsTimelinePoint,
} from "@/features/statistics/types/statistics";
import { destinationCoordinates } from "@/features/statistics/data/morocco-destinations";

const shipmentStatusOrder: readonly ShipmentStatus[] = [
  "created",
  "in-transit",
  "delivered",
  "failed-delivery",
  "returned",
];

const proofOfDeliveryOrder:
  readonly ProofOfDeliveryStatus[] = [
    "available",
    "missing",
  ];

const proofOfDeliveryLabels: Record<
  ProofOfDeliveryStatus,
  string
> = {
  available: "Available",
  missing: "Missing",
};

const timelineDateFormatter =
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  });

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

function parseIsoDate(
  value: string,
): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return {
    year,
    month,
    day,
  };
}

function formatTimelineDate(
  value: string,
): string {
  const {
    year,
    month,
    day,
  } = parseIsoDate(value);

  return timelineDateFormatter.format(
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    ),
  );
}

function getNextIsoDate(
  value: string,
): string {
  const {
    year,
    month,
    day,
  } = parseIsoDate(value);

  const nextDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day + 1,
    ),
  );

  return nextDate
    .toISOString()
    .slice(0, 10);
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
        .includes(
          normalizedTrackingCode,
        );

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
      shipment.status ===
        filters.status;

    const proofOfDeliveryMatches =
      filters.proofOfDelivery ===
        "all" ||
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
      shipments.length -
      exportedPodCount,
  };
}

export function buildShipmentStatusDistribution(
  shipments: readonly StatisticsShipment[],
): StatisticsDistributionItem[] {
  const counts = new Map<
    ShipmentStatus,
    number
  >();

  shipments.forEach((shipment) => {
    counts.set(
      shipment.status,
      (counts.get(shipment.status) ?? 0) +
        1,
    );
  });

  return shipmentStatusOrder
    .map((status) => ({
      key: status,
      label:
        shipmentStatusLabels[status],
      count: counts.get(status) ?? 0,
    }))
    .filter(
      (item) => item.count > 0,
    );
}

export function buildProofOfDeliveryDistribution(
  shipments: readonly StatisticsShipment[],
): StatisticsDistributionItem[] {
  const counts = new Map<
    ProofOfDeliveryStatus,
    number
  >();

  shipments.forEach((shipment) => {
    counts.set(
      shipment.proofOfDelivery,
      (
        counts.get(
          shipment.proofOfDelivery,
        ) ?? 0
      ) + 1,
    );
  });

  return proofOfDeliveryOrder
    .map((status) => ({
      key: status,
      label:
        proofOfDeliveryLabels[status],
      count: counts.get(status) ?? 0,
    }))
    .filter(
      (item) => item.count > 0,
    );
}

export function buildShipmentsTimeline(
  shipments: readonly StatisticsShipment[],
): StatisticsTimelinePoint[] {
  if (shipments.length === 0) {
    return [];
  }

  const countByDate =
    new Map<string, number>();

  shipments.forEach((shipment) => {
    const dispatchDate =
      shipment.dispatchDate.slice(
        0,
        10,
      );

    countByDate.set(
      dispatchDate,
      (
        countByDate.get(
          dispatchDate,
        ) ?? 0
      ) + 1,
    );
  });

  const periods = Array.from(
    countByDate.keys(),
  ).sort();

  const firstPeriod = periods[0];
  const lastPeriod =
    periods[periods.length - 1];

  const timeline:
    StatisticsTimelinePoint[] = [];

  let currentPeriod = firstPeriod;

  while (
    currentPeriod <= lastPeriod
  ) {
    timeline.push({
      period: currentPeriod,
      label:
        formatTimelineDate(
          currentPeriod,
        ),
      count:
        countByDate.get(
          currentPeriod,
        ) ?? 0,
    });

    currentPeriod =
      getNextIsoDate(
        currentPeriod,
      );
  }

  return timeline;
}

export function buildDestinationDistribution(
  shipments: readonly StatisticsShipment[],
): StatisticsDestinationItem[] {
  const countsByDestination =
    new Map<string, number>();

  shipments.forEach((shipment) => {
    const destination =
      shipment.destination.trim();

    if (!destination) {
      return;
    }

    countsByDestination.set(
      destination,
      (
        countsByDestination.get(
          destination,
        ) ?? 0
      ) + 1,
    );
  });

  return Array.from(
    countsByDestination.entries(),
  )
    .map(([destination, count]) => {
      const coordinates =
        destinationCoordinates[
          destination
        ];

      if (!coordinates) {
        return null;
      }

      return {
        key: destination
          .normalize("NFD")
          .replace(
            /[\u0300-\u036f]/g,
            "",
          )
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-",
          )
          .replace(
            /(^-|-$)/g,
            "",
          ),
        label: destination,
        count,
        latitude:
          coordinates.latitude,
        longitude:
          coordinates.longitude,
      };
    })
    .filter(
      (
        destination,
      ): destination is StatisticsDestinationItem =>
        destination !== null,
    )
    .sort(
      (firstDestination, secondDestination) =>
        secondDestination.count -
          firstDestination.count ||
        firstDestination.label.localeCompare(
          secondDestination.label,
        ),
    );
}