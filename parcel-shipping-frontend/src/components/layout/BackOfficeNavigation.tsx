"use client";

import { useState } from "react";
import Link from "next/link";

export type BackOfficeSection =
  | "statistics"
  | "shipments"
  | "tracking"
  | "exports"
  | "profile";

type NavigationSection = Exclude<
  BackOfficeSection,
  "profile"
>;

type BackOfficeNavigationProps = {
  activeSection: BackOfficeSection;
};

const navigationItems: {
  key: NavigationSection;
  label: string;
  href: string;
}[] = [
  {
    key: "statistics",
    label: "Statistics",
    href: "/statistics",
  },
  {
    key: "shipments",
    label: "Shipments",
    href: "/shipments",
  },
  {
    key: "tracking",
    label: "Track a Shipment",
    href: "/shipments/track",
  },
  {
    key: "exports",
    label: "Exports",
    href: "/exports",
  },
];

function getNavigationIndex(activeSection: BackOfficeSection) {
  return navigationItems.findIndex((item) => item.key === activeSection);
}

export function BackOfficeNavigation({
  activeSection,
}: BackOfficeNavigationProps) {
  const activeNavigationIndex = getNavigationIndex(activeSection);
  const [indicatorIndex, setIndicatorIndex] = useState(activeNavigationIndex);

  return (
    <nav
      aria-label="Primary navigation"
      className="overflow-x-auto border-t border-primary/20 py-2"
    >
      <div className="relative flex min-w-max items-center gap-1.5 rounded-2xl border border-secondary bg-secondary/30 p-1.5 shadow-sm">
        {indicatorIndex >= 0 ? (
          <span
            aria-hidden="true"
            className="absolute inset-y-1.5 left-1.5 w-40 rounded-xl bg-primary shadow-md transition-transform duration-200 ease-out"
            style={{
              transform: `translateX(calc(${indicatorIndex} * (10rem + 0.375rem)))`,
            }}
          />
        ) : null}

        {navigationItems.map((item, itemIndex) => {
          const isActive =
            item.key === activeSection;
          const isIndicatorSelected =
            itemIndex === indicatorIndex;
          const isLastItem =
            itemIndex === navigationItems.length - 1;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={
                isActive
                  ? "page"
                  : undefined
              }
              onClick={() => {
                setIndicatorIndex(itemIndex);
              }}
              className={[
                "relative z-10 w-40 rounded-xl px-4 py-2 text-center text-sm font-semibold transition-all duration-200 ease-out",
                isIndicatorSelected
                  ? "text-secondary"
                  : "text-ink/65 hover:-translate-y-[0.5px] hover:bg-surface/75 hover:text-primary hover:shadow-sm",
              ].join(" ")}
            >
              {item.label}

              {!isLastItem ? (
                <span
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute -right-[0.5625rem] top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary/35 transition-opacity duration-200",
                    isIndicatorSelected || itemIndex + 1 === indicatorIndex
                      ? "opacity-0"
                      : "opacity-100",
                  ].join(" ")}
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
