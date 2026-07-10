"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  KeyRound,
  LogIn,
  UserRound,
} from "lucide-react";
import { login } from "@/features/auth/api/auth-api";
import type {
  LoginCredentials,
  LoginFormErrors,
} from "@/features/auth/types/auth";

const initialCredentials: LoginCredentials = {
  username: "",
  password: "",
};

const inputClassName =
  "h-12 w-full rounded-lg border bg-surface pl-11 pr-4 text-sm font-medium text-ink outline-none transition placeholder:text-ink/35 focus:ring-2";

function validateCredentials(credentials: LoginCredentials): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!credentials.username.trim()) {
    errors.username = "Username is required.";
  }

  if (!credentials.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function LoginForm() {
  const router = useRouter();

  const [credentials, setCredentials] =
    useState<LoginCredentials>(initialCredentials);

  const [errors, setErrors] = useState<LoginFormErrors>({});

  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateCredential(field: keyof LoginCredentials, value: string) {
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
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

    const nextErrors = validateCredentials(credentials);

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        username: credentials.username.trim(),
        password: credentials.password,
      });

      router.replace("/shipments");
      router.refresh();
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
      {submitError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <p>{submitError}</p>
        </div>
      ) : null}

      <div>
        <label htmlFor="username" className="text-sm font-semibold text-ink">
          Username
        </label>

        <div className="relative mt-2">
          <UserRound
            aria-hidden="true"
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
          />

          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={credentials.username}
            onChange={(event) =>
              updateCredential("username", event.target.value)
            }
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "username-error" : undefined}
            placeholder="Enter your username"
            className={[
              inputClassName,
              errors.username
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-border focus:border-primary focus:ring-primary/15",
            ].join(" ")}
          />
        </div>

        {errors.username ? (
          <p
            id="username-error"
            className="mt-2 text-xs font-medium text-red-600"
          >
            {errors.username}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-ink">
          Password
        </label>

        <div className="relative mt-2">
          <KeyRound
            aria-hidden="true"
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
          />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={credentials.password}
            onChange={(event) =>
              updateCredential("password", event.target.value)
            }
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="Enter your password"
            className={[
              inputClassName,
              "pr-12",
              errors.password
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-border focus:border-primary focus:ring-primary/15",
            ].join(" ")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-ink/45 transition hover:text-primary focus:outline-none focus-visible:text-primary"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {errors.password ? (
          <p
            id="password-error"
            className="mt-2 text-xs font-medium text-red-600"
          >
            {errors.password}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-secondary shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn size={18} />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}
