export type AttribSectionSpan = "half" | "full";

export type AttribSectionId =
  | "attribGrid"
  | "attribChart"
  | "compareGrid"
  | "compositeSummary"
  | "compositeAttribution"
  | "compositeContribution"
  | "compositeGrid";

const ORDER_KEY = "attribution-workspace-order-v1";
const SPAN_KEY = "attribution-workspace-spans-v1";
const COLLAPSED_KEY = "attribution-workspace-collapsed-v1";

export const attribSectionIds: AttribSectionId[] = [
  "attribGrid",
  "attribChart",
  "compareGrid",
  "compositeSummary",
  "compositeAttribution",
  "compositeContribution",
  "compositeGrid",
];

export const attribSectionLabels: Record<AttribSectionId, string> = {
  attribGrid: "Attribution Result",
  attribChart: "Performance Overview",
  compareGrid: "Period Comparison",
  compositeSummary: "Performance Summary",
  compositeAttribution: "Attribution Chart",
  compositeContribution: "Contribution to Return",
  compositeGrid: "Composite Attribution Result",
};

export const attribSectionDescriptions: Record<AttribSectionId, string> = {
  attribGrid: "Detailed attribution rows for the selected period",
  attribChart: "Attribution effects and drivers by security group",
  compareGrid: "Side-by-side comparison across two periods",
  compositeSummary: "Cumulative performance across selected periods",
  compositeAttribution: "Attribution matrix in bps by period",
  compositeContribution: "Contribution to total return by period",
  compositeGrid: "Composite breakdown grid",
};

export type AttribCollapsedState = Record<AttribSectionId, boolean>;
export type AttribSpanState = Record<AttribSectionId, AttribSectionSpan>;

export const defaultAttribCollapsedState: AttribCollapsedState = {
  attribGrid: false,
  attribChart: false,
  compareGrid: false,
  compositeSummary: false,
  compositeAttribution: false,
  compositeContribution: false,
  compositeGrid: false,
};

export const defaultAttribSpanState: AttribSpanState = {
  attribGrid: "full",
  attribChart: "full",
  compareGrid: "full",
  compositeSummary: "full",
  compositeAttribution: "half",
  compositeContribution: "half",
  compositeGrid: "full",
};

export const defaultAttribOrder: AttribSectionId[] = [...attribSectionIds];

export function loadAttribOrder(): AttribSectionId[] {
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
    if (!raw) return defaultAttribOrder;
    const parsed = JSON.parse(raw) as AttribSectionId[];
    const valid = parsed.filter((id) => attribSectionIds.includes(id));
    const missing = defaultAttribOrder.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return defaultAttribOrder;
  }
}

export function persistAttribOrder(order: AttribSectionId[]): void {
  window.localStorage.setItem(ORDER_KEY, JSON.stringify(order));
}

export function loadAttribSpans(): AttribSpanState {
  try {
    const raw = window.localStorage.getItem(SPAN_KEY);
    if (!raw) return defaultAttribSpanState;
    return {
      ...defaultAttribSpanState,
      ...(JSON.parse(raw) as Partial<AttribSpanState>),
    };
  } catch {
    return defaultAttribSpanState;
  }
}

export function persistAttribSpans(state: AttribSpanState): void {
  window.localStorage.setItem(SPAN_KEY, JSON.stringify(state));
}

export function loadAttribCollapsed(): AttribCollapsedState {
  try {
    const raw = window.localStorage.getItem(COLLAPSED_KEY);
    if (!raw) return defaultAttribCollapsedState;
    return {
      ...defaultAttribCollapsedState,
      ...(JSON.parse(raw) as Partial<AttribCollapsedState>),
    };
  } catch {
    return defaultAttribCollapsedState;
  }
}

export function persistAttribCollapsed(state: AttribCollapsedState): void {
  window.localStorage.setItem(COLLAPSED_KEY, JSON.stringify(state));
}