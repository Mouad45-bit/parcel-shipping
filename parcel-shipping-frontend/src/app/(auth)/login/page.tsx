import type { Metadata } from "next";
import { PackageCheck } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Parcel Shipping",
  description: "Sign in to the Parcel Shipping back-office.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-8 text-ink sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <header className="border-b border-border pb-7">
          <div className="flex items-center justify-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <PackageCheck size={27} strokeWidth={2.2} />
            </span>

            <div className="text-left">
              <h1 className="text-xl font-bold tracking-tight text-primary">
                Parcel Shipping
              </h1>

              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">
                Back Office
              </p>
            </div>
          </div>
        </header>

        <div className="mt-7">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Welcome back
          </h2>

          <p className="mt-2 text-sm leading-6 text-ink/55">
            Enter your credentials to access your operational workspace.
          </p>

          <LoginForm />
        </div>

        <footer className="mt-8 border-t border-border pt-5">
          <p className="text-center text-xs font-medium text-ink/45">
            This platform is restricted to authorized users.
          </p>
        </footer>
      </section>
    </main>
  );
}
