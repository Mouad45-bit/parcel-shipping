"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchShipmentPods } from "@/features/shipments/api/shipments-api";
import type { ShipmentPod } from "@/features/shipments/types/shipment";

type ShipmentPodThumbnailsProps = {
  shipmentId: string;
  trackingCode: string;
  podCount: number;
  onViewPod: (initialPosition?: number) => void;
};

export function ShipmentPodThumbnails({
  shipmentId,
  trackingCode,
  podCount,
  onViewPod,
}: ShipmentPodThumbnailsProps) {
  const [pods, setPods] = useState<ShipmentPod[]>([]);
  const [isLoading, setIsLoading] = useState(podCount > 0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    fetchShipmentPods(shipmentId, abortController.signal)
      .then((response) => {
        setPods(response.items);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        console.error(
          "Unable to load shipment POD thumbnails.",
          error,
        );

        setPods([]);
        setHasError(true);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [shipmentId]);

  if (isLoading) {
    return (
      <div
        className="flex justify-center gap-1.5"
        aria-label={`Loading ${podCount} POD preview${podCount > 1 ? "s" : ""}`}
      >
        {Array.from({ length: Math.min(podCount, 3) }).map(
          (_, index) => (
            <span
              key={index}
              className="h-12 w-9 animate-pulse rounded-md border border-border bg-secondary/50"
            />
          ),
        )}
      </div>
    );
  }

  if (hasError || pods.length === 0) {
    return <span className="text-sm font-semibold text-ink/35">--</span>;
  }

  return (
    <div className="flex justify-center gap-1.5">
      {pods.map((pod) => (
        <button
          key={pod.id}
          type="button"
          onClick={() => onViewPod(pod.position)}
          aria-label={`View POD ${pod.position} for shipment ${trackingCode}`}
          className="group inline-flex cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Image
            src={pod.contentUrl}
            alt={`POD ${pod.position} preview for shipment ${trackingCode}`}
            width={36}
            height={48}
            unoptimized
            loading="lazy"
            className="h-12 w-9 rounded-md border border-border bg-surface object-cover shadow-sm transition group-hover:border-primary"
          />
        </button>
      ))}
    </div>
  );
}
