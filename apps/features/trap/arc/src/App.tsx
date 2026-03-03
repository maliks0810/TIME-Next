import { useEffect, useState } from 'react';
import { Alert } from 'antd';
import { useSearchParams } from 'react-router-dom';
import NewAssetsContent from './features/NewAssetsContent';
import { NewAsset } from './lib/types';
import './lib/styles.scss';
import '../src/lib/styles.scss';
import { NewAssetsList } from './features/NewAssetsList';
import { useFetchAssetTableData } from './lib/useFetchAssetTableData';

const NEW_ASSETS_LIST_ENDPOINT = '/api/hubs/workflow?workflowGroup=AnalyticsSummary';

export default function App() {
    const [selectedRow, setSelectedRow] = useState<NewAsset | null>(null);
    const [searchParams] = useSearchParams();
    const { assetTableData, errorMessage, latestUpdateTimestamp } =
        useFetchAssetTableData(NEW_ASSETS_LIST_ENDPOINT);

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
                    }) as unknown as NewAsset
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
            <NewAssetsContent
                selectedRowRequestId={selectedRow?.assetAnalyticsSetupId}
                selectedRow={selectedRow}
                latestUpdateTimestamp={latestUpdateTimestamp}
            />
            <NewAssetsList
                newAssets={assetTableData}
                selectedRowId={selectedRow?.assetAnalyticsSetupId}
            />
        </div>
    );
}
