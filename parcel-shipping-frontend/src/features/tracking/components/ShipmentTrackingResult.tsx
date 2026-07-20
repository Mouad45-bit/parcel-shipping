import {
  Building2,
  CalendarDays,
  Clock3,
  Eye,
  FileImage,
  MapPin,
  PackageCheck,
  Printer,
} from "lucide-react";
import { ShipmentStatusBadge } from "@/features/shipments/components/ShipmentStatusBadge";
import { formatShipmentDateTime } from "@/features/shipments/utils/shipment-utils";
import type { ShipmentTracking } from "@/features/tracking/types/shipment-tracking";

type ShipmentTrackingResultProps = {
  shipment: ShipmentTracking;
  onViewPod: () => void;
  onPrintPod: () => void;
  isPrintingPod: boolean;
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

function capitalizeFirstLetter(value: string) {
  if (value.length === 0) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ShipmentTrackingResult({
  shipment,
  onViewPod,
  onPrintPod,
  isPrintingPod,
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
        <InformationRow icon={Building2} label="Client">
          {capitalizeFirstLetter(shipment.client)}
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

        <div className="flex items-center gap-3 rounded-lg border border-border bg-page/45 px-4 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/55 text-primary">
            <FileImage size={19} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
              Proof of delivery
            </p>

            <p className="mt-0.5 text-sm font-semibold text-ink">
              {shipment.podCount > 0
                ? `${shipment.podCount} ${
                    shipment.podCount === 1 ? "document" : "documents"
                  }`
                : "--"}
            </p>
          </div>

          {shipment.podCount > 0 ? (
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onViewPod}
                aria-label={`View POD for shipment ${shipment.trackingCode}`}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-primary transition hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <Eye size={17} />
              </button>

              <button
                type="button"
                onClick={onPrintPod}
                disabled={isPrintingPod}
                aria-label={`Print POD for shipment ${shipment.trackingCode}`}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-primary transition hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50"
              >
                <Printer size={17} />
              </button>
            </div>
          ) : null}
        </div>

        <InformationRow icon={CalendarDays} label="Export date">
          {shipment.exportedAt
            ? formatShipmentDateTime(shipment.exportedAt)
            : "--"}
        </InformationRow>
      </div>
    </section>
  );
}
