"use client";

import { type FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  AuthenticationError,
  changePassword,
} from "@/features/auth/api/auth-api";
import type {
  ResetPasswordFormErrors,
  ResetPasswordFormValues,
} from "@/features/auth/types/auth";
import { useRouter } from "next/navigation";

type ResetPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type PasswordFieldProps = {
  id: keyof ResetPasswordFormValues;
  label: string;
  placeholder: string;
  autoComplete: string;
  value: string;
  error?: string;
  isVisible: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
};

const initialValues: ResetPasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function validatePasswordForm(
  values: ResetPasswordFormValues,
): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "New password must contain at least 8 characters.";
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword =
      "New password must be different from the current password.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Password confirmation is required.";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "The password confirmation does not match.";
  }

  return errors;
}

function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  value,
  error,
  isVisible,
  autoFocus = false,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>

      <div className="relative mt-2">
        <KeyRound
          aria-hidden="true"
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
        />

        <input
          id={id}
          name={id}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          data-autofocus={autoFocus ? "" : undefined}
          className={[
            "h-11 w-full rounded-lg border bg-surface pl-11 pr-12 text-sm font-medium text-ink outline-none transition placeholder:text-ink/35 focus:ring-2",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-border focus:border-primary focus:ring-primary/15",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={
            isVisible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-ink/45 transition hover:text-primary focus:outline-none focus-visible:text-primary"
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ResetPasswordModal({
  isOpen,
  onClose,
}: ResetPasswordModalProps) {
  const router = useRouter();

  const [values, setValues] = useState<ResetPasswordFormValues>(initialValues);

  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});

  const [visibleField, setVisibleField] = useState<
    keyof ResetPasswordFormValues | null
  >(null);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccessful, setIsSuccessful] = useState(false);

  function resetModalState() {
    setValues(initialValues);
    setErrors({});
    setVisibleField(null);
    setSubmitError(null);
    setIsSuccessful(false);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetModalState();
    onClose();
  }

  function updateValue(field: keyof ResetPasswordFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));

    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validatePasswordForm(values);

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setIsSuccessful(true);
    } catch (error: unknown) {
      if (error instanceof AuthenticationError && error.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to update your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Reset password"
      description="Enter your current password and choose a new secure password."
      onClose={handleClose}
    >
      {isSuccessful ? (
        <div className="px-5 py-6 sm:px-6">
          <div
            role="status"
            className="flex items-start gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <CheckCircle2 size={21} />
            </span>

            <div>
              <p className="text-sm font-bold text-green-800">
                Password updated
              </p>

              <p className="mt-1 text-sm leading-6 text-green-700">
                Your account password has been changed successfully.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              data-autofocus
              onClick={handleClose}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-secondary transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 px-5 py-6 sm:px-6">
            {submitError ? (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />

                <p>{submitError}</p>
              </div>
            ) : null}

            <PasswordField
              id="currentPassword"
              label="Current password"
              placeholder="Enter your current password"
              autoComplete="current-password"
              value={values.currentPassword}
              error={errors.currentPassword}
              isVisible={visibleField === "currentPassword"}
              autoFocus
              onChange={(value) => updateValue("currentPassword", value)}
              onToggleVisibility={() =>
                setVisibleField((currentField) =>
                  currentField === "currentPassword" ? null : "currentPassword",
                )
              }
            />

            <PasswordField
              id="newPassword"
              label="New password"
              placeholder="Enter your new password"
              autoComplete="new-password"
              value={values.newPassword}
              error={errors.newPassword}
              isVisible={visibleField === "newPassword"}
              onChange={(value) => updateValue("newPassword", value)}
              onToggleVisibility={() =>
                setVisibleField((currentField) =>
                  currentField === "newPassword" ? null : "newPassword",
                )
              }
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              value={values.confirmPassword}
              error={errors.confirmPassword}
              isVisible={visibleField === "confirmPassword"}
              onChange={(value) => updateValue("confirmPassword", value)}
              onToggleVisibility={() =>
                setVisibleField((currentField) =>
                  currentField === "confirmPassword" ? null : "confirmPassword",
                )
              }
            />
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-bold text-ink/65 transition hover:bg-secondary/25 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:pointer-events-none disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-secondary transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? <>Updating...</> : <>Update password</>}
            </button>
          </footer>
        </form>
      )}
    </Modal>
  );
}
