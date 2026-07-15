import {
  Building2,
  CalendarDays,
  Clock3,
  FileImage,
  MapPin,
  PackageCheck,
} from "lucide-react";
import { ProofOfDeliveryState } from "@/features/shipments/components/ProofOfDeliveryState";
import { ShipmentStatusBadge } from "@/features/shipments/components/ShipmentStatusBadge";
import { formatShipmentDateTime } from "@/features/shipments/utils/shipment-utils";
import type { ShipmentTracking } from "@/features/tracking/types/shipment-tracking";

type ShipmentTrackingResultProps = {
  shipment: ShipmentTracking;
};

type InformationRowProps = {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
};

function InformationRow({ icon: Icon, label, children }: InformationRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-page/45 px-4 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/55 text-primary">
        <Icon size={19} aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
          {label}
        </p>

        <div className="mt-0.5 text-sm font-semibold text-ink">{children}</div>
      </div>
    </div>
  );
}

export function ShipmentTrackingResult({
  shipment,
}: ShipmentTrackingResultProps) {
  return (
    <section
      aria-live="polite"
      className="mt-7 overflow-hidden rounded-xl border border-border"
    >
      <header className="flex flex-col gap-4 bg-secondary/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
            <PackageCheck size={23} aria-hidden="true" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
              Shipment found
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
              {shipment.trackingCode}
            </h2>
          </div>
        </div>

        <ShipmentStatusBadge status={shipment.status} uppercase />
      </header>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <InformationRow icon={Building2} label="Client code">
          {shipment.client}
        </InformationRow>

        <InformationRow icon={MapPin} label="Destination">
          {shipment.destination}
        </InformationRow>

        <InformationRow icon={CalendarDays} label="Dispatch date">
          {formatShipmentDateTime(shipment.dispatchDate)}
        </InformationRow>

        <InformationRow icon={Clock3} label="Last status update">
          {formatShipmentDateTime(shipment.statusDate)}
        </InformationRow>

        <InformationRow icon={FileImage} label="Proof of delivery">
          <ProofOfDeliveryState value={shipment.proofOfDelivery} />
        </InformationRow>

        <InformationRow icon={FileImage} label="POD documents">
          {shipment.podCount}{" "}
          {shipment.podCount === 1 ? "document" : "documents"}
        </InformationRow>
      </div>
    </section>
  );
}
