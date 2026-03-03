import { memo, useState } from 'react';
import { Button, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Analytics } from '../analytics';
import { ModelInputsOverrides } from '../model-inputs-overrides';
import { NewAssetSetup } from '../new-asset-setup';
import { NewAsset } from '../../lib/types';
import { RequestNewAsset } from '../model-inputs-overrides/components/RequestNewAsset';
import { AssetInfo } from '../AssetInfo';
import SecuritySettings from '../SecuritySettings';

type NewAssetsContentProps = {
    selectedRow: NewAsset | null;
    selectedRowRequestId?: number | null;
    latestUpdateTimestamp: number;
};

function NewAssetsContent({
    selectedRow,
    selectedRowRequestId,
    latestUpdateTimestamp,
}: NewAssetsContentProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleToggleRequestModal = () => {
        setIsModalOpen((isOpen) => !isOpen);
    };

    const items = [
        {
            key: 'modelIO',
            label: 'Analytics Inputs',
            children: <ModelInputsOverrides selectedRowRequestId={selectedRowRequestId} />,
            disabled: false,
        },
        {
            key: 'analytics',
            label: 'Analytics',
            children: <Analytics selectedRow={selectedRow} />,
            disabled: false,
        },
        { key: 'newAssetSetup', label: 'CDI Reader', children: <NewAssetSetup /> },
    ];
    return (
        <div style={{ width: '75vw', display: 'flex', gap: '4px', flexDirection: 'column' }}>
            <RequestNewAsset isOpen={isModalOpen} onClose={handleToggleRequestModal} />

            <AssetInfo
                selectedAssetId={selectedRowRequestId}
                latestUpdateTimestamp={latestUpdateTimestamp}
            />
            <SecuritySettings
                selectedAssetId={selectedRowRequestId}
                latestUpdateTimestamp={latestUpdateTimestamp}
            />
            <div className="componentHighlight tabsWrapper">
                <Tabs
                    className="niArcContent"
                    defaultActiveKey="modelIO"
                    tabBarExtraContent={
                        <Button onClick={handleToggleRequestModal}>
                            <PlusOutlined /> New Asset
                        </Button>
                    }
                    items={items}
                    style={{ flex: 1, overflow: 'auto' }}
                />
            </div>
        </div>
    );
}

export default memo(NewAssetsContent);
