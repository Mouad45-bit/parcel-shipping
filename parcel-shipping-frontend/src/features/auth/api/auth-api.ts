import type {
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/types/auth";

type AuthenticationErrorResponse = {
  message?: string;
};

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

function resolveErrorMessage(
  responseBody: unknown,
  status: number,
): string {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "message" in responseBody
  ) {
    const errorResponse =
      responseBody as AuthenticationErrorResponse;

    if (errorResponse.message) {
      return errorResponse.message;
    }
  }

  if (status === 401) {
    return "Invalid username or password.";
  }

  if (status === 403) {
    return "You are not allowed to access this back office.";
  }

  if (status === 503) {
    return "The authentication service is currently unavailable.";
  }

  return "Unable to sign in. Please try again.";
}

export async function login(
  credentials: LoginCredentials,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    cache: "no-store",
    signal,
  });

  const contentType = response.headers.get("content-type") ?? "";

  const responseBody: unknown = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new AuthenticationError(
      resolveErrorMessage(responseBody, response.status),
      response.status,
    );
  }

  if (
    typeof responseBody !== "object" ||
    responseBody === null ||
    !("user" in responseBody)
  ) {
    throw new AuthenticationError(
      "The authentication service returned an invalid response.",
      500,
    );
  }

  return responseBody as LoginResponse;
}
