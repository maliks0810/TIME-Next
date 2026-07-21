export function buildFormulaTooltip(formula: string, equation?: string): string {
  return equation ? `Formula: ${formula}\nActual: ${equation}` : `Formula: ${formula}`;
}
