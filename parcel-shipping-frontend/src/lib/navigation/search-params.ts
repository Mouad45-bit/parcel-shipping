export type SearchParamValue =
  | string
  | string[]
  | undefined;

export function getSingleSearchParam(
  value: SearchParamValue,
): string | null {
  const firstValue =
    Array.isArray(value)
      ? value[0]
      : value;

  const normalizedValue =
    firstValue?.trim();

  return normalizedValue
    ? normalizedValue
    : null;
}
