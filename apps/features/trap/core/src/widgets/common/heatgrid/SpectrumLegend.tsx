import {
  DEFAULT_MISSING_COLOR,
  DEFAULT_OUTLIER_COLOR,
  rampGradient,
  type HeatRamp,
} from './types';

/**
 * Continuous spectrum legend for the Heat Map Grid — a gradient bar between two
 * endpoint labels, with optional outlier and no-data swatches. Renders straight
 * from the ramp + configured state colors so it always matches the cells; no
 * colors are hardcoded here (defaults fall back to DEFAULT_*_COLOR).
 */
export function SpectrumLegend({
  ramp,
  lowLabel,
  highLabel,
  showOutlier = false,
  showNoData = false,
  outlierColor = DEFAULT_OUTLIER_COLOR,
  missingColor = DEFAULT_MISSING_COLOR,
}: {
  ramp: HeatRamp;
  lowLabel: string;
  highLabel: string;
  showOutlier?: boolean;
  showNoData?: boolean;
  outlierColor?: string;
  missingColor?: string;
}) {
  return (
    <span className="hg-spectrum" aria-hidden="true">
      <span className="hg-spec-label">{lowLabel}</span>
      <span className="hg-spec-bar" style={{ backgroundImage: rampGradient(ramp) }} />
      <span className="hg-spec-label">{highLabel}</span>
      {showOutlier && (
        <span className="hg-spec-sw">
          <i style={{ background: outlierColor }} />
          Outlier
        </span>
      )}
      {showNoData && (
        <span className="hg-spec-sw">
          <i style={{ background: missingColor }} />
          No data
        </span>
      )}
    </span>
  );
}
