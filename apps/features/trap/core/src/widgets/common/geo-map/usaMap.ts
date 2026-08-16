/* eslint-disable @typescript-eslint/no-explicit-any */
import * as echarts from 'echarts';
import usaGeo from './utils/USA.json';

/**
 * USA GeoJSON registration for ECharts map series.
 * -------------------------------------------------
 * ECharts 5 ships NO bundled maps — `series: [{ type:'map', map:'USA' }]`
 * renders nothing until the GeoJSON is registered via
 * `echarts.registerMap('USA', geoJson)`. The GeoJSON is bundled locally at
 * `./utils/USA.json` (no runtime fetch, no path config). Region
 * `properties.name` must be full state names ("California", "Texas") — that is
 * what the executor emits as each data item's `name`.
 *
 * NOTE: `utils/USA.json` is a PLACEHOLDER (empty FeatureCollection). Replace it
 * with the real US-states GeoJSON — the import path stays the same. That GeoJSON
 * MUST include Alaska, Hawaii, and (optionally) Puerto Rico as features; the
 * insets below can only reposition features that exist in the data.
 */

/**
 * specialAreas: relocate + scale outlying regions into bottom-left insets so raw
 * lat/long GeoJSON doesn't draw Alaska at true (enormous) scale over the map.
 * Keys must match the GeoJSON `properties.name` (full names). Regions absent from
 * the GeoJSON are simply ignored — no error.
 */
const SPECIAL_AREAS = {
    Alaska: { left: -131, top: 25, width: 15 },
    Hawaii: { left: -110, top: 28, width: 5 },
    'Puerto Rico': { left: -76, top: 26, width: 2 },
};

let registered = false;

/** Register the bundled USA map once (idempotent, synchronous). */
export function ensureUsaMap(): void {
    if (registered) return;
    echarts.registerMap('USA', usaGeo as any, SPECIAL_AREAS as any);
    registered = true;
}