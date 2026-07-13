import type {
  ProofOfDeliveryStatus,
  ShipmentStatus,
} from "@/features/shipments/types/shipment";

export type StatisticsShipment = {
  id: string;
  client: string;
  trackingCode: string;
  dispatchDate: string;
  status: ShipmentStatus;
  statusDate: string;
  proofOfDelivery: ProofOfDeliveryStatus;
  exportedAt: string | null;
  destination: string;
};

export type StatisticsSummary = {
  totalShipments: number;
  exportedPodCount: number;
  pendingPodExportCount: number;
};

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