export const GRAPHQL_URL = import.meta.env.VITE_APP_GRAPHQL_URL;

// Optional defaults (leave blank to select from Templates list at runtime)
export const DEFAULT_TEMPLATE_VERSION_ID = import.meta.env.VITE_DEFAULT_TEMPLATE_VERSION_ID ?? '';
export const DEFAULT_LANDING_TEMPLATE_VERSION_ID =
    import.meta.env.VITE_LANDING_TEMPLATE_VERSION_ID ?? DEFAULT_TEMPLATE_VERSION_ID;
