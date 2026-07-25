export const getPeriodCode = (
  period: string | null | undefined,
): string => {
  if (!period) return "";

  const idx = period.indexOf(":");

  return (
    idx >= 0
      ? period.substring(0, idx)
      : period
  )
    .trim()
    .toUpperCase();
};

export const getCompositePeriodLabel = (
  period: {
    short_label?: string | null;
    label?: string | null;
  },
): string => {
  const source =
    period.label ||
    period.short_label ||
    "";

  return getPeriodCode(source);
};