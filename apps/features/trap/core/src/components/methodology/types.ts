export type WidgetMethodologyFormula = {
    numerator: string;
    denominator?: string;
    multiplier?: string;
};

export type WidgetMethodology = {
    title: string;
    definition: string;
    formula?: WidgetMethodologyFormula;
    sourceFields?: string[];
    weighting?: string;
    filterBehavior?: string;
    filterAware?: boolean;
};