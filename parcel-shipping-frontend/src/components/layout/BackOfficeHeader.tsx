import Link from "next/link";
import {
  Menu,
  PackageCheck,
} from "lucide-react";
import {
  BackOfficeNavigation,
  type BackOfficeSection,
} from "@/components/layout/BackOfficeNavigation";
import { userRoleLabels } from "@/features/auth/constants/user-role-labels";
import type { AuthUser } from "@/features/auth/types/auth";

type BackOfficeHeaderProps = {
  activeSection: BackOfficeSection;
  user: AuthUser;
};

export function BackOfficeHeader({
  activeSection,
  user,
}: BackOfficeHeaderProps) {
  const userInitial =
    user.name.trim().charAt(0).toUpperCase() || "U";

  const userRole =
    userRoleLabels[user.role];

  const isProfileActive =
    activeSection === "profile";

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-24 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-primary"
            >
              <Menu
                size={24}
                strokeWidth={2.25}
              />
            </div>

            <div className="hidden min-w-0 items-center gap-4 sm:flex">
              <div className="border-l-2 border-primary pl-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/45">
                  Welcome
                </p>

                <p className="truncate text-sm font-semibold text-ink">
                  {user.name}
                </p>
              </div>

              <div className="border-l border-border pl-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/45">
                  Profile
                </p>

                <p className="text-sm font-semibold text-ink">
                  {userRole}
                </p>
              </div>
            </div>
          </div>

          <div
            aria-label="Parcel Shipping"
            className="flex items-center gap-2 text-primary"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
              <PackageCheck
                size={23}
                strokeWidth={2.2}
              />
            </span>

            <span className="hidden text-xl font-black uppercase tracking-wide sm:block">
              PARCEL SHIPPING
            </span>
          </div>

          <div className="justify-self-end">
            <Link
              href="/profile"
              aria-label={`Open ${user.name} profile`}
              aria-current={
                isProfileActive
                  ? "page"
                  : undefined
              }
              className={[
                "flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-secondary transition",
                "hover:scale-105 hover:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isProfileActive
                  ? "ring-2 ring-primary ring-offset-2"
                  : "",
              ].join(" ")}
            >
              {userInitial}
            </Link>
          </div>
        </div>

        <BackOfficeNavigation activeSection={activeSection} />
      </div>
    </header>
  );
}
