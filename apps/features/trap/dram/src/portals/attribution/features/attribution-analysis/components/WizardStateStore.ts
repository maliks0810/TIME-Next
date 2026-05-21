import { defaultWizardState } from "../lib/defaultData";
import { WorkflowState } from "../lib/services";

const KEY = "equity-configure-workflow-state";

/**
 * Load wizard state from localStorage (safe + typed)
 */
export function getWizardState(): WorkflowState {
  const raw = localStorage.getItem(KEY);

  if (!raw) return defaultWizardState;

  try {
    const parsed = JSON.parse(raw) as Partial<WorkflowState>;

    return {
      ...defaultWizardState,
      ...parsed,

      portfolios: parsed.portfolios ?? defaultWizardState.portfolios,
      benchmarks: parsed.benchmarks ?? defaultWizardState.benchmarks,
      periods: parsed.periods ?? defaultWizardState.periods,
      metrics: parsed.metrics ?? defaultWizardState.metrics,
      detailPanels: parsed.detailPanels ?? defaultWizardState.detailPanels,
      filters: parsed.filters ?? defaultWizardState.filters,
    };
  } catch {
    return defaultWizardState;
  }
}

/**
 * Save wizard state (strictly typed, no any)
 */
export function setWizardState(value: WorkflowState): void {
  localStorage.setItem(KEY, JSON.stringify(value));
}