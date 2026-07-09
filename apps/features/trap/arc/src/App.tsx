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

    const handleToggleRequestModal = () => {
        setIsModalOpen((isOpen) => !isOpen);
    };
    const segmentOptions = [
        { label: 'Asset List', value: 'assets' },
        {
            label: (
                <Tooltip title="Configurations" placement="bottom">
                    <SettingOutlined style={{ fontSize: '24px', display: 'block', margin: '0 auto', cursor: 'pointer' }} />
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
                        onChange={(value) => setActiveView(value as ActiveView)}
                        options={segmentOptions}
                    />
                </div>

                {activeView === 'assets' ? (
                    <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
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
                ) : (
                    <WorkflowConfigPanel />
                )}
            </div>
        </div>
    );
}
