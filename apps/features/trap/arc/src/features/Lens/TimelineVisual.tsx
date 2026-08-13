import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Card, Empty } from 'antd';
import KeySelector from './KeySelector';
import { MergedTimelineItem } from './lib/types';
import { formatTimelineTime, formatTimelineDate, handleHorizontalScroll, handleArrowNavigation } from './lib/helper';
import '../../lib/styles.scss';
import { Renew, Cancel, Success, Forward, Download, Edit } from '../../shared/icons/index';

interface TimelineVisualProps {
    rows: MergedTimelineItem[];
    availableKeys: string[];
    selectedIndex?: number | null;
    onSelect?: (index: number) => void;
}

type EventAppearance = {
    className: string;
    symbol: string;
    label: string;
};

function getEventAppearance(action?: string): EventAppearance {
    const normalizedAction = (action ?? '').toLowerCase();

    if (
        normalizedAction.includes('re-')
    ) {
        return {
            className: 'lens-timeline-event-reattempt',
            symbol: Renew,
            label: 'Reattempt'
        }
    }

    else if (
        normalizedAction.includes('abandon') ||
        normalizedAction.includes('invalid')
    ) {
        return {
            className: 'lens-timeline-event-danger',
            symbol: Cancel,
            label: 'Stopped',
        };
    }

    else if (
        normalizedAction.includes('received') ||
        normalizedAction.includes('verified') ||
        normalizedAction.includes('tdc')
    ) {
        return {
            className: 'lens-timeline-event-success',
            symbol: Success,
            label: 'Output',
        };
    }

    else if (
        normalizedAction.includes('update') ||
        normalizedAction.includes('override') ||
        normalizedAction.includes('applied') ||
        normalizedAction.includes('manual')
    ) {
        return {
            className: 'lens-timeline-event-change',
            symbol: Edit,
            label: 'Change',
        };
    }

    else if (
        normalizedAction.includes('claim')
    ) {
        return {
            className: 'lens-timeline-event-claimed',
            symbol: Download,
            label: 'Claimed',
        };
    }

    else {
        return {
            className: 'lens-timeline-event-progress',
            symbol: Forward,
            label: 'Process',
        };
    }
}

export default function TimelineVisual({
    rows,
    availableKeys,
    selectedIndex,
    onSelect,
}: TimelineVisualProps) {
    const [activeKey, setActiveKey] = useState<string>(
        availableKeys[0] ?? ''
    );

    const lastSyncedIndexRef = useRef<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<
        Record<number, HTMLButtonElement | null>
    >({});

    const [timelineWidth, setTimelineWidth] = useState(0);

    useEffect(() => {
        if (!scrollContainerRef.current) {
            return;
        }

        const observer = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            setTimelineWidth(width);
        });

        observer.observe(scrollContainerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (availableKeys.length === 0) {
            setActiveKey('');
            return;
        }

        if (!availableKeys.includes(activeKey)) {
            setActiveKey(availableKeys[0]);
        }
    }, [availableKeys, activeKey]);

    useEffect(() => {
        if (selectedIndex == null) {
            return;
        }

        if (selectedIndex === lastSyncedIndexRef.current) {
            return;
        }

        lastSyncedIndexRef.current = selectedIndex;

        const selectedRow = rows[selectedIndex];

        if (
            selectedRow &&
            selectedRow.sourceKey !== activeKey
        ) {
            setActiveKey(selectedRow.sourceKey);
        }

        // activeKey is intentionally excluded so manual key changes remain.
    }, [selectedIndex, rows]);

    const filteredItems = useMemo(
        () =>
            rows
                .map((row, index) => ({
                    row,
                    mergedIndex: index,
                }))
                .filter(
                    ({ row }) => row.sourceKey === activeKey
                ),
        [rows, activeKey]
    );

    useEffect(() => {
        if (selectedIndex == null) {
            return;
        }

        requestAnimationFrame(() => {
            const item = itemRefs.current[selectedIndex];
            const container = scrollContainerRef.current;

            if (!item || !container) {
                return;
            }

            const itemCenter =
                item.offsetLeft + item.offsetWidth / 2;

            const targetScrollLeft =
                itemCenter - container.clientWidth / 2;

            container.scrollTo({
                left: Math.max(0, targetScrollLeft),
                behavior: 'smooth',
            });
        });
    }, [selectedIndex, activeKey]);

    const selectItem = (mergedIndex: number) => {
        lastSyncedIndexRef.current = mergedIndex;
        onSelect?.(mergedIndex);
    };
    
    const containerWidth = Math.max(timelineWidth-8, 0);
    const cardWidth = useMemo(() => {
        if (filteredItems.length === 0 || containerWidth === 0) {
            return 188;
        }
        return containerWidth / filteredItems.length;
    }, [containerWidth, filteredItems.length]);

    return (
        <Card
            size="small"
            title="Timeline Visual"
            className='lens-main-content'
            style={{
                height: 'auto',
                width: '100%',
            }}
            styles={{
                header: {
                    color: '#FFFFFF',
                    background: 'linear-gradient(90deg, #013D7D 0%, rgba(105, 178, 255, 0.7) 100%)',
                }
            }}
        >
            {availableKeys.length > 1 && (
                <div
                    className="lens-timeline-key-selector"
                >
                    <KeySelector
                        keys={availableKeys}
                        selectedKey={activeKey}
                        onChange={(newKey) => {
                            setActiveKey(newKey);

                            const firstItem = rows.findIndex(
                                (row) => row.sourceKey === newKey
                            );

                            if (firstItem >= 0){
                                selectItem(firstItem);
                            }
                        }}
                    />
                </div>
            )}

            {filteredItems.length === 0 ? (
                <div className="lens-timeline-empty">
                    <Empty description="No timeline events" />
                </div>
            ) : (
                <>
                    <div
                        ref={scrollContainerRef}
                        className="lens-timeline-scroll"
                        role="list"
                        aria-label="Asset event timeline"
                        onWheel={handleHorizontalScroll}
                    >
                        <div className="lens-timeline-track">
                            <div
                                className="lens-timeline-line"
                                aria-hidden="true"
                            />

                            {filteredItems.map(
                                (
                                    {
                                        row,
                                        mergedIndex,
                                    },
                                    filteredIndex
                                ) => {
                                    const isSelected =
                                        mergedIndex ===
                                        selectedIndex;

                                    const appearance =
                                        getEventAppearance(
                                            row.action
                                        );

                                    return (
                                        <button
                                            ref={(element) => {
                                                itemRefs.current[
                                                    mergedIndex
                                                ] = element;
                                            }}
                                            key={`${row.sourceKey}-${row.sourceIndex}-${row.timestamp}-${mergedIndex}`}
                                            type="button"
                                            role="listitem"
                                            aria-pressed={
                                                isSelected
                                            }
                                            className={[
                                                'lens-timeline-item',
                                                appearance.className,
                                                isSelected
                                                    ? 'lens-timeline-item-selected'
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                            onClick={() =>
                                                selectItem(
                                                    mergedIndex
                                                )
                                            }
                                            onKeyDown={(
                                                event
                                            ) =>
                                                handleArrowNavigation({
                                                    event,
                                                    filteredIndex,
                                                    filteredItems,
                                                    selectItem,
                                                    itemRefs,
                                                })
                                            }
                                            style={{
                                                width: `clamp(120px, ${cardWidth}px, 188px)`,
                                            }}
                                        >
                                            <div className="lens-timeline-node-row">
                                                <span className="lens-timeline-node">
                                                    <img src={appearance.symbol} alt='' />
                                                </span>
                                            </div>

                                            <div className="lens-timeline-event-card">

                                                <div className="lens-timeline-event-action">
                                                    {row.action ||
                                                        'Timeline event'}
                                                </div>

                                                <div className="lens-timeline-event-date">
                                                    {formatTimelineDate(
                                                        row.timestamp
                                                    )}
                                                </div>

                                                <div className="lens-timeline-event-time">
                                                    {formatTimelineTime(
                                                        row.timestamp
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    
                </>
            )}
        </Card>
    );
}