import type { WaterfallBucket } from './waterfallTypes';

export function formatWaterfallBucketRange(bucket: WaterfallBucket): string {
  const min = bucket.minDuration == null ? '−∞' : formatDurationValue(bucket.minDuration);
  if (bucket.maxDuration == null) return `duration >= ${min}`;
  return `${min} <= duration < ${formatDurationValue(bucket.maxDuration)}`;
}

function formatDurationValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}
