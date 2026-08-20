export function dateOnly(value: string | null | undefined): string | null {
  return value ? String(value).slice(0, 10) : null;
}

export function chip(tMinus: number): string {
  return tMinus === 0 ? "T" : `T-${tMinus}`;
}

export function includedEventTMinus(comparisonTMinus: number): number[] {
  return Array.from(
    { length: Math.max(0, comparisonTMinus) },
    (_, index) => index,
  );
}

export function includedPositionTMinus(comparisonTMinus: number): number[] {
  return Array.from(
    { length: Math.max(0, comparisonTMinus) + 1 },
    (_, index) => index,
  );
}
