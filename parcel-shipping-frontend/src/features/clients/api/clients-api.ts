import type { Client } from "@/features/clients/types/client";

type ClientListResponse = {
  items: Client[];
};

type ClientApiErrorResponse = {
  status?: number;
  code?: string;
  message?: string;
};

export class ClientApiError
  extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

async function readApiError(
  response: Response,
): Promise<ClientApiErrorResponse | null> {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    return null;
  }

  try {
    return await response.json() as
      ClientApiErrorResponse;
  } catch {
    return null;
  }
}

export async function fetchClients(
  signal?: AbortSignal,
): Promise<Client[]> {
  const response = await fetch(
    "/api/shipments/clients",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const error =
      await readApiError(response);

    throw new ClientApiError(
      error?.message ??
        "Unable to load clients.",
      response.status,
      error?.code,
    );
  }

  const responseBody =
    await response.json() as
      ClientListResponse;

  return responseBody.items;
}
