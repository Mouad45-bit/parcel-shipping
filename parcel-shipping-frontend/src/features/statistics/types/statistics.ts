import type {
  ProofOfDeliveryStatus,
  ShipmentStatus,
} from "@/features/shipments/types/shipment";

export type StatisticsSummary = {
  totalShipments: number;
  exportedPodCount: number;
  pendingPodExportCount: number;
};

export type StatisticsShipmentStatusCount = {
  status: ShipmentStatus;
  count: number;
};

export type StatisticsPodStatusCount = {
  proofOfDelivery: ProofOfDeliveryStatus;
  count: number;
};

export type StatisticsPeriodCount = {
  period: string;
  count: number;
};

export type StatisticsDestinationCount = {
  destination: string;
  count: number;
};

export type StatisticsDashboardResponse = {
  generatedAt: string;
  client: string;
  summary: StatisticsSummary;
  shipmentStatuses:
    StatisticsShipmentStatusCount[];
  podStatuses:
    StatisticsPodStatusCount[];
  shipmentsByPeriod:
    StatisticsPeriodCount[];
  destinations:
    StatisticsDestinationCount[];
};

/*
 * Types adaptés aux composants graphiques.
 */
export type StatisticsDistributionItem = {
  key: string;
  label: string;
  count: number;
};

export type StatisticsTimelinePoint = {
  period: string;
  label: string;
  count: number;
};

export type StatisticsDestinationItem = {
  key: string;
  label: string;
  count: number;
  latitude: number;
  longitude: number;
};