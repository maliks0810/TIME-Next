export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: string; title: string }[]
): string {
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return '';

    const str =
      value instanceof Date
        ? value.toISOString()
        : typeof value === 'boolean'
        ? value ? 'TRUE' : 'FALSE'
        : String(value);

    const escaped = str.replace(/"/g, '""');
    return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const header = columns.map(c => escape(c.title)).join(',');

  const body = rows
    .map(row =>
      columns
        .map(c => escape(row[c.key as keyof T])) //  safe cast here
        .join(',')
    )
    .join('\r\n');

  return `${header}\r\n${body}`;
}

export function downloadCsv(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a: HTMLAnchorElement = document.createElement('a');
  a.href = url;
  a.download = filename;

  // Required for Firefox / strict DOM environments
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}