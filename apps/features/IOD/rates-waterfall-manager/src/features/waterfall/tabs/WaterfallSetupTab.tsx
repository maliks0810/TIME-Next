import type { CSSProperties, JSX } from 'react';
import { sortWaterfallBuckets } from '../model/waterfallClientResolver';
import { formatWaterfallBucketRange } from '../model/waterfallFormat';
import type { WaterfallBucket } from '../model/waterfallTypes';
import { useWaterfallManagerStore } from '../store/waterfallManagerStore';

const BUCKET_GRID_TEMPLATE = '52px 104px 180px 72px 72px minmax(190px, 1fr)';
const bucketGridStyle: CSSProperties = { gridTemplateColumns: BUCKET_GRID_TEMPLATE };
const orderHeaderStyle: CSSProperties = { textAlign: 'right' };
const inputHeaderStyle: CSSProperties = { paddingLeft: 8 };

export function WaterfallSetupTab(): JSX.Element {
  const buckets = useWaterfallManagerStore((state) => state.graph.buckets);
  const orderedBuckets = sortWaterfallBuckets(buckets);

  return (
    <section className="waterfall-card rwm-bucket-setup-card rwm-bucket-setup-card--readonly">
      <div className="rwm-bucket-setup-header rwm-section-header-compact">
        <div>
          <h2 className="rwm-section-heading">DURATION BUCKET SETUP</h2>
          <p className="rwm-section-subtitle rwm-section-subtitle--wide">
            Defines duration ranges used for both portfolio duration bucket, order duration bucket and instrument tenor bucket.
          </p>
        </div>
      </div>

      <div className="rwm-bucket-table-compact" aria-label="Read-only duration buckets">
        <div className="rwm-bucket-grid-header rwm-bucket-grid-header--readonly" style={bucketGridStyle}>
          <span style={orderHeaderStyle}>Order</span>
          <span style={inputHeaderStyle}>Code</span>
          <span style={inputHeaderStyle}>Label</span>
          <span style={inputHeaderStyle}>Min</span>
          <span style={inputHeaderStyle}>Max</span>
          <span>Range</span>
        </div>

        <div className="rwm-bucket-row-list rwm-bucket-row-list--readonly">
          {orderedBuckets.map((bucket, index) => (
            <BucketRow key={bucket.bucketId} bucket={bucket} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BucketRow({ bucket, index }: { bucket: WaterfallBucket; index: number }): JSX.Element {
  return (
    <div className="rwm-bucket-row rwm-bucket-row--readonly" style={bucketGridStyle}>
      <span className="rwm-bucket-readonly-order">{index + 1}</span>
      <input value={bucket.code} readOnly aria-readonly="true" className="rwm-bucket-input rwm-bucket-input--readonly" />
      <input value={bucket.label} readOnly aria-readonly="true" className="rwm-bucket-input rwm-bucket-input--readonly" />
      <input
        type="number"
        value={bucket.minDuration ?? ''}
        readOnly
        aria-readonly="true"
        className="rwm-bucket-input rwm-bucket-input--readonly"
      />
      <input
        type="number"
        value={bucket.maxDuration ?? ''}
        readOnly
        aria-readonly="true"
        placeholder="Open"
        className="rwm-bucket-input rwm-bucket-input--readonly"
      />
      <span className="rwm-bucket-range-value">{formatWaterfallBucketRange(bucket)}</span>
    </div>
  );
}

export default WaterfallSetupTab;
