export const trackingCodeMaximumLength =
  40;

export function normalizeTrackingCode(
  value: string,
): string {
  return value
    .trim()
    .toUpperCase();
}

export function validateTrackingCode(
  value: string,
): string | null {
  const normalizedValue =
    normalizeTrackingCode(value);

  if (!normalizedValue) {
    return "Tracking code is required.";
  }

  if (
    normalizedValue.length >
    trackingCodeMaximumLength
  ) {
    return `Tracking code must not exceed ${trackingCodeMaximumLength} characters.`;
  }

  return null;
}
