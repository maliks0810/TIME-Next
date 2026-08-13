import { useEffect, useMemo, useState } from 'react';
import { Spin, message } from 'antd';
import {
    AnalyticsHistory,
    MergedTimelineItem,
} from './lib/types';
import AssetLookup from './AssetLookup';
import TimelineTable from './TimelineTable';
import TimelineVisual from './TimelineVisual';
import Specifications from './Specifications';

// Local map type (keyed by assetAnalyticsSetupId) built from the array response.
type HistoryMap = Record<string, AnalyticsHistory>;

interface LensPanelProps {
    refreshKey: boolean;
}

export const LensPanel = ({ refreshKey }: LensPanelProps) => {
    const [loading, setLoading] = useState(false);
    const [aladdinId, setAladdinId] = useState('');
    const [historyMap, setHistoryMap] = useState<HistoryMap>({});
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [prevIndex, setPrevIndex] = useState<number | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const availableKeys = useMemo(
        () => Object.keys(historyMap),
        [historyMap]
    );

    const handleSelect = (index: number) => {
        setSelectedIndex((curr) => {
            setPrevIndex(curr);
            return index;
        });
    };

    const mergedRows: MergedTimelineItem[] = useMemo(() => {
        const rows: MergedTimelineItem[] = [];
        availableKeys.forEach((key) => {
            const history = historyMap[key];
            if (!history?.timeline) return;
            history.timeline.forEach((row, idx) => {
                rows.push({
                    ...row,
                    sourceKey: key,
                    sourceIndex: idx,
                });
            });
        });
        rows.sort(
            (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
        );
        return rows;
    }, [historyMap, availableKeys]);

    useEffect(() => {
        if (mergedRows.length === 0) {
            setSelectedIndex(null);
            setPrevIndex(null);
            return;
        }
        setSelectedIndex(0);
        setPrevIndex(0);
    }, [mergedRows]);

    const currentRow =
        selectedIndex !== null ? mergedRows[selectedIndex] : undefined;
    const prevRow =
        prevIndex !== null ? mergedRows[prevIndex] : undefined;

    // assumptions/analytics live directly on each timeline (merged) row
    const currentAssumptions = currentRow?.assumptions ?? undefined;
    const currentAnalytics = currentRow?.analytics ?? undefined;
    const prevAssumptions = prevRow?.assumptions ?? undefined;
    const prevAnalytics = prevRow?.analytics ?? undefined;
    
    return (
        <div>   
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {contextHolder}
                <AssetLookup
                    aladdinId={aladdinId}
                    setAladdinId={setAladdinId}
                    loading={loading}
                    setLoading={setLoading}
                    setHistoryMap={setHistoryMap}
                    setSelectedIndex={setSelectedIndex}
                    setPrevIndex={setPrevIndex}
                    refreshKey={refreshKey}
                    messageApi={messageApi}
                />
            </div>
            
            {loading && <Spin />}
            {!loading && mergedRows.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    {contextHolder}
                        <div style={{ flex: 1, minWidth: 360, maxHeight: 560 }}>
                            <TimelineVisual
                                rows={mergedRows}
                                availableKeys={availableKeys}
                                selectedIndex={selectedIndex}
                                onSelect={handleSelect}
                            />
                        </div>
                        <div style={{ flex: 2, minWidth: 60, marginTop: 16 }}>
                            <TimelineTable
                                rows={mergedRows}
                                loading={loading}
                                selectedIndex={selectedIndex}
                                aladdinId={aladdinId}
                                onSelect={handleSelect}
                                messageApi={messageApi}
                            />
                        </div>
                    {selectedIndex !== null && (
                        <div style={{ marginTop: 16 }}>
                            <Specifications
                                analytics={currentAnalytics}
                                assumptions={currentAssumptions}
                                prevAnalytics={prevAnalytics}
                                prevAssumptions={prevAssumptions}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};