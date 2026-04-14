const dateTimeNYTimeZoneFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_york",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
});

export const toISODateString = (dt: Date): string => {
    const date = castToDate(dt);
    return date.toISOString().slice(0, 10);
}

export const toLocalDateTimeString = (dt: Date): string => {
    const date = castToDate(dt);
    return date.toLocaleDateString();
}

/**
 * Converts the specified data to the date time string using the specified formatter.
 * @param dt The date to convert.
 * @param formatter The formatter (by default it is "America/New_york" time zone )
 * @returns 
 */
export const toDateTimeString = (dt: Date, formatter: Intl.DateTimeFormat = dateTimeNYTimeZoneFormat): string => {
    const date = castToDate(dt);
    return formatter.format(date);
}

const castToDate = (dt: Date): Date => {
    return dt instanceof Date ? dt : new Date(dt);
}