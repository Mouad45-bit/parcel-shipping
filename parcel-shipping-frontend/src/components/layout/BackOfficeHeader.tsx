import Link from "next/link";
import { Menu, PackageCheck } from "lucide-react";

type BackOfficeSection =
  | "statistics"
  | "shipments"
  | "tracking"
  | "exports";

type BackOfficeHeaderProps = {
  activeSection: BackOfficeSection;
  userName?: string;
  userRole?: string;
};

const navigationItems: {
  key: BackOfficeSection;
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

export function BackOfficeHeader({
  activeSection,
  userName = "Back Office User",
  userRole = "Operator",
}: BackOfficeHeaderProps) {
  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-24 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-primary"
            >
              <Menu size={24} strokeWidth={2.25} />
            </div>

            <div className="hidden min-w-0 items-center gap-4 sm:flex">
              <div className="border-l-2 border-primary pl-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/45">
                  Welcome
                </p>

                <p className="truncate text-sm font-semibold text-ink">
                  {userName}
                </p>
              </div>

              <div className="border-l border-border pl-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/45">
                  Profile
                </p>

                <p className="text-sm font-semibold text-ink">{userRole}</p>
              </div>
            </div>
          </div>

          <Link
            href="/shipments"
            aria-label="Parcel Shipping home"
            className="flex items-center gap-2 text-primary"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
              <PackageCheck size={23} strokeWidth={2.2} />
            </span>

            <span className="hidden text-lg font-bold tracking-tight sm:block">
              Parcel Shipping
            </span>
          </Link>

          <div className="justify-self-end">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-secondary">
              {userInitial}
            </span>
          </div>
        </div>

        <nav
          aria-label="Primary navigation"
          className="overflow-x-auto border-t border-primary/20 py-2"
        >
          <div className="flex min-w-max items-center gap-1 rounded-lg border border-secondary bg-secondary/25 p-1">
            {navigationItems.map((item) => {
              const isActive = item.key === activeSection;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-secondary shadow-sm"
                      : "text-ink/65 hover:bg-surface hover:text-primary",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}