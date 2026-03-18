import { useEffect, useState } from 'react';
import { Alert, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import NewAssetsContent from './features/NewAssetsContent';
import { NewAsset, TableRow } from './lib/types';
import './lib/styles.scss';
import '../src/lib/styles.scss';
import { NewAssetsList } from './features/NewAssetsList';
import { useFetchAssetTableData } from './lib/useFetchAssetTableData';
import { RequestNewAsset } from './features/RequestNewAsset';

const NEW_ASSETS_LIST_ENDPOINT = '/api/hubs/workflow?workflowGroup=AnalyticsSummary';

export default function App() {
    const [selectedRow, setSelectedRow] = useState<TableRow<NewAsset> | null>(null);
    const [searchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { assetTableData, errorMessage, latestUpdateTimestamp } =
        useFetchAssetTableData(NEW_ASSETS_LIST_ENDPOINT);

    const handleToggleRequestModal = () => {
        setIsModalOpen((isOpen) => !isOpen);
    };

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
            {errorMessage && (
                <Alert
                    type="error"
                    message="Error loading assets"
                    description={errorMessage}
                    showIcon
                    style={{ marginBottom: 12 }}
                />
            )}
            <RequestNewAsset isOpen={isModalOpen} onClose={handleToggleRequestModal} />

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
    );
}
