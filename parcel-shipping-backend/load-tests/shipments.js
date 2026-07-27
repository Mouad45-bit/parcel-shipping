import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("shipments_errors");

const baseUrl = __ENV.BASE_URL || "http://localhost:8080";
const client = __ENV.SHIPMENTS_CLIENT || "aasim";
const sessionCookie = __ENV.SESSION_COOKIE;

export const options = {
  scenarios: {
    shipments_load: {
      executor: "constant-vus",
      vus: 20,
      duration: "1m",
    },
  },

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
    shipments_errors: ["rate<0.01"],
  },

  tags: {
    service: "shipments-service",
  },
};

export default function () {
  if (!sessionCookie) {
    throw new Error(
      "La variable SESSION_COOKIE est obligatoire pour appeler la route protégée.",
    );
  }

  const response = http.get(
    `${baseUrl}/api/shipments?client=${encodeURIComponent(client)}` +
      "&page=0&size=10&status=all&proofOfDelivery=all",
    {
      headers: {
        Cookie: sessionCookie,
        Accept: "application/json",
      },

      tags: {
        endpoint: "list-shipments",
      },

      timeout: "10s",
    },
  );

  const success = check(response, {
    "status is 200": (result) => result.status === 200,
    "response is JSON": (result) =>
      (result.headers["Content-Type"] || "").includes("application/json"),
    "instance header exists": (result) =>
      Boolean(result.headers["X-Service-Instance"]),
  });

  errorRate.add(!success);

  sleep(1);
}
