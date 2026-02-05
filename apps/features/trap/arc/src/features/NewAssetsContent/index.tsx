import { memo, useState } from 'react';
import { Button, Divider, Tabs } from 'antd';
import { Analytics } from '../analytics';
import { ModelInputsOverrides } from '../model-inputs-overrides';
import { NewAssetSetup } from '../new-asset-setup';
import { NewAsset } from '../../lib/types';
import { RequestNewAsset } from '../model-inputs-overrides/components/RequestNewAsset';
import AddIcon from '@mui/icons-material/Add';

type NewAssetsContentProps = {
    selectedRow: NewAsset | null;
    selectedRowRequestId?: number | null;
    selectedRowAladdinId?: string | null;
    selectedRowAssetType?: string | null;
    selectedRowStatus?: string | null;
    refreshCallback: (param?: number) => void;
};

function NewAssetsContent({
    selectedRow,
    refreshCallback,
    selectedRowAladdinId,
    selectedRowAssetType,
    selectedRowRequestId,
    selectedRowStatus,
}: NewAssetsContentProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const items = [
        {
            key: 'modelIO',
            label: 'Analytics Inputs',
            children: (
                <ModelInputsOverrides
                    selectedRow={selectedRow}
                    selectedRowRequestId={selectedRowRequestId}
                    selectedRowStatus={selectedRowStatus}
                    refreshTable={refreshCallback}
                />
            ),
            disabled: false,
        },
        {
            key: 'analytics',
            label: 'Analytics',
            children: <Analytics refreshCallback={refreshCallback} selectedRow={selectedRow} />,
            disabled: false,
        },
        { key: 'newAssetSetup', label: 'CDI Reader', children: <NewAssetSetup /> },
    ];   
    return (
        <div style={{ width: '75vw', display: 'flex', gap: '4px', flexDirection: 'column' }}>
            <RequestNewAsset
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAssetCreated={refreshCallback}
            />

            <div className="componentHighlight ModelInputsIdTab">
                {selectedRowRequestId ? (
                    <>
                        <div style={{ marginTop: '22px' }}>
                            <span>
                                Request ID: <strong>{selectedRowRequestId}</strong>
                            </span>
                            <Divider type="vertical" />
                            <span>
                                Aladdin ID: <strong>{selectedRowAladdinId}</strong>
                            </span>
                            <Divider type="vertical" />
                            <span>
                                Asset Type: <strong>{selectedRowAssetType}</strong>
                            </span>
                        </div>
                    </>
                ) : (
                    <p>Please Select a Security</p>
                )}
                <div style={{ marginTop: '18px', marginRight: '16px' }}>
                    <Button style={{ marginLeft: 12 }} onClick={() => setIsModalOpen(true)}>
                        <AddIcon />
                        New Asset
                    </Button>
                </div>
            </div>
            <div className="componentHighlight tabsWrapper">
                <Tabs
                    className="niArcContent"
                    defaultActiveKey="modelIO"
                    items={items}
                    style={{ flex: 1, overflow: 'auto' }}
                />
            </div>
        </div>
    );
}

export default memo(NewAssetsContent);
