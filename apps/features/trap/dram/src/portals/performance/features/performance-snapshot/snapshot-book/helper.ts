export function formatDateOnly(
  value: string | null | undefined,
  locale = navigator.language,
): string {
  if (!value) {
    return "Not Available";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return "Not Available";
  }

  const [, yearText, monthText, dayText] = match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  /*
   * Use UTC components plus timeZone: "UTC" so the date cannot
   * shift backward or forward in any browser timezone.
   */
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);
}