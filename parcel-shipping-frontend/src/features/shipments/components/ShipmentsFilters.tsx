"use client";

import {
  CalendarDays,
  ChevronDown,
  FileDown,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";

type ShipmentsFiltersProps = {
  filters: ShipmentFilters;
  selectedShipmentCount: number;
  onChange: (filters: ShipmentFilters) => void;
  onReset: () => void;
};

type DateRangeFieldsProps = {
  title: string;
  fromId: string;
  toId: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  onChange: (value: string) => void;
};

const inputClassName =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/15";

function DateRangeFields({
  title,
  fromId,
  toId,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: DateRangeFieldsProps) {
  return (
    <div
      role="group"
      aria-label={title}
      className="grid min-w-0 grid-rows-[20px_44px_44px] gap-y-3"
    >
      <p className="flex h-5 items-center gap-2 text-sm font-semibold text-ink">
        <CalendarDays size={17} className="text-primary" />
        {title}
      </p>

      <label className="flex h-11 items-center gap-0.5 text-sm font-medium text-ink/75">
        <span className="w-10 shrink-0">From</span>

        <input
          id={fromId}
          type="date"
          value={fromValue}
          onChange={(event) => onFromChange(event.target.value)}
          className={inputClassName}
        />
      </label>

      <label className="flex h-11 items-center gap-0.5 text-sm font-medium text-ink/75">
        <span className="w-10 shrink-0">To</span>

        <input
          id={toId}
          type="date"
          value={toValue}
          onChange={(event) => onToChange(event.target.value)}
          className={inputClassName}
        />
      </label>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} appearance-none pr-10`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/55"
      />
    </div>
  );
}

export function ShipmentsFilters({
  filters,
  selectedShipmentCount,
  onChange,
  onReset,
}: ShipmentsFiltersProps) {
  function updateFilter<Key extends keyof ShipmentFilters>(
    key: Key,
    value: ShipmentFilters[Key],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  const hasActiveFilters = (
    Object.keys(initialShipmentFilters) as Array<keyof ShipmentFilters>
  ).some((key) => filters[key] !== initialShipmentFilters[key]);

  const canExport = selectedShipmentCount > 0;

  return (
    <form onSubmit={(event) => event.preventDefault()} className="mt-6">
      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={!canExport}
          className="inline-flex h-11 w-fit items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary bg-secondary px-4 text-sm font-semibold text-primary transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          <FileDown size={17} />
          Export
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="inline-flex h-11 w-fit items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-secondary transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          <RotateCcw size={17} />
          Reset filters
        </button>
      </div>

      <div className="mt-3 grid items-start gap-8 xl:grid-cols-[minmax(220px,1fr)_minmax(260px,1fr)_minmax(220px,0.9fr)_minmax(260px,1fr)]">
        <div className="grid min-w-0 grid-rows-[20px_44px_44px] gap-y-3">
          <label
            htmlFor="tracking-code"
            className="h-5 text-sm font-medium leading-5 text-ink/75"
          >
            Shipment code
          </label>

          <div className="relative h-11">
            <input
              id="tracking-code"
              name="trackingCode"
              type="search"
              value={filters.trackingCode}
              onChange={(event) =>
                updateFilter("trackingCode", event.target.value)
              }
              placeholder="Search by shipment code"
              className={`${inputClassName} pr-11`}
            />

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 flex size-11 items-center justify-center text-primary"
            >
              <Search size={19} />
            </span>
          </div>

          <div aria-hidden="true" />
        </div>

        <DateRangeFields
          title="Dispatch date"
          fromId="dispatch-date-from"
          toId="dispatch-date-to"
          fromValue={filters.dispatchDateFrom}
          toValue={filters.dispatchDateTo}
          onFromChange={(value) => updateFilter("dispatchDateFrom", value)}
          onToChange={(value) => updateFilter("dispatchDateTo", value)}
        />

        <div className="grid min-w-0 grid-rows-[20px_44px_44px] gap-y-3">
          <div aria-hidden="true" className="h-5" />

          <SelectField
            id="shipment-status"
            label="Status"
            value={filters.status}
            onChange={(value) => updateFilter("status", value)}
            options={[
              { value: "all", label: "All statuses" },
              { value: "created", label: "Created" },
              { value: "in-transit", label: "In transit" },
              { value: "delivered", label: "Delivered" },
              { value: "failed-delivery", label: "Failed delivery" },
              { value: "returned", label: "Returned" },
            ]}
          />

          <SelectField
            id="proof-of-delivery"
            label="Proof of delivery"
            value={filters.proofOfDelivery}
            onChange={(value) => updateFilter("proofOfDelivery", value)}
            options={[
              { value: "all", label: "All proof of delivery" },
              { value: "available", label: "Available" },
              { value: "missing", label: "Missing" },
            ]}
          />
        </div>

        <DateRangeFields
          title="Status date"
          fromId="status-date-from"
          toId="status-date-to"
          fromValue={filters.statusDateFrom}
          toValue={filters.statusDateTo}
          onFromChange={(value) => updateFilter("statusDateFrom", value)}
          onToChange={(value) => updateFilter("statusDateTo", value)}
        />
      </div>
    </form>
  );
}
