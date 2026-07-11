"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  TriangleAlert
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { logout } from "@/features/auth/api/auth-api";

type LogoutConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LogoutConfirmationModal({
  isOpen,
  onClose,
}: LogoutConfirmationModalProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    onClose();
  }

  async function handleLogout() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await logout();

      router.replace("/login");
      router.refresh();
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again.",
      );

      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Sign out"
      description="Confirm that you want to end your current back-office session."
      onClose={handleClose}
    >
      <div className="px-5 py-6 sm:px-6">
        <div className="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50/60 px-4 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <TriangleAlert size={21} />
          </span>

          <div>
            <p className="text-sm font-bold text-red-800">
              Your session will be closed
            </p>

            <p className="mt-1 text-sm leading-6 text-red-700/80">
              You will need to enter your credentials again to
              access the Parcel Shipping back-office.
            </p>
          </div>
        </div>

        {submitError ? (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{submitError}</p>
          </div>
        ) : null}
      </div>

      <footer className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          data-autofocus
          onClick={handleClose}
          disabled={isSubmitting}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-bold text-ink/65 transition hover:bg-secondary/25 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isSubmitting}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-700 px-5 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              Signing out...
            </>
          ) : (
            <>
              Sign out
            </>
          )}
        </button>
      </footer>
    </Modal>
  );
}
