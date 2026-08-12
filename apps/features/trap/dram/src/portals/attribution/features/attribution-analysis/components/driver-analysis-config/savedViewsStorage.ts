import type { DriverAnalysisFormState } from "./driverTypes";
import type { DriverColumnConfigState } from "./columnConfigTypes";
import type { DriverGridViewMode } from "./DriverResultsPanel";

export interface DriverSavedView {
  id: string;
  name: string;
  description?: string;
  formState: DriverAnalysisFormState;
  columnConfig: DriverColumnConfigState;
  gridViewMode: DriverGridViewMode;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "driver-analysis.savedViews.v1";
const FAVORITE_VIEW_STORAGE_KEY = "driver-analysis.favoriteViewId.v1";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export function loadSavedViews(): DriverSavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as DriverSavedView[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedViews(views: DriverSavedView[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}

export function loadFavoriteViewId(): string | undefined {
  try {
    return localStorage.getItem(FAVORITE_VIEW_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function persistFavoriteViewId(viewId: string | undefined) {
  try {
    if (viewId) {
      localStorage.setItem(FAVORITE_VIEW_STORAGE_KEY, viewId);
    } else {
      localStorage.removeItem(FAVORITE_VIEW_STORAGE_KEY);
    }
  } catch {
    // localStorage can be unavailable in restricted browsers.
  }
}

export function createSavedView(params: {
  name: string;
  description?: string;
  formState: DriverAnalysisFormState;
  columnConfig: DriverColumnConfigState;
  gridViewMode: DriverGridViewMode;
}): DriverSavedView {
  const now = new Date().toISOString();

  return {
    id: createId(),
    name: params.name.trim(),
    description: params.description?.trim(),
    formState: params.formState,
    columnConfig: params.columnConfig,
    gridViewMode: params.gridViewMode,
    createdAt: now,
    updatedAt: now
  };
}

export function buildDefaultSavedViewName(formState: DriverAnalysisFormState) {
  const portfolios = formState.portfolioIds?.join(", ") || formState.portfolioId;
  return `${portfolios} ${formState.periods.join("/")} ${formState.metric.label}`;
}
