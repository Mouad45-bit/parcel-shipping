"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  fetchShipmentPods,
  readShipmentsApiError,
  ShipmentsApiError,
} from "@/features/shipments/api/shipments-api";
import type { ShipmentPod } from "@/features/shipments/types/shipment";

type PodViewerModalProps = {
  isOpen: boolean;
  shipmentId: string | null;
  trackingCode: string | null;
  initialPosition?: number | null;
  onClose: () => void;
};

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest("button,a,input,select,textarea,[role='button']"),
  );
}

export function PodViewerModal({
  isOpen,
  shipmentId,
  trackingCode,
  initialPosition = null,
  onClose,
}: PodViewerModalProps) {
  const [pods, setPods] = useState<ShipmentPod[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [listState, setListState] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [imageState, setImageState] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const currentPod = pods[currentIndex] ?? null;

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < pods.length - 1;

  const loadPods = useCallback(
    async (signal: AbortSignal) => {
      if (!shipmentId) {
        return;
      }

      setListState("loading");
      setError(null);
      setPods([]);
      setCurrentIndex(0);

      try {
        const response = await fetchShipmentPods(shipmentId, signal);
        setPods(response.items);
        setCurrentIndex(
          Math.max(
            response.items.findIndex(
              (pod) => pod.position === initialPosition,
            ),
            0,
          ),
        );
        setListState("idle");
      } catch (loadError) {
        if (signal.aborted) {
          return;
        }

        setListState("error");
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load POD documents.",
        );
      }
    },
    [initialPosition, shipmentId],
  );

  useEffect(() => {
    if (!isOpen || !shipmentId) {
      return;
    }

    const controller = new AbortController();

    queueMicrotask(() => {
      void loadPods(controller.signal);
    });

    return () => {
      controller.abort();
    };
  }, [isOpen, shipmentId, loadPods, reloadKey]);

  useEffect(() => {
    if (!isOpen || !currentPod) {
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;

    async function loadImage() {
      setImageState("loading");
      setError(null);

      try {
        const response = await fetch(currentPod.contentUrl, {
          method: "GET",
          headers: {
            Accept: "image/png,application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          const apiError = await readShipmentsApiError(response);

          throw new ShipmentsApiError(
            apiError?.message ?? "Unable to load the POD image.",
            response.status,
            apiError?.code,
          );
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setImageState("idle");
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setImageState("error");
        setImageUrl(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the POD image.",
        );
      }
    }

    void loadImage();

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      setImageUrl(null);
    };
  }, [isOpen, currentPod]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isInteractiveTarget(event.target)) {
        return;
      }

      if (event.key === "ArrowLeft" && canGoPrevious) {
        event.preventDefault();
        setCurrentIndex((index) => index - 1);
      }

      if (event.key === "ArrowRight" && canGoNext) {
        event.preventDefault();
        setCurrentIndex((index) => index + 1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, canGoPrevious, canGoNext]);

  const counterText = useMemo(() => {
    if (pods.length === 0) {
      return "0 / 0";
    }

    return `${currentIndex + 1} / ${pods.length}`;
  }, [currentIndex, pods.length]);

  return (
    <Modal
      isOpen={isOpen}
      title="Proof of Delivery"
      description={
        trackingCode
          ? `Viewing POD documents for shipment ${trackingCode}.`
          : "Viewing POD documents."
      }
      size="wide"
      onClose={onClose}
    >
      <div className="p-5 sm:p-6">
        {listState === "loading" ? (
          <div className="flex min-h-80 items-center justify-center gap-2 text-sm font-semibold text-ink/60">
            <LoaderCircle size={18} className="animate-spin" />
            Loading POD documents...
          </div>
        ) : listState === "error" ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-bold"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={!canGoPrevious}
                onClick={() => setCurrentIndex((index) => index - 1)}
                aria-label="View previous POD image"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-bold text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <p aria-live="polite" className="text-sm font-bold text-ink">
                {counterText}
              </p>

              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setCurrentIndex((index) => index + 1)}
                aria-label="View next POD image"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-bold text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>

            <div className="flex min-h-80 items-center justify-center rounded-xl border border-border bg-page/60 p-3">
              {imageState === "loading" ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-ink/60">
                  <LoaderCircle size={18} className="animate-spin" />
                  Loading image...
                </div>
              ) : imageState === "error" ? (
                <div role="alert" className="text-center text-sm font-semibold text-red-700">
                  {error}
                  <button
                    type="button"
                    onClick={() => setReloadKey((key) => key + 1)}
                    className="mx-auto mt-3 flex cursor-pointer items-center gap-2 font-bold"
                  >
                    <RefreshCw size={16} />
                    Retry
                  </button>
                </div>
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={`Proof of delivery ${currentIndex + 1} of ${pods.length} for shipment ${trackingCode ?? ""}`}
                  className="max-h-[70dvh] w-auto max-w-full rounded-lg object-contain"
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
