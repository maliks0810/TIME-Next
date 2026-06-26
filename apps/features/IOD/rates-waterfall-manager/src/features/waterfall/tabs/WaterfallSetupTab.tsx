import type { JSX } from 'react';
import { sortWaterfallBuckets } from '../model/waterfallClientResolver';
import { formatWaterfallBucketRange } from '../model/waterfallFormat';
import type { WaterfallBucket } from '../model/waterfallTypes';
import { useWaterfallManagerStore } from '../store/waterfallManagerStore';

export function WaterfallSetupTab(): JSX.Element {
  const buckets = useWaterfallManagerStore((state) => state.graph.buckets);
  const updateBucket = useWaterfallManagerStore((state) => state.updateBucket);
  const moveBucket = useWaterfallManagerStore((state) => state.moveBucket);

  const orderedBuckets = sortWaterfallBuckets(buckets);

  return (
    <section className="waterfall-card rwm-bucket-setup-card">
      <div className="rwm-bucket-setup-header">
        <div>
          <h2 className="font-tcw-bold text-sm text-grey-900">Duration Bucket Setup</h2>
          <p className="mt-2 text-[11px] text-grey-600">
            Defines duration ranges used for both portfolio duration bucket, order duration bucket and instrument tenor bucket.
          </p>
        </div>
      </div>

      <div className="rwm-bucket-grid-header rwm-bucket-grid-header--no-delete">
        <span>Order</span>
        <span>Code</span>
        <span>Label</span>
        <span>Min</span>
        <span>Max</span>
        <span>Range</span>
      </div>

      <div className="rwm-bucket-row-list">
        {orderedBuckets.map((bucket, index) => (
          <BucketRow
            key={bucket.bucketId}
            bucket={bucket}
            isFirst={index === 0}
            isLast={index === orderedBuckets.length - 1}
            onMove={moveBucket}
            onUpdate={updateBucket}
          />
        ))}
      </div>
    </section>
  );
}

function BucketRow({
  bucket,
  isFirst,
  isLast,
  onMove,
  onUpdate,
}: {
  bucket: WaterfallBucket;
  isFirst: boolean;
  isLast: boolean;
  onMove: (bucketId: number, direction: 'up' | 'down') => void;
  onUpdate: (bucketId: number, patch: Partial<WaterfallBucket>) => void;
}): JSX.Element {
  return (
    <div className="rwm-bucket-row rwm-bucket-row--no-delete">
      <div className="flex items-center gap-2 text-grey-500">
        <button type="button" disabled={isFirst} onClick={() => onMove(bucket.bucketId, 'up')} className="rwm-bucket-order-button" title="Move up">
          ↑
        </button>
        <button type="button" disabled={isLast} onClick={() => onMove(bucket.bucketId, 'down')} className="rwm-bucket-order-button" title="Move down">
          ↓
        </button>
      </div>

      <input
        value={bucket.code}
        onChange={(event) => onUpdate(bucket.bucketId, { code: event.target.value.toUpperCase() })}
        className="rwm-bucket-input"
      />
      <input
        value={bucket.label}
        onChange={(event) => onUpdate(bucket.bucketId, { label: event.target.value })}
        className="rwm-bucket-input"
      />
      <input
        type="number"
        step="0.1"
        value={bucket.minDuration ?? ''}
        onChange={(event) => onUpdate(bucket.bucketId, { minDuration: parseNullableNumber(event.target.value) })}
        className="rwm-bucket-input"
      />
      <input
        type="number"
        step="0.1"
        value={bucket.maxDuration ?? ''}
        onChange={(event) => onUpdate(bucket.bucketId, { maxDuration: parseNullableNumber(event.target.value) })}
        placeholder="Open"
        className="rwm-bucket-input"
      />

      <span className="truncate text-[12px] text-grey-600">{formatWaterfallBucketRange(bucket)}</span>
    </div>
  );
}

function parseNullableNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default WaterfallSetupTab;
