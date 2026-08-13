import type { AttribAnalysisSelectionState } from "./ConfigTabbedCompact";

export interface AttribSavedView {
  id: string;
  name: string;
  description?: string;
  state: AttribAnalysisSelectionState;
  createdAt: string;
  updatedAt: string;
}

const SAVED_VIEWS_KEY = "attribution.savedViews";
const FAVORITE_VIEW_KEY = "attribution.favoriteViewId";

function generateId(): string {
  return `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadAttribSavedViews(): AttribSavedView[] {
  try {
    const raw = localStorage.getItem(SAVED_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load attribution saved views:", error);
    return [];
  }
}

export function persistAttribSavedViews(views: AttribSavedView[]): void {
  try {
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views));
  } catch (error) {
    console.warn("Failed to persist attribution saved views:", error);
  }
}

export function loadFavoriteAttribViewId(): string | undefined {
  try {
    return localStorage.getItem(FAVORITE_VIEW_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function persistFavoriteAttribViewId(viewId: string | undefined): void {
  try {
    if (viewId) {
      localStorage.setItem(FAVORITE_VIEW_KEY, viewId);
    } else {
      localStorage.removeItem(FAVORITE_VIEW_KEY);
    }
  } catch (error) {
    console.warn("Failed to persist favorite attribution view id:", error);
  }
}

export function createAttribSavedView(input: {
  name: string;
  description?: string;
  state: AttribAnalysisSelectionState;
}): AttribSavedView {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    state: input.state,
    createdAt: now,
    updatedAt: now,
  };
}
