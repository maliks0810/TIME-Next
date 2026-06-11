import { defaultWizardState } from "../lib/defaultData";
import { WorkflowState } from "../lib/services";

export const EQ_KEY = 'equity-configure-workflow-state';
export const EM_KEY = 'em-configure-workflow-state';
export const FI_KEY = 'fi-configure-workflow-state';

export function getKeyByAssetClass(assetClass: string){
  if(assetClass === 'EQ')
    return EQ_KEY;
  if(assetClass === 'EM'){
    return EM_KEY;
  }
  if(assetClass === 'FI'){
    return FI_KEY;
  }
  return '';
}
/**
 * Load wizard state from localStorage (safe + typed)
 */
export function getWizardState(key: string): WorkflowState {
  const raw = localStorage.getItem(key);

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
export function setWizardState(value: WorkflowState, key: string): void {
  console.log(JSON.stringify(value));
  localStorage.setItem(key, JSON.stringify(value));
}