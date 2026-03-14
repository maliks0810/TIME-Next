/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Modal, Descriptions, Spin } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { downloadAnalyticsOverrideAPI, previewAnalyticsOverrideAPI } from '../lib/services';
import { PreviewAnalyticsOverrideResponseType } from '../lib/types';
import { MessageInstance } from 'antd/es/message/interface';

const Config = [
    { title: 'ASSET_ID', dataIndex: 'assetId' },
    { title: 'ASSET_ID_TYPE', dataIndex: 'assetIdType' },
    { title: 'KRD_3M', dataIndex: 'krd3M' },
    { title: 'RISK_DATE', dataIndex: 'riskDate' },
    { title: 'CURRENCY', dataIndex: 'currency' },
    { title: 'KRD_1Y', dataIndex: 'krd1Y' },
    { title: 'KRD_DATE', dataIndex: 'krdDate' },
    { title: 'PRICE', dataIndex: 'price' },
    { title: 'KRD_2Y', dataIndex: 'krd2Y' },
    { title: 'STATIC_YIELD', dataIndex: 'staticYield' },
    { title: 'ZV_YIELD', dataIndex: 'zvYield' },
    { title: 'KRD_3Y', dataIndex: 'krd3Y' },
    { title: 'YIELD_TO_MATURITY', dataIndex: 'yieldToMaturity' },
    { title: 'YIELD_TO_WORST', dataIndex: 'yieldToWorst' },
    { title: 'KRD_5Y', dataIndex: 'krd5Y' },
    { title: 'WAL', dataIndex: 'wal' },
    { title: 'ZV_WAL', dataIndex: 'zvWal' },
    { title: 'KRD_7Y', dataIndex: 'krd7Y' },
    { title: 'WAL_TO_WORST', dataIndex: 'walToWorst' },
    { title: 'OAD', dataIndex: 'oad' },
    { title: 'KRD_10Y', dataIndex: 'krd10Y' },
    { title: 'MODEL_OAD', dataIndex: 'modelOad' },
    { title: 'MOD_DUR', dataIndex: 'modDur' },
    { title: 'KRD_15Y', dataIndex: 'krd15Y' },
    { title: 'MOD_DUR_TO_WORST', dataIndex: 'modDurToWorst' },
    { title: 'MODEL_OAC', dataIndex: 'modelOac' },
    { title: 'KRD_20Y', dataIndex: 'krd20Y' },
    { title: 'OAC', dataIndex: 'oac' },
    { title: 'SPD_DUR', dataIndex: 'spdDur' },
    { title: 'KRD_25Y', dataIndex: 'krd25Y' },
    { title: 'SPRD_OFF_WAL', dataIndex: 'sprdOffWal' },
    { title: 'OAS', dataIndex: 'oas' },
    { title: 'KRD_30Y', dataIndex: 'krd30Y' },
    { title: 'VOL_DUR', dataIndex: 'volDur' },
    { title: 'CURVE_TYPE', dataIndex: 'curveType' },
    { title: 'KRD_40Y', dataIndex: 'krd40Y' },
    { title: 'KRD_BENCH_CUSIP', dataIndex: 'krdBenchCusip' },
    { title: 'KRD_SOURCE', dataIndex: 'krdSource' },
    { title: 'KRD_50Y', dataIndex: 'krd50Y' },

    // Below 2 fields is not included in Excel, should we show it on UI?
    // { title: 'oas1', key: 'oas1', dataIndex: 'oas1' },
    // { title: 'spreadToWorst', key: 'spreadToWorst', dataIndex: 'spreadToWorst' },
];

export default function PreviewAnalyticsModal({
    aladdinId,
    isOpen,
    toggleModal,
    messageApi,
}: {
    aladdinId: string;
    isOpen: boolean;
    toggleModal: () => void;
    messageApi: MessageInstance;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [analyticsOverride, setAnalyticsOverride] = useState<
        PreviewAnalyticsOverrideResponseType | undefined
    >();
    const [searchParams] = useSearchParams();

    const handleCloseModal = () => {
        setAnalyticsOverride(undefined);
        toggleModal();
    };

    const fetchPreviewAnalyticsOverride = async () => {
        const assetAnalyticsSetupId = searchParams.get('assetId');

        if (!assetAnalyticsSetupId) {
            return;
        }

        setIsLoading(true);
        const payload = {
            assetAnalyticsSetupId: +assetAnalyticsSetupId,
            aladdinId,
        };
        try {
            const response = await previewAnalyticsOverrideAPI(payload);

            setAnalyticsOverride(response.data.response[0]);
        } catch (err: any) {
            console.error('Failed to fetch data for Analytics Override:', err);
            messageApi.error(
                err?.response?.data?.message ??
                    'Failed to fetch data for Analytics Override. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPreviewAnalyticsOverride();
        }
    }, [isOpen]);

    const downloadAnalyticsOverride = async () => {
        const assetAnalyticsSetupId = searchParams.get('assetId');

        if (!assetAnalyticsSetupId) {
            return;
        }

        setIsLoading(true);
        const payload = {
            assetAnalyticsSetupId: +assetAnalyticsSetupId,
            aladdinId,
        };

        try {
            const response = await downloadAnalyticsOverrideAPI(payload);

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `preview_${aladdinId}_analytics_override.csv`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            a.remove();
            window.URL.revokeObjectURL(url);
            handleCloseModal();

            messageApi.success('Analytics Preview File Downloaded. Check Downloads on Browser');
        } catch (err: any) {
            console.error('Failed to pull preview file:', err);
            messageApi.error(
                err?.response?.data?.message ??
                    'Failed to download analytics preview file. Please try again.'
            );
        } finally {
            setIsFileLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            cancelText="Close"
            okText={<FileOutlined />}
            onOk={downloadAnalyticsOverride}
            onCancel={handleCloseModal}
            okButtonProps={{
                loading: isFileLoading,
            }}
            width={950}
            closeIcon={null}
        >
            <div>
                {analyticsOverride ? (
                    <Descriptions title="Analytics Preview" size="small" column={3} bordered>
                        {isLoading ? (
                            <Spin />
                        ) : (
                            Config.map((column) => (
                                <Descriptions.Item key={column.dataIndex} label={column.title}>
                                    {
                                        analyticsOverride[
                                            column.dataIndex as keyof PreviewAnalyticsOverrideResponseType
                                        ]
                                    }
                                </Descriptions.Item>
                            ))
                        )}
                    </Descriptions>
                ) : null}
            </div>
        </Modal>
    );
}
