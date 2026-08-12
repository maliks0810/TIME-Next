import { normalizeReportUrl } from "./common";

const REPORT_PARAMS = 'rs:Command=Render&rc:Parameters=true&rs:Embed=true';

export const buildReportIframeUrl = (rawLink: string | null): string | null => {
  if (!rawLink) return null;

  try {
    const normalized = normalizeReportUrl(rawLink);
    const url = new URL(normalized);
    if (url.hostname.includes('rpt'))
      url.search = REPORT_PARAMS;

    return url.toString();
  } catch (err) {
    console.error(err + ' Invalid report URL:', rawLink);
    return null;
  }
};


export function extractHref(maybeHtmlOrUrl: string | null | undefined): string | null {
  if (!maybeHtmlOrUrl) return null;

  const raw = maybeHtmlOrUrl.trim();

  // If REPORTLINK is an anchor tag HTML, extract href. Otherwise treat as URL.
  const hrefMatch =
    raw.match(/href\s*=\s*"([^"]+)"/i) ||
    raw.match(/href\s*=\s*'([^']+)'/i);

  const href = hrefMatch?.[1] ?? raw;

  return href
    .replace(/&amp;/g, "&")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .trim();
}

export function getExternalReportUrl(rawLink: string | null | undefined): string | null {
  return extractHref(rawLink);
}