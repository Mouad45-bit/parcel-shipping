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
  podCount: number;
  exportedAt: string | null;
};

export type ShipmentPod = {
  id: string;
  position: number;
  contentUrl: string;
};

export type ShipmentPodsResponse = {
  shipmentId: string;
  count: number;
  items: ShipmentPod[];
};

export type PodDocument = {
  shipmentId: string;
  client: string;
  trackingCode: string;
  destination: string;
  dispatchDate: string;
  status: ShipmentStatus;
  statusDate: string;
  generatedAt: string;
  pods: ShipmentPod[];
};
