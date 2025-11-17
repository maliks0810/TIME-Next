export const NoTrailingForwardSlash = (url?: string): string | undefined => {

    if (!url) {
        return url;
    }

    url = url.trim();

    if (url.endsWith('/')) {
        return url.slice(0, -1);
    }

    return url;

}