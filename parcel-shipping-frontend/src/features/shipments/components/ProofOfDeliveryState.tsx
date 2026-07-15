import {
  CheckCircle2,
  FileWarning,
} from "lucide-react";
import type { ProofOfDeliveryStatus } from "@/features/shipments/types/shipment";

type ProofOfDeliveryStateProps = {
  value: ProofOfDeliveryStatus;
};

export function ProofOfDeliveryState({
  value,
}: ProofOfDeliveryStateProps) {
  const isAvailable =
    value === "available";

  return (
    <span
      className={
        isAvailable
          ? "inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"
          : "inline-flex items-center gap-1.5 text-sm font-medium text-ink/55"
      }
    >
      {isAvailable ? (
        <CheckCircle2
          size={16}
          aria-hidden="true"
        />
      ) : (
        <FileWarning
          size={16}
          aria-hidden="true"
        />
      )}

      {isAvailable
        ? "Available"
        : "Missing"}
    </span>
  );
}
