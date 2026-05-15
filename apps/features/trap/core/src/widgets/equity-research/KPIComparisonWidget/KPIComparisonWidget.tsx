/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Table, Pagination, Typography, Divider } from 'antd';

import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { ANALYSTS_KEY, PERIOD_RADIO_STORE_KEY } from '../../constants';
import { ColumnsType } from 'antd/es/table';

export function KPIComparisonWidget({ result, widgetInstance, execute }: WidgetComponentProps) {
    const [page, setPage] = useState(1);
    const analystsControl = useGetWidgetValue({
        channelId: widgetInstance.config?.params?.channel,
        key: ANALYSTS_KEY,
    }) as string[];
    const periodControl = useGetWidgetValue({
        channelId: widgetInstance.config?.params?.channel,
        key: PERIOD_RADIO_STORE_KEY,
    }) as string;

    useEffect(() => {
        const formattedNames = (analystsControl as string[])?.map((el: string) =>
            el.toUpperCase().replaceAll(' ', '_')
        );
        execute?.({ analystNames: formattedNames, period: periodControl });
    }, [periodControl, analystsControl]);

    if (!result) {
        return (
            <WidgetCardShell>
                <div style={{ padding: 12, fontSize: 12 }}>No data available.</div>
            </WidgetCardShell>
        );
    }

    const { columns = [], dataSource = [] } = result;

    return (
        <>
            <WidgetCardShell>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography.Title level={5} style={{ margin: 0 }}>
                        {analystsControl?.[page - 1] ? (
                            <>
                                {analystsControl?.[page - 1]
                                    .toLowerCase()
                                    .split('_')
                                    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
                                    .join(' ')}
                            </>
                        ) : (
                            '—'
                        )}
                    </Typography.Title>
                    {analystsControl?.length > 1 ? (
                        <Pagination
                            current={page}
                            simple
                            size="small"
                            onChange={setPage}
                            total={analystsControl?.length}
                            pageSize={1}
                        />
                    ) : null}
                </div>
                <Typography.Text type="secondary">
                    Period: {periodControl ? periodControl : 'Select Period'}
                </Typography.Text>
                <Divider style={{ padding: 0, margin: 4 }} />

                <Table
                    columns={columns as ColumnsType}
                    dataSource={
                        (dataSource as any[]).find(
                            ({ analyst }: { analyst: string; results: any }) =>
                                analyst === analystsControl?.[page - 1]
                        )?.results
                    }
                    pagination={false}
                    bordered={false}
                />
            </WidgetCardShell>
        </>
    );
}
