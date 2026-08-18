import { useEffect, useRef, useCallback } from 'react';
import { Table, Collapse, Card } from 'antd';
import { MergedTimelineItem } from './lib/types';
import { extractBlocks } from './lib/helper';
import { DownloadBrsZipButton } from './DownloadBrsZipButton';
import '../../lib/styles.scss';
import { MessageInstance } from 'antd/es/message/interface';

interface TimelineTableProps {
    rows: MergedTimelineItem[];
    loading?: boolean;
    selectedIndex?: number | null;
    aladdinId: string;
    onSelect?: (index: number) => void;
    messageApi: MessageInstance;
}

export default function TimelineTable({
    rows,
    loading = false,
    selectedIndex,
    aladdinId,
    onSelect,
    messageApi,
}: TimelineTableProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sourceKey =
        (selectedIndex != null ? rows[selectedIndex]?.sourceKey : undefined) ??
        rows[0]?.sourceKey ??
        '';

    const scrollToSelectedRow = useCallback(() => {
        if (selectedIndex == null) return;

        const row = rows[selectedIndex];
        if (!row) return;

        const rowKey = `${row.sourceKey}-${row.sourceIndex}-${row.timestamp}`;

        const selector =
            typeof CSS !== 'undefined' && CSS.escape
                ? CSS.escape(rowKey)
                : rowKey.replace(/"/g, '\\"');

        const container = containerRef.current;
        if (!container) return;

        const body = container.querySelector(
            '.ant-table-body'
        ) as HTMLElement | null;

        const rowEl = container.querySelector(
            `tr[data-row-key="${selector}"]`
        ) as HTMLElement | null;

        if (!body || !rowEl) return;

        const bodyRect = body.getBoundingClientRect();
        const rowRect = rowEl.getBoundingClientRect();

        const offsetTop =
            rowRect.top - bodyRect.top + body.scrollTop;

        const target =
            offsetTop - body.clientHeight / 2 + rowRect.height / 2;

        body.scrollTo({
            top: Math.max(0, target),
            behavior: 'smooth',
        });
    }, [selectedIndex, rows]);

    // Scroll the selected row into view inside antd's inner scroll body
    // (.ant-table-body), triggered whenever the selection changes from
    // either the table or the timeline visual.
    useEffect(() => {
        const raf = requestAnimationFrame(scrollToSelectedRow);

        return () => cancelAnimationFrame(raf);
    }, [scrollToSelectedRow]);

    return (
        <Card
            className='lens-main-content'
            size="small"
            title="Timeline Table"
            style={{ height: '100%', width: '100%' }}
            extra={
                <DownloadBrsZipButton
                    assetAnalyticsSetupId={sourceKey}
                    aladdinId={aladdinId}
                    messageApi={messageApi}
                />
            }
            styles={{
                header: {
                    color: '#FFFFFF',
                    background: 'linear-gradient(90deg, #013D7D 0%, rgba(105, 178, 255, 0.7) 100%)',
                }
            }}
        >
        <div ref={containerRef}>
            <Table<MergedTimelineItem>
                rowKey={(record) =>
                    `${record.sourceKey}-${record.sourceIndex}-${record.timestamp}`
                }
                loading={loading}
                pagination={false}
                sticky
                scroll={{ x: 1000, y: 300 }}
                dataSource={rows}
                onRow={(_, index) => ({
                    onClick: () => {
                        if (typeof index === 'number') {
                            onSelect?.(index);
                        }
                    },
                    style: { cursor: 'pointer' },
                })}
                rowClassName={(_, index) =>
                    index === selectedIndex ? 'timeline-row-selected' : ''
                }
                columns={[
                    {
                        title: 'Action',
                        dataIndex: 'action',
                        key: 'action',
                        width: 220,
                    },
                    {
                        title: 'Timestamp',
                        dataIndex: 'timestamp',
                        key: 'timestamp',
                        width: 160,
                        render: (value: string) =>
                            new Date(value).toLocaleString(),
                    },
                    {
                        title: 'Author',
                        dataIndex: 'author',
                        key: 'author',
                        width: 180,
                    },
                    {
                        title: 'Notes',
                        dataIndex: 'comment',
                        key: 'comment',
                        width: 200,
                    },
                    {
                        title: 'Payload Delta',
                        dataIndex: 'payloadDelta',
                        key: 'payloadDelta',
                        width: 260,
                        render: (value: string | null) => {
                            if (!value) {
                                return null;
                            }
                            const { remainingText, blocks } = extractBlocks(value);
                            return (
                                <>
                                    {remainingText && (
                                        <div
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                marginBottom: 8,
                                            }}
                                        >
                                            {remainingText}
                                        </div>
                                    )}
                                    {blocks.length > 0 && (
                                        <Collapse
                                            size="small"
                                            items={blocks.map((block) => ({
                                                key: block.title,
                                                label: block.title,
                                                children: (
                                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                                        {block.content}
                                                    </div>
                                                ),
                                            }))}
                                        />
                                    )}
                                </>
                            );
                        },
                    },
                ]}
            />
        </div>
        </Card>
    );
}