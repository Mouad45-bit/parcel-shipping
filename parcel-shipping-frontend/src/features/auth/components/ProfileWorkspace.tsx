import {
  AtSign,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageCard } from "@/components/ui/PageCard";
import type { AuthUser } from "@/features/auth/types/auth";

type ProfileWorkspaceProps = {
  user: AuthUser;
};

type ProfileInformationRowProps = {
  icon: typeof UserRound;
  label: string;
  value: string;
};

const roleLabels: Record<AuthUser["role"], string> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
};

function ProfileInformationRow({
  icon: Icon,
  label,
  value,
}: ProfileInformationRowProps) {
  return (
    <div className="flex items-center gap-4 border-b border-border py-4 last:border-b-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/55 text-primary">
        <Icon size={19} />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
          {label}
        </p>

        <p className="mt-0.\25 truncate text-sm font-bold text-ink">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ProfileWorkspace({
  user,
}: ProfileWorkspaceProps) {
  return (
    <PageCard className="overflow-hidden">
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          My Profile
        </h1>

        <p className="mt-1.5 text-sm leading-6 text-ink/55">
          Review your account information and manage your authentication
          settings.
        </p>
      </header>

      <div className="grid gap-8 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="account-information-title">
          <div>
            <h2
              id="account-information-title"
              className="text-lg font-bold text-ink"
            >
              Account information
            </h2>

            <p className="mt-1 text-sm text-ink/55">
              Your identity and authorization details.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-border px-4 sm:px-5">
            <ProfileInformationRow
              icon={UserRound}
              label="Full name"
              value={user.name}
            />

            <ProfileInformationRow
              icon={AtSign}
              label="Username"
              value={user.username}
            />

            <ProfileInformationRow
              icon={ShieldCheck}
              label="Role"
              value={roleLabels[user.role]}
            />
          </div>
        </section>

        <section
          aria-labelledby="security-actions-title"
          className="lg:border-l lg:border-border lg:pl-8"
        >
          <div>
            <h2
              id="security-actions-title"
              className="text-lg font-bold text-ink"
            >
              Security actions
            </h2>

            <p className="mt-1 text-sm text-ink/55">
              Manage your password or end the current session.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              disabled
              aria-describedby="reset-password-availability"
              className="flex min-h-20 w-full cursor-not-allowed items-center gap-4 rounded-xl border border-border bg-surface px-5 py-3 text-left opacity-60"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-primary">
                <KeyRound size={19} />
              </span>

              <span>
                <span className="block text-sm font-bold text-ink">
                  Reset password
                </span>

                <span className="mt-0 block text-xs leading-5 text-ink/50">
                  Change your account password.
                </span>
              </span>
            </button>

            <button
              type="button"
              disabled
              aria-describedby="logout-availability"
              className="flex min-h-20 w-full cursor-not-allowed items-center gap-4 rounded-xl border border-red-200 bg-red-50/40 px-5 py-3 text-left opacity-60"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <LogOut size={19} />
              </span>

              <span>
                <span className="block text-sm font-bold text-red-700">
                  Sign out
                </span>

                <span className="mt-0 block text-xs leading-5 text-red-700/65">
                  End your current back-office session.
                </span>
              </span>
            </button>
          </div>

          <p
            id="reset-password-availability"
            className="sr-only"
          >
            Password reset will be available after the modal implementation.
          </p>

          <p
            id="logout-availability"
            className="sr-only"
          >
            Sign out will be available after the confirmation modal
            implementation.
          </p>
        </section>
      </div>
    </PageCard>
  );
}