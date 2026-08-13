export const normalizeReportUrl = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl, window.location.origin);

    // Enforce HTTPS only if configured
    if (
      import.meta.env.VITE_FORCE_HTTPS_REPORTS === 'true' &&
      url.protocol === 'http:'
    ) {
      url.protocol = 'https:';
    }

    return url.toString();
  } catch (err) {
    console.error(err+' Invalid report URL:', rawUrl);
    return rawUrl;
  }
};

