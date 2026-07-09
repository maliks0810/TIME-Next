import { ColumnHeightOutlined, VerticalAlignMiddleOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { Props } from './HeatmapWidgetBase';
import { collectGroupKeys } from '../helpers';
import { useCallback } from 'react';
type ControlsProps = Pick<
    Props,
    | 'foundation'
    | 'search'
    | 'legend'
    | 'toolbarExtras'
    | 'roots'
    | 'groupingLabels'
    | 'showLeaves'
    | 'leafLabel'
> & {
    toggleDrawer: () => void;
    setExpandedOverride: React.Dispatch<React.SetStateAction<Set<string> | null>>;
};
export const Controls = ({
    foundation,
    search,
    legend,
    toolbarExtras,
    toggleDrawer,
    groupingLabels,
    leafLabel,
    showLeaves,
    setExpandedOverride,
    roots,
}: ControlsProps) => {
    const handleClickExpand = useCallback(
        () => setExpandedOverride(new Set(collectGroupKeys(roots))),
        [roots, setExpandedOverride]
    );
    const handleClickCollapse = useCallback(
        () => setExpandedOverride(new Set()),
        [setExpandedOverride]
    );
    const condition =
        foundation.showGrouping ||
        foundation.showExpand ||
        foundation.showCollapse ||
        (foundation.showSearch && search != null) ||
        (foundation.showLegend && legend != null) ||
        toolbarExtras != null;
    if (!condition) return null;
    return (
        <div className="wg-controls">
            {foundation.showGrouping && (
                <button className="group-path" onClick={() => toggleDrawer()} title="Edit grouping">
                    {groupingLabels.length === 0 ? (
                        <span className="path-empty">No grouping</span>
                    ) : (
                        groupingLabels.map((label, i) => (
                            <span key={`${label}-${i}`} className="path-seg">
                                {i > 0 && <span className="path-sep">›</span>}
                                <span className="path-chip">{label}</span>
                            </span>
                        ))
                    )}
                    {showLeaves && groupingLabels.length > 0 && leafLabel && (
                        <span className="path-seg">
                            <span className="path-sep">›</span>
                            <span className="path-chip muted">{leafLabel}</span>
                        </span>
                    )}
                </button>
            )}
            <div className="wg-spacer" />
            {toolbarExtras}
            {foundation.showSearch && search}
            {foundation.showLegend && legend}
            {foundation.showExpand && (
                <Tooltip title="Expand all" placement="bottom">
                    <Button
                        size="small"
                        type="text"
                        icon={<ColumnHeightOutlined />}
                        onClick={handleClickExpand}
                        aria-label="Expand all"
                    />
                </Tooltip>
            )}
            {foundation.showCollapse && (
                <Tooltip title="Collapse all" placement="bottom">
                    <Button
                        size="small"
                        type="text"
                        icon={<VerticalAlignMiddleOutlined />}
                        onClick={handleClickCollapse}
                        aria-label="Collapse all"
                    />
                </Tooltip>
            )}
        </div>
    );
};
