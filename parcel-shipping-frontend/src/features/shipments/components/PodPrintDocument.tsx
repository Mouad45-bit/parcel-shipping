"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchPodDocument,
  ShipmentsApiError,
} from "@/features/shipments/api/shipments-api";
import type { PodDocument } from "@/features/shipments/types/shipment";
import { formatShipmentDateTime } from "@/features/shipments/utils/shipment-utils";
import { useRouter } from "next/navigation";

type PodPrintDocumentProps = {
  shipmentId: string;
};

export function PodPrintDocument({
  shipmentId,
}: PodPrintDocumentProps) {
  const router = useRouter();
  const [document, setDocument] = useState<PodDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(() => new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchPodDocument(shipmentId, controller.signal)
      .then((podDocument) => {
        setDocument(podDocument);
        setError(null);
      })
      .catch((loadError) => {
        if (controller.signal.aborted) {
          return;
        }

        if (loadError instanceof ShipmentsApiError && loadError.status === 401) {
          router.replace("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the printable POD document.",
        );
      });

    return () => {
      controller.abort();
    };
  }, [shipmentId, router]);

  const allImagesLoaded = useMemo(
    () =>
      document !== null &&
      document.pods.length > 0 &&
      loadedImages.size === document.pods.length &&
      failedImages.size === 0,
    [document, failedImages.size, loadedImages.size],
  );

  useEffect(() => {
    if (!allImagesLoaded || hasPrintedRef.current) {
      return;
    }

    hasPrintedRef.current = true;
    window.setTimeout(() => window.print(), 100);
  }, [allImagesLoaded]);

  function markLoaded(podId: string) {
    setLoadedImages((current) => new Set(current).add(podId));
  }

  function markFailed(podId: string) {
    setFailedImages((current) => new Set(current).add(podId));
  }

  if (error) {
    return (
      <main className="min-h-screen bg-page p-6 text-ink">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h1 className="text-xl font-bold">Unable to print POD</h1>
          <p className="mt-2 text-sm font-semibold">{error}</p>
        </div>
      </main>
    );
  }

  if (!document) {
    return (
      <main className="min-h-screen bg-page p-6 text-ink">
        <p className="text-sm font-semibold text-ink/60">Loading document...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page p-6 text-ink print:bg-white print:p-0">
      <div className="no-print mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink/65">
          {failedImages.size > 0
            ? "An image failed to load. Printing is disabled."
            : allImagesLoaded
              ? "Document ready."
              : "Waiting for all images before printing..."}
        </p>

        <button
          type="button"
          disabled={!allImagesLoaded}
          onClick={() => window.print()}
          className="h-10 cursor-pointer rounded-lg bg-primary px-4 text-sm font-bold text-secondary disabled:cursor-not-allowed disabled:opacity-55"
        >
          Print again
        </button>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white text-black shadow-sm print:shadow-none">
        {document.pods.map((pod, index) => {
          const isFirstPage = index === 0;
          const isLastPage = index === document.pods.length - 1;

          return (
            <section
              key={pod.id}
              className={[
                "pod-print-page flex min-h-[297mm] flex-col p-[14mm]",
                isLastPage ? "" : "print-page-break",
              ].join(" ")}
            >
              {isFirstPage ? (
                <header className="space-y-3">
                  <h1 className="text-2xl font-bold">Proof of Delivery</h1>
                  <p>Client: {document.client}</p>
                  <p>Generated at: {formatShipmentDateTime(document.generatedAt)}</p>
                  <div className="grid gap-1 pt-3 text-sm">
                    <p>Tracking code: {document.trackingCode}</p>
                    <p>Destination: {document.destination}</p>
                    <p>Dispatch date: {formatShipmentDateTime(document.dispatchDate)}</p>
                    <p>Status: {document.status}</p>
                    <p>Status date: {formatShipmentDateTime(document.statusDate)}</p>
                  </div>
                </header>
              ) : (
                <header className="space-y-1 text-sm">
                  <p>Tracking code: {document.trackingCode}</p>
                  <p>Status date: {formatShipmentDateTime(document.statusDate)}</p>
                </header>
              )}

              <div className="mt-6 flex flex-1 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pod.contentUrl}
                  alt={`Proof of delivery page ${index + 1} for shipment ${document.trackingCode}`}
                  onLoad={() => markLoaded(pod.id)}
                  onError={() => markFailed(pod.id)}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </section>
          );
        })}
      </article>
    </main>
  );
}
