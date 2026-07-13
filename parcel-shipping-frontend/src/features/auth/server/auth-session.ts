import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  AuthUser,
  CurrentUserResponse,
} from "@/features/auth/types/auth";

const backendApiBaseUrl =
  process.env.BACKEND_API_BASE_URL ??
  "http://localhost:8080";

const accessTokenCookieName =
  "parcel_access_token";

function isAuthUser(
  value: unknown,
): value is AuthUser {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate = value as Partial<AuthUser>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.username === "string" &&
    (
      candidate.role === "ADMIN" ||
      candidate.role === "OPERATOR"
    )
  );
}

function isCurrentUserResponse(
  value: unknown,
): value is CurrentUserResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("user" in value)
  ) {
    return false;
  }

  return isAuthUser(
    (value as { user: unknown }).user,
  );
}

/*
 * Récupère la session auprès du backend.
 *
 * Le résultat est mémorisé uniquement pendant le rendu
 * React actuel afin d'éviter plusieurs appels identiques
 * depuis le layout et la page.
 */
export const getOptionalCurrentUser = cache(
  async (): Promise<AuthUser | null> => {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get(
        accessTokenCookieName,
      )?.value;

    if (!accessToken) {
      return null;
    }

    let response: Response;

    try {
      response = await fetch(
        new URL(
          "/api/auth/me",
          backendApiBaseUrl,
        ),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Cookie:
              `${accessTokenCookieName}=${accessToken}`,
          },
          cache: "no-store",
        },
      );
    } catch {
      throw new Error(
        "The authentication service is unavailable.",
      );
    }

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        "Unable to verify the current session.",
      );
    }

    let responseBody: unknown;

    try {
      responseBody = await response.json();
    } catch {
      throw new Error(
        "The authentication service returned an invalid response.",
      );
    }

    if (!isCurrentUserResponse(responseBody)) {
      throw new Error(
        "The authentication service returned an invalid user.",
      );
    }

    return responseBody.user;
  },
);

export async function requireCurrentUser():
Promise<AuthUser> {
  const currentUser =
    await getOptionalCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
}
