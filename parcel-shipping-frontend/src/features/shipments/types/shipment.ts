export type ShipmentStatus =
  | "created"
  | "in-transit"
  | "delivered"
  | "failed-delivery"
  | "returned";

export type ProofOfDeliveryStatus = "available" | "missing";

export type Shipment = {
  id: string;
  trackingCode: string;
  dispatchDate: string;
  status: ShipmentStatus;
  statusDate: string;
  proofOfDelivery: ProofOfDeliveryStatus;
  exportedAt: string | null;
};