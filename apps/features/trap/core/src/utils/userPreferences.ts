const LANDING_TEMPLATE_KEY = 'trap-default-landing-template';
const LANDING_VERSION_KEY = 'trap-default-landing-version';
const THEME_KEY = 'trap-theme';
const LANDING_TOUR_SEEN_KEY = 'trap-landing-tour-seen';

export function getDefaultLandingTemplate() {
    if (typeof window === 'undefined') return null;

    return {
        templateId: localStorage.getItem(LANDING_TEMPLATE_KEY),
        versionId: localStorage.getItem(LANDING_VERSION_KEY),
    };
}

export function setDefaultLandingTemplate(templateId: string, versionId: string) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(LANDING_TEMPLATE_KEY, templateId);
    localStorage.setItem(LANDING_VERSION_KEY, versionId);
}

export function clearDefaultLandingTemplate() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(LANDING_TEMPLATE_KEY);
    localStorage.removeItem(LANDING_VERSION_KEY);
}

export function getThemePreference() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(THEME_KEY);
}

export function setThemePreference(themeName: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_KEY, themeName);
}

export function clearThemePreference() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(THEME_KEY);
}

export function getLandingTourSeen() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(LANDING_TOUR_SEEN_KEY) === 'true';
}

export function setLandingTourSeen(seen: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LANDING_TOUR_SEEN_KEY, String(seen));
}

export function clearLandingTourSeen() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LANDING_TOUR_SEEN_KEY);
}
