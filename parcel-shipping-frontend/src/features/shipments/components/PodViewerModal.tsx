"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
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
  const [zoomPercent, setZoomPercent] = useState(100);

  const currentPod = pods[currentIndex] ?? null;

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < pods.length - 1;
  const canZoomOut = zoomPercent > 75;
  const canZoomIn = zoomPercent < 200;
  const renderedImageWidthPercent = zoomPercent / 2;

  function goToIndex(nextIndex: number) {
    setCurrentIndex(nextIndex);
    setZoomPercent(100);
  }

  function zoomOut() {
    setZoomPercent((currentZoom) => Math.max(75, currentZoom - 25));
  }

  function zoomIn() {
    setZoomPercent((currentZoom) => Math.min(200, currentZoom + 25));
  }

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
        setZoomPercent(100);
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
        goToIndex(currentIndex - 1);
      }

      if (event.key === "ArrowRight" && canGoNext) {
        event.preventDefault();
        goToIndex(currentIndex + 1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, canGoPrevious, canGoNext, currentIndex]);

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
      scrollMode="content"
      onClose={onClose}
    >
      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
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
            <div className="mb-4 grid shrink-0 grid-cols-3 items-center gap-3">
              <button
                type="button"
                disabled={!canGoPrevious}
                onClick={() => goToIndex(currentIndex - 1)}
                aria-label="View previous POD image"
                className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-bold text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <p
                aria-live="polite"
                className="justify-self-center text-sm font-bold text-ink"
              >
                {counterText}
              </p>

              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => goToIndex(currentIndex + 1)}
                aria-label="View next POD image"
                className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 justify-self-end rounded-lg border border-border px-3 text-sm font-bold text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>

            <div className="relative min-h-80">
              <div className="min-h-80 overflow-auto rounded-xl border border-border bg-page/60 p-3 sm:max-h-[65dvh]">
                {imageState === "loading" ? (
                  <div className="flex min-h-80 items-center justify-center gap-2 text-sm font-semibold text-ink/60">
                    <LoaderCircle size={18} className="animate-spin" />
                    Loading image...
                  </div>
                ) : imageState === "error" ? (
                  <div
                    role="alert"
                    className="flex min-h-80 flex-col items-center justify-center text-center text-sm font-semibold text-red-700"
                  >
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
                  <div className="flex min-h-80 justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`Proof of delivery ${currentIndex + 1} of ${pods.length} for shipment ${trackingCode ?? ""}`}
                      className="h-auto max-w-none self-start rounded-lg object-contain"
                      style={{
                        width: `${renderedImageWidthPercent}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>

              <div className="absolute bottom-4 right-4 flex items-center rounded-lg border border-primary/15 bg-secondary/95 text-primary shadow-lg backdrop-blur">
                <button
                  type="button"
                  disabled={!canZoomOut}
                  onClick={zoomOut}
                  aria-label="Zoom out POD image"
                  className="inline-flex size-9 cursor-pointer items-center justify-center transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ZoomOut size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => setZoomPercent(100)}
                  aria-label="Reset POD image zoom"
                  className="inline-flex h-9 cursor-pointer items-center gap-1 border-x border-primary/15 px-3 text-xs font-bold transition hover:bg-secondary"
                >
                  <RotateCcw size={14} />
                  {zoomPercent}%
                </button>

                <button
                  type="button"
                  disabled={!canZoomIn}
                  onClick={zoomIn}
                  aria-label="Zoom in POD image"
                  className="inline-flex size-9 cursor-pointer items-center justify-center transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ZoomIn size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
