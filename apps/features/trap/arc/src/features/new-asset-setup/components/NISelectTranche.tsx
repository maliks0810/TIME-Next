/* eslint-disable */
import { useState } from 'react';
import { Button, Flex, Table } from 'antd';
import { selectTrancheColumns } from '../../../lib/configs';
import { TrancheSelectionType } from '../../../lib/types';
import { mockDealDetail } from '../lib/mockData';

export function NISelectTranche() {
    const [selectedRow, setSelectedRow] = useState<null | string>(null);
    const handleRowSelection = (record: TrancheSelectionType) => ({
        onClick: () => {
            setSelectedRow(record.name);
        },
    });
    return (
        <div style={{ flex: 1, maxHeight: 750, overflow: 'hidden' }} className="componentHighlight">
            <Table
                className="niSelectTrancheTable"
                dataSource={mockDealDetail.tranches}
                columns={selectTrancheColumns}
                pagination={false}
                onRow={handleRowSelection}
                rowClassName={(record) => (record.name === selectedRow ? 'niSelectedRow' : '')}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'end',
                    padding: 16,
                    height: 50,
                    // paddingTop: 110,
                }}
            >
                <Button type="primary" disabled={!selectedRow}>
                    Finish Setup
                </Button>
            </div>
        </div>
    );
}
