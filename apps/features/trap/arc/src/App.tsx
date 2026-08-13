import { useEffect, useState } from 'react';
import { Alert, Button, Segmented } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import NewAssetsContent from './features/NewAssetsContent';
import { ActiveView, NewAsset, TableRow } from './lib/types';
import './lib/styles.scss';
import '../src/lib/styles.scss';
import { NewAssetsList } from './features/NewAssetsList';
import { useFetchAssetTableData } from './lib/useFetchAssetTableData';
import { RequestNewAsset } from './features/RequestNewAsset';
import { WorkflowConfigPanel } from './features/WorkflowConfig';
import { LensPanel } from './features/Lens';
import { Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const NEW_ASSETS_LIST_ENDPOINT = '/api/hubs/workflow?workflowGroup=AnalyticsSummary';

export default function App() {
    const [selectedRow, setSelectedRow] = useState<TableRow<NewAsset> | null>(null);
    const [searchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [activeView, setActiveView] = useState<ActiveView>('assets');
    const { assetTableData, errorMessage, latestUpdateTimestamp } =
        useFetchAssetTableData(NEW_ASSETS_LIST_ENDPOINT);
    const [lensRefreshKey, setLensRefreshKey] = useState(false);

    const handleViewChange = (value: string) => {
        setActiveView(value as ActiveView);

        if (value === 'lens') {
            setLensRefreshKey(!lensRefreshKey);
        }
    };

    const handleToggleRequestModal = () => {
        setIsModalOpen((isOpen) => !isOpen);
    };
    const segmentOptions = [
        { label: 'Asset List', value: 'assets' },
        { label: 'Lens', value: 'lens' },
        {
            label: (
                <Tooltip title="Configurations" placement="bottom">
                    <SettingOutlined style={{ fontSize: '24px', display: 'block', margin: '0 auto', cursor: 'pointer', transform: 'translateY(2px)' }} />
                </Tooltip>
            ),
            value: 'configs',
        },
    ];

    useEffect(() => {
        const assetId = searchParams.get('assetId');
        if (
            assetId &&
            assetTableData.some((row) => row.assetAnalyticsSetupId === Number(assetId))
        ) {
            setSelectedRow(
                () =>
                    ({
                        ...assetTableData.find(
                            (row) => row.assetAnalyticsSetupId === Number(assetId)
                        ),
                    }) as TableRow<NewAsset>
            );
        }
    }, [searchParams.get('assetId'), assetTableData]);

    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    });

    return (
        <div className="arcContainer">
            <RequestNewAsset isOpen={isModalOpen} onClose={handleToggleRequestModal} />

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minWidth: 0,
                    gap: 8,
                }}
            >
                {errorMessage && (
                    <Alert
                        type="error"
                        message="Error loading assets"
                        description={errorMessage}
                        showIcon
                        style={{ marginBottom: 12 }}
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 8px' }}>
                    <Segmented
                        value={activeView}
                        onChange={handleViewChange}
                        options={segmentOptions}
                    />
                </div>

                <div style={{ display: activeView === 'assets' ? 'flex' : 'none', gap: 16, flex: 1, minHeight: 0 }}>
                    <NewAssetsContent
                        selectedRowRequestId={selectedRow?.assetAnalyticsSetupId}
                        selectedRowAladdinId={selectedRow?.aladdinId}
                        latestUpdateTimestamp={latestUpdateTimestamp}
                        selectedStatus={selectedRow?.status}
                        selectedPayload={selectedRow?.raw?.payload}
                    />
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'end',
                                padding: 8,
                            }}
                        >
                            <Button onClick={handleToggleRequestModal}>
                                <PlusOutlined /> New Asset
                            </Button>
                        </div>
                        <NewAssetsList
                            newAssets={assetTableData}
                            selectedRowId={selectedRow?.assetAnalyticsSetupId}
                        />
                    </div>
                </div>
                
                <div style={{ display: activeView === 'configs' ? 'block' : 'none', flex: 1}}>
                    <WorkflowConfigPanel />
                </div>
                
                <div style={{ display: activeView === 'lens' ? 'block' : 'none', flex: 1}}>
                    <LensPanel
                        refreshKey={lensRefreshKey}
                    />
                </div>
                
            </div>
        </div>
    );
}
