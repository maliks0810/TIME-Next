import type { WaterfallAuditEvent } from '../../api/waterfallApi';

export function formatAuditTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatAuditActor(value: string | null | undefined): string {
  const text = String(value ?? '').trim();
  if (!text || text === 'UNKNOWN') return 'Unknown';
  return text;
}

export function formatAuditReason(event: WaterfallAuditEvent): string {
  const reason = String(event.changeReason ?? '').trim();
  return reason || 'No reason provided';
}

export function shortRequestId(value: string | null | undefined): string {
  const text = String(value ?? '').trim();
  if (!text) return '—';
  return text.length <= 12 ? text : `${text.slice(0, 8)}…${text.slice(-4)}`;
}
