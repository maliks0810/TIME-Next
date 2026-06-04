export const safeText = (v?: string) => (v && v.trim().length ? v : '—');
export const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '—');

export const tryIsoDiffMs = (start?: string, end?: string) => {
  if (!start || !end) return undefined;
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (Number.isNaN(s) || Number.isNaN(e)) return undefined;
  return Math.max(0, e - s);
};

export const msToHuman = (ms?: number) => {
  if (ms === undefined) return '—';
  if (ms < 1000) return `${ms} ms`;
  const sec = ms / 1000;
  if (sec < 60) return `${sec.toFixed(1)} s`;
  const min = sec / 60;
  if (min < 60) return `${min.toFixed(1)} min`;
  const hr = min / 60;
  return `${hr.toFixed(1)} hr`;
};

export function downloadFromUrl(url: string, filename?: string) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
