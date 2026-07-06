export type ShipmentFilters = {
  trackingCode: string;
  dispatchDateFrom: string;
  dispatchDateTo: string;
  status: string;
  proofOfDelivery: string;
  statusDateFrom: string;
  statusDateTo: string;
};

export const initialShipmentFilters: ShipmentFilters = {
  trackingCode: "",
  dispatchDateFrom: "",
  dispatchDateTo: "",
  status: "all",
  proofOfDelivery: "all",
  statusDateFrom: "",
  statusDateTo: "",
};