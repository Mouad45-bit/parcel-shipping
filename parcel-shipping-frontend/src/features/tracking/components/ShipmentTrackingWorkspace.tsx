"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  LoaderCircle,
  PackageSearch,
  RefreshCw,
  Search,
  SearchCode,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components/ui/PageCard";
import { ShipmentTrackingResult } from "@/features/tracking/components/ShipmentTrackingResult";
import { useShipmentTracking } from "@/features/tracking/hooks/useShipmentTracking";
import {
  normalizeTrackingCode,
  trackingCodeMaximumLength,
  validateTrackingCode,
} from "@/features/tracking/utils/shipment-tracking-utils";

type ShipmentTrackingWorkspaceProps = {
  initialTrackingCode: string | null;
};

export function ShipmentTrackingWorkspace({
  initialTrackingCode,
}: ShipmentTrackingWorkspaceProps) {
  const router = useRouter();

  const synchronizedTrackingCodeRef = useRef<string | null>(null);

  const normalizedInitialTrackingCode = initialTrackingCode
    ? normalizeTrackingCode(initialTrackingCode)
    : "";

  const [trackingCode, setTrackingCode] = useState(
    normalizedInitialTrackingCode,
  );

  const [inputError, setInputError] = useState<string | null>(() =>
    initialTrackingCode
      ? validateTrackingCode(normalizedInitialTrackingCode)
      : null,
  );

  const { data, requestedCode, isLoading, error, track, reset } =
    useShipmentTracking();

  useEffect(() => {
    if (!initialTrackingCode) {
      synchronizedTrackingCodeRef.current = null;

      return;
    }

    const normalizedCode = normalizeTrackingCode(initialTrackingCode);

    const validationError = validateTrackingCode(normalizedCode);

    if (validationError) {
      return;
    }

    if (synchronizedTrackingCodeRef.current === normalizedCode) {
      return;
    }

    synchronizedTrackingCodeRef.current = normalizedCode;

    void track(normalizedCode);
  }, [initialTrackingCode, track]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const validationError = validateTrackingCode(trackingCode);

    setInputError(validationError);

    if (validationError) {
      return;
    }

    const normalizedCode = normalizeTrackingCode(trackingCode);

    setTrackingCode(normalizedCode);

    synchronizedTrackingCodeRef.current = normalizedCode;

    void track(normalizedCode);

    router.replace(
      `/shipments/track?code=${encodeURIComponent(normalizedCode)}`,
    );
  }

  function handleReset() {
    synchronizedTrackingCodeRef.current = null;

    reset();
    setTrackingCode("");
    setInputError(null);

    router.replace("/shipments/track");
  }

  return (
    <PageCard className="overflow-hidden">
      <header className="border-b border-border bg-ink/[0.035] px-5 py-6 sm:px-7">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <PackageSearch size={25} aria-hidden="true" />
          </span>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Track a Shipment
            </h1>

            <p className="mt-1 text-sm leading-6 text-ink/55">
              Enter a tracking code to retrieve the current shipment
              information.
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 sm:px-7">
        <form onSubmit={handleSubmit} noValidate role="search">
          <label
            htmlFor="tracking-code"
            className="text-sm font-semibold text-ink"
          >
            Tracking code
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
              />

              <input
                id="tracking-code"
                name="trackingCode"
                type="search"
                value={trackingCode}
                maxLength={trackingCodeMaximumLength}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(inputError)}
                aria-describedby={
                  inputError ? "tracking-code-error" : undefined
                }
                placeholder="Example: QB100000002MA"
                onChange={(event) => {
                  setTrackingCode(event.target.value);

                  setInputError(null);
                }}
                className="h-12 w-full rounded-lg border border-border bg-surface pl-11 pr-4 text-sm font-semibold uppercase tracking-wide text-ink outline-none transition placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/35 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-secondary transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <SearchCode size={18} />
              )}

              {isLoading ? "Tracking..." : "Track shipment"}
            </button>
          </div>

          {inputError ? (
            <p
              id="tracking-code-error"
              role="alert"
              className="mt-2 text-sm font-semibold text-red-700"
            >
              {inputError}
            </p>
          ) : null}
        </form>

        {error ? (
          <div
            role="alert"
            className={[
              "mt-6 rounded-lg border px-4 py-4",
              error.kind === "not-found"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-800",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />

              <div>
                <p className="text-sm font-bold">
                  {error.kind === "not-found"
                    ? "Shipment not found"
                    : "Unable to track shipment"}
                </p>

                <p className="mt-1 text-sm">{error.message}</p>
              </div>
            </div>

            {error.kind === "unavailable" ? (
              <button
                type="button"
                onClick={() => {
                  if (requestedCode) {
                    void track(requestedCode);
                  }
                }}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-bold"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        {data ? (
          <>
            <ShipmentTrackingResult shipment={data} />

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer text-sm font-bold text-primary transition hover:text-primary/75"
              >
                Track another shipment
              </button>
            </div>
          </>
        ) : null}
      </div>
    </PageCard>
  );
}
