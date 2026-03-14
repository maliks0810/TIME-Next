import { useEffect, useMemo, useState } from 'react';
import { Collapse } from 'antd';
import { normalizeStatus } from '../../lib/helpers';
import { NewAsset } from '../../lib/types';
import { StatusLabel } from './components/StatusLabel';
import { StatusItem } from './components/StatusItem';
import { STATUSES } from '../../shared/constants';

const { Panel } = Collapse;

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
    selectedRowId?: number;
};

export function NewAssetsList({ newAssets, selectedRowId }: NewAssetsListProps) {
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Abandoned':
                return 'Abandoned (Last 2 days)';
            case 'Analytics Verified In Aladdin':
                return 'Analytics Verified In Aladdin (Last 2 days)';
            default:
                return status;
        }
    };
    const { panels, nonEmptyKeys } = useMemo(() => {
        const panels = STATUSES.map((status, idx) => {
            const group = newAssets.filter((asset) => asset.status === normalizeStatus(status));
            const key = String(idx);

            return {
                key,
                header: <StatusLabel label={getStatusLabel(status)} count={group.length} />,
                content: (
                    <div>
                        {group.map((asset) => (
                            <StatusItem
                                key={asset.assetAnalyticsSetupId}
                                asset={asset}
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
    }, [newAssets, selectedRowId]);

    const [activeKeys, setActiveKeys] = useState<string[]>(nonEmptyKeys);

    useEffect(() => {
        setActiveKeys((prev) => Array.from(new Set([...prev, ...nonEmptyKeys])));
    }, [nonEmptyKeys]);

    return (
        <div style={{ width: '20vw' }}>
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
