import type {
  ChangePasswordRequest,
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

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resolveErrorMessage(
  responseBody: unknown,
  status: number,
  fallbackMessage: string,
  unauthorizedMessage: string,
): string {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "message" in responseBody
  ) {
    const errorResponse =
      responseBody as AuthenticationErrorResponse;

    if (
      typeof errorResponse.message === "string" &&
      errorResponse.message.trim()
    ) {
      return errorResponse.message;
    }
  }

  if (status === 401) {
    return unauthorizedMessage;
  }

  if (status === 403) {
    return "You are not allowed to perform this action.";
  }

  if (status === 503) {
    return "The authentication service is currently unavailable.";
  }

  return fallbackMessage;
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

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new AuthenticationError(
      resolveErrorMessage(
        responseBody,
        response.status,
        "Unable to sign in. Please try again.",
        "Invalid username or password.",
      ),
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

export async function changePassword(
  request: ChangePasswordRequest,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch("/api/auth/password", {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    cache: "no-store",
    signal,
  });

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new AuthenticationError(
      resolveErrorMessage(
        responseBody,
        response.status,
        "Unable to update your password. Please try again.",
        "Your current password is incorrect or your session has expired.",
      ),
      response.status,
    );
  }
}

export async function logout(
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new AuthenticationError(
      resolveErrorMessage(
        responseBody,
        response.status,
        "Unable to sign out. Please try again.",
        "Your session has already expired.",
      ),
      response.status,
    );
  }
}
