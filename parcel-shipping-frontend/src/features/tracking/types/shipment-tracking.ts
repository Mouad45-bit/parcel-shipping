import type {
  ProofOfDeliveryStatus,
  ShipmentStatus,
} from "@/features/shipments/types/shipment";

export type ShipmentTracking = {
  id: string;
  client: string;
  trackingCode: string;
  destination: string;
  dispatchDate: string;
  status: ShipmentStatus;
  statusDate: string;
  proofOfDelivery: ProofOfDeliveryStatus;
  podCount: number;
  exportedAt: string | null;
};

export type ShipmentTrackingErrorKind =
  | "not-found"
  | "invalid"
  | "unavailable"
  | "forbidden"
  | "unexpected";

export type ShipmentTrackingError = {
  kind: ShipmentTrackingErrorKind;
  message: string;
};
