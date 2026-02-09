/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'antd';
import NewAssetsContent from './features/NewAssetsContent';
import { getNewAssets } from './lib/services';
import { extractResponseArray, toRows, formatIso } from './lib/helpers';
import { NewAsset, TableRow } from './lib/types';
import './lib/styles.scss';
import '../src/lib/styles.scss';
import { NewAssetsList } from './features/NewAssetsList';

const POLLING_INTERVAL = 20000; //ms

export default function App() {
    const [selectedRow, setSelectedRow] = useState<NewAsset | null>(null);
    const [rows, setRows] = useState<TableRow<NewAsset>[]>([]);
    const [, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const fetchList = useCallback(
        async (assetId?: number) => {
            setIsLoading(true);
            setErrorMsg(null);
            try {
                const raw = await getNewAssets();
                const candidates = extractResponseArray(raw);

                const items: NewAsset[] = candidates.map((itemObj: any) => ({
                    assetAnalyticsSetupId: Number(itemObj.assetAnalyticsSetupId ?? 0),
                    newAssetRequestId: String(itemObj.newAssetRequestId ?? ''),
                    aladdinId: String(itemObj.aladdinId ?? ''),
                    price: Number(itemObj.price ?? 0),
                    assetType: String(itemObj.assetType ?? ''),
                    status: String(itemObj.status ?? ''),
                    createdBy: String(itemObj.createdBy ?? ''),
                    createdDate: String(itemObj.createdDate ?? ''),
                    lastModifiedBy: String(itemObj.lastModifiedBy ?? ''),
                    lastModifiedDate: formatIso(String(itemObj.lastModifiedDate ?? '')),
                    cdiCduBlob: String(itemObj.cdiCduBlob ?? ''),
                    payload: String(itemObj.payload ?? ''),
                    claimedBy: String(itemObj.claimedBy ?? ''),
                    claimedAt: formatIso(itemObj.claimedAt),
                    assetClass: String(itemObj.assetClass ?? ''),
                    instrumentType: String(itemObj.instrumentType ?? ''),
                    analysisDate: String(itemObj.analysisDate ?? ''),
                }));

                const rows = toRows(items);
                setRows(rows);
                checkAndStartPolling(rows);
                if (assetId) {
                    setSelectedRow(
                        () =>
                            rows.find(
                                (row) => row.assetAnalyticsSetupId === assetId
                            ) as unknown as NewAsset
                    );
                }
            } catch (e: any) {
                setErrorMsg(e?.message || 'Failed to load new assets.');
                setRows([]);
            } finally {
                setIsLoading(false);
            }
        },
        [selectedRow]
    );

    const checkAndStartPolling = useCallback(
        (rows: TableRow<NewAsset>[]) => {
            const shouldStartPolling = rows.some(
                (el) => el.status === 'ANALYTICS CALCULATION IN PROGRESS'
            );

            if (!shouldStartPolling) clearTimeout(pollingRef.current);

            if (shouldStartPolling && !pollingRef.current) {
                pollingRef.current = setInterval(() => {
                    fetchList();
                }, POLLING_INTERVAL);
            }
        },
        [fetchList]
    );

    useEffect(() => {
        return () => {
            clearTimeout(pollingRef.current);
        };
    }, []);

    useEffect(() => {
        fetchList();
        // No deps because should run only on mount
    }, []);

    return (
        <div className="arcContainer">
            {errorMsg && (
                <Alert
                    type="error"
                    message="Error loading assets"
                    description={errorMsg}
                    showIcon
                    style={{ marginBottom: 12 }}
                />
            )}
            <NewAssetsContent
                selectedRowAladdinId={selectedRow?.aladdinId}
                selectedRowAssetType={selectedRow?.assetType}
                selectedRowRequestId={selectedRow?.assetAnalyticsSetupId}
                selectedRowStatus={selectedRow?.status}
                selectedRow={selectedRow}
                refreshCallback={fetchList}
            />
            <NewAssetsList
                newAssets={rows}
                onRowSelect={setSelectedRow}
                refreshCallback={fetchList}
                selectedRowId={selectedRow?.assetAnalyticsSetupId}
            />
        </div>
    );
}
