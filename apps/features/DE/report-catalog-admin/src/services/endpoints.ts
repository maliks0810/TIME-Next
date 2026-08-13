const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/delta/v1/api"

export const BASE_API = BASE_URL
export const REPORT_CATALOG_BASE = `${BASE_URL}/catalog`
export const REPORT_ADMIN_CATALOG_BASE = `${BASE_URL}/catalog/reports`
export const USER_FAVOURITE_BASE = `${BASE_URL}/favourites`