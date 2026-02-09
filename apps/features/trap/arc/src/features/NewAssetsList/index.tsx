import React, { useEffect, useMemo, useState } from 'react';
import { Collapse } from 'antd';
import { normalizeStatus } from '../../lib/helpers';
import { NewAsset } from '../../lib/types';
import { StatusLabel } from './components/StatusLabel';
import { StatusItem } from './components/StatusItem';

const { Panel } = Collapse;

const STATUSES = [
    // 'Analytics Requested', Mark C: Comment this out as this step is not needed.
    'Analytics Input Pending Review',
    'Analytics Input Sent To Aladdin',
    // 'Analytics Input Verified In Aladdin', Mark C: Comment this out as this step is not needed.
    'Analytics Calculation In Progress',
    'Analytics Pending Review',
    'Analytics Sent To Aladdin',
    'Analytics Verified In Aladdin',
    'Invalid Request',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: MC.  Will clean this up later
type TableRow<T = any> = {
    key: string | number;
    assetAnalyticsSetupId?: number;
    aladdinId?: string;
    assetIdType?: string;
    status?: string;
    createdDate?: string;
    raw: T;
};

type NewAssetsListProps = {
    newAssets: TableRow<NewAsset>[];
    onRowSelect: (selectedRow: NewAsset) => void;
    refreshCallback: () => void;
    selectedRowId?: number;
};

export function NewAssetsList({
    newAssets,
    onRowSelect,
    refreshCallback,
    selectedRowId,
}: NewAssetsListProps) {
    const { panels, nonEmptyKeys } = useMemo(() => {
        const panels = STATUSES.map((status, idx) => {
            const group = newAssets.filter((asset) => asset.status === normalizeStatus(status));
            const key = String(idx);

            return {
                key,
                header: <StatusLabel label={status} count={group.length} />,
                content: (
                    <div>
                        {group.map((asset) => (
                            <StatusItem
                                key={asset.assetAnalyticsSetupId}
                                asset={asset}
                                handleSelectRow={onRowSelect}
                                refreshCallback={refreshCallback}
                                isActive={asset.assetAnalyticsSetupId === selectedRowId}
                            />
                        ))}
                    </div>
                ),
                hasItems: group.length > 0,
            };
        });

        const nonEmptyKeys = panels.filter((p) => p.hasItems).map((p) => p.key);
        return { panels, nonEmptyKeys };
    }, [newAssets, onRowSelect, refreshCallback]);

    const [activeKeys, setActiveKeys] = useState<string[]>(nonEmptyKeys);

    useEffect(() => {
        setActiveKeys((prev) => Array.from(new Set([...prev, ...nonEmptyKeys])));
    }, [nonEmptyKeys]);

    return (
        <div style={{ width: '25vw' }}>
            <Collapse
                defaultActiveKey={activeKeys}
                onChange={(keys) => {
                    const next = Array.isArray(keys) ? keys.map(String) : [String(keys)];
                    setActiveKeys(next);
                }}
            >
                {panels.map((p) => (
                    <Panel header={p.header} key={p.key}>
                        {p.content}
                    </Panel>
                ))}
            </Collapse>
        </div>
    );
}
