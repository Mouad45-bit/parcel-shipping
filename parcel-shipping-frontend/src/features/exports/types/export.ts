import type {
  ProofOfDeliveryStatus,
  ShipmentStatus,
} from "@/features/shipments/types/shipment";

export type ShipmentExport = {
  id: string;
  shipmentId: string;
  client: string;
  trackingCode: string;
  destination: string;
  dispatchDate: string;
  status: ShipmentStatus;
  statusDate: string;
  proofOfDelivery: ProofOfDeliveryStatus;
  podCount: number;
  generatedAt: string;
  archivedAt: string | null;
  contentUrl: string;
};

export type ExportPageResponse = {
  items: ShipmentExport[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
