import { useLayoutEffect, useState } from 'react';
import { Alert } from 'antd';
import NewAssetsContent from './features/NewAssetsContent';
import { NewAsset } from './lib/types';
import './lib/styles.scss';
import '../src/lib/styles.scss';
import { NewAssetsList } from './features/NewAssetsList';
import { useFetchAssetTableData } from './lib/useFetchAssetTableData';

export default function App() {
    const [selectedRow, setSelectedRow] = useState<NewAsset | null>(null);
    const [newRequestedRowId, setNewRequestedRowId] = useState<number | null>(null);
    const { assetTableData, errorMessage } = useFetchAssetTableData();

    useLayoutEffect(() => {
        if (
            newRequestedRowId &&
            assetTableData.some((row) => row.assetAnalyticsSetupId === newRequestedRowId)
        ) {
            setSelectedRow(
                () =>
                    ({
                        ...assetTableData.find(
                            (row) => row.assetAnalyticsSetupId === newRequestedRowId
                        ),
                    }) as unknown as NewAsset
            );
            setNewRequestedRowId(null);
        }
    }, [newRequestedRowId, assetTableData]);

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
                selectedRowAladdinId={selectedRow?.aladdinId}
                selectedRowAssetType={selectedRow?.assetType}
                selectedRowRequestId={selectedRow?.assetAnalyticsSetupId}
                selectedRow={selectedRow}
                onAssetCreated={setNewRequestedRowId}
            />
            <NewAssetsList
                newAssets={assetTableData}
                onRowSelect={setSelectedRow}
                selectedRowId={selectedRow?.assetAnalyticsSetupId}
            />
        </div>
    );
}
