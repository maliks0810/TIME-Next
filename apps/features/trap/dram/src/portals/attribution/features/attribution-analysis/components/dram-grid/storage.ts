import type { PersistedGridState } from "./types";

const isBrowser = typeof window !== "undefined";

export const loadGridState = (storageKey: string): PersistedGridState | null => {
  if (!isBrowser) return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedGridState;

    return {
      order: Array.isArray(parsed.order) ? parsed.order : [],
      widths: parsed.widths ?? {},
      visibility: parsed.visibility ?? {},
    };
  } catch {
    return null;
  }
};

export const saveGridState = (
  storageKey: string,
  state: PersistedGridState
): void => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // ignore persistence failures
  }
};

export const clearGridState = (storageKey: string): void => {
  if (!isBrowser) return;

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
};