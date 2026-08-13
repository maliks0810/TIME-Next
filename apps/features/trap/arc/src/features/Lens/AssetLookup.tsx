import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Card, Spin, Tooltip } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { getAnalyticsHistory } from './lib/services';
import '../../lib/styles.scss';
import { SearchBar } from './SearchBar';
import { AnalyticsHistory, AnalyticsHistoryApiResponse } from './lib/types';
import { IdSection } from './IdSection';
import { loadOptions, handleHorizontalScroll } from './lib/helper';

interface AssetLookupProps {
    aladdinId: string;
    setAladdinId: (aladdinId: string) => void;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setHistoryMap: (historyMap: Record<string, AnalyticsHistory>) => void;
    setSelectedIndex: (selectedIndex: number | null) => void;
    setPrevIndex: (prevIndex: number | null) => void;
    refreshKey: boolean;
    messageApi: MessageInstance;
}

export default function AssetLookup({
    aladdinId,
    setAladdinId,
    loading,
    setLoading,
    setHistoryMap,
    setSelectedIndex,
    setPrevIndex,
    refreshKey,
    messageApi,
}: AssetLookupProps) {
    const [Ids, setIds] = useState<{day: string[], week: string[], month: string[]}>({day: [], week: [], month: []});
    const [requestStatus, setRequestStatus] = useState('Idle');
    const [lastRequestTime, setLastRequestTime] = useState('');

    const refreshOptions = async () => {
        const loadedIds = await loadOptions(setLoading, messageApi);
        setIds(loadedIds);
    };

    const handleSearch = async (aladdinId: string) => {
        if (!aladdinId) {
            setRequestStatus('Please enter an Aladdin ID');
            return;
        }
        setAladdinId(aladdinId);
        setLoading(true);
        setHistoryMap({});
        setSelectedIndex(null);
        setPrevIndex(null);
        setRequestStatus(`Sending request for ${aladdinId}...`);
        try {
            setLastRequestTime(new Date().toLocaleString());
            const response = await getAnalyticsHistory(aladdinId);

            const payload = response.data as AnalyticsHistoryApiResponse | null;
            const histories = payload?.response ?? [];

            // Build a keyed map from the array, keyed by assetAnalyticsSetupId.
            const map: Record<string, AnalyticsHistory> = {};
            const keys: string[] = [];
            histories.forEach((history, idx) => {
                const setupId = history?.characteristics?.assetAnalyticsSetupId;
                const key =
                    setupId !== undefined && setupId !== null
                        ? String(setupId)
                        : `unknownAASID-${idx}`;
                map[key] = history;
                keys.push(key);
            });

            setHistoryMap(map);

            const timelineCount = keys.reduce(
                (sum, k) => sum + (map[k]?.timeline?.length ?? 0),
                0
            );
            setRequestStatus(
                `SUCCESS: Retrieved ${timelineCount} timeline records across ${keys.length} setup(s)`
            );
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setRequestStatus('FAILED: API request failed - ' + err.message);
            } else {
                setRequestStatus('FAILED: API request failed - ' + String(err));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshOptions();
    }, [refreshKey]);

    return (
        <Card
            size="small"
            title={
                <Tooltip title="Click to refresh list" placement='top'>
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={refreshOptions}
                    >
                        Asset Lookup
                    </span>
                </Tooltip>

            }
            bodyStyle={{
                padding: 8,
            }}
            styles={{
                header: {
                    color: '#FFFFFF',
                    background: 'linear-gradient(90deg, #013D7D 0%, rgba(105, 178, 255, 0.7) 100%)',
                }
            }}
        >
            <div
                style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}
            >
                <div
                    className='lens-main-content'
                    style={{ gap: '0.5rem', maxWidth: 300, }}
                >
                    <SearchBar
                        onSearch={handleSearch}
                        value={aladdinId}
                        onValueChange={setAladdinId}
                        messageApi={messageApi}
                    />

                    <Card
                        size="small"
                        style={{ lineHeight: 1.1, fontSize: '0.625rem', }}
                    >
                        <div>{requestStatus}</div>
                        <div>Last Request: {lastRequestTime || 'Never'}</div>
                        <div>Loading: {loading ? 'Yes' : 'No'}</div>
                    </Card>
                </div>
                
                {loading ? (
                    <Spin />
                ) : (

                    <div
                        style={{ display: 'flex', rowGap: 2, minWidth: 0 }}
                        className='lens-main-content'
                    >

                        <div
                            className='lens-id-section'
                        >
                            <div style={{ minWidth: 80 }}>
                                Last Day
                            </div>
                            <div
                                className={`lens-timeline-scroll lens-id-section-scroll-addon`}
                                onWheel={handleHorizontalScroll}
                            >
                                <IdSection
                                    ids={Ids.day}
                                    handleSearch={handleSearch}
                                />
                            </div>
                        </div>

                        <div
                            className='lens-id-section'
                        >
                            <div style={{ minWidth: 80 }}>
                                Last Week
                            </div>
                            <div
                                className={`lens-timeline-scroll lens-id-section-scroll-addon`}
                                onWheel={handleHorizontalScroll}
                            >
                                <IdSection
                                    ids={Ids.week}
                                    handleSearch={handleSearch}
                                />
                            </div>
                        </div>

                        <div
                            className='lens-id-section'
                        >
                            <div style={{ minWidth: 80 }}>
                                Last Month
                            </div>
                            <div
                                className={`lens-timeline-scroll lens-id-section-scroll-addon`}
                                onWheel={handleHorizontalScroll}
                            >
                                <IdSection
                                    ids={Ids.month}
                                    handleSearch={handleSearch}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}