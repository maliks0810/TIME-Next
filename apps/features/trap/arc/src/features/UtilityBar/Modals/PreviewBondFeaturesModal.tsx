/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Modal, Table } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { FileOutlined } from '@ant-design/icons';
import { downloadBondFeaturesAPI, previewBondFeaturesAPI } from '../lib/services';
import { PreviewBondResponseType } from '../lib/types';
import { MessageInstance } from 'antd/es/message/interface';

const Columns = [
    {
        title: 'FEATURE',
        key: 'feature',
        dataIndex: 'feature',
    },
    {
        title: 'PURPOSE',
        key: 'purpose',
        dataIndex: 'purpose',
    },
    {
        title: 'SOURCE',
        key: 'source',
        dataIndex: 'source',
    },
    {
        title: 'START_DATE',
        key: 'startDate',
        dataIndex: 'startDate',
    },
    {
        title: 'VALUE',
        key: 'value',
        dataIndex: 'value',
    },
    {
        title: 'CUSIP',
        key: 'cusip',
        dataIndex: 'cusip',
    },
];

export default function PreviewBondFeaturesModal({
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
    const [bondFeatures, setBondFeatures] = useState<PreviewBondResponseType[] | undefined>();
    const [searchParams] = useSearchParams();

    const handleCloseModal = () => {
        setBondFeatures(undefined);
        toggleModal();
    };

    const fetchPreviewBondFeatures = async () => {
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
            const response = await previewBondFeaturesAPI(payload);

            setBondFeatures(response.data.response);
        } catch (err: any) {
            console.error('Failed to fetch data for Bond Features:', err);
            messageApi.error(
                err?.response?.data?.message ??
                    'Failed to fetch data for Bond Features. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPreviewBondFeatures();
        }
    }, [isOpen]);

    const downloadBondFeatures = async () => {
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
            const response = await downloadBondFeaturesAPI(payload);

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `preview_${aladdinId}_bond_features.csv`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            a.remove();
            window.URL.revokeObjectURL(url);
            handleCloseModal();

            messageApi.success('Bond Features Preview File Downloaded. Check Downloads on Browser');
        } catch (err: any) {
            console.error('Failed to pull preview file:', err);
            messageApi.error(
                err?.response?.data?.message ??
                    'Failed to download bond feature preview file. Please try again.'
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
            onOk={downloadBondFeatures}
            okButtonProps={{
                loading: isFileLoading,
            }}
            onCancel={handleCloseModal}
            width={900}
            closeIcon={null}
        >
            <Table
                dataSource={bondFeatures}
                columns={Columns}
                pagination={false}
                loading={isLoading}
            />
        </Modal>
    );
}
