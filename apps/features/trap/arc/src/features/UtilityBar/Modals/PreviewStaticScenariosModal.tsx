/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Modal, Table } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { FileOutlined } from '@ant-design/icons';
import { downloadStaticScenariosAPI, previewStaticScenariosAPI } from '../lib/services';
import { PreviewStaticScenariosResponseType } from '../lib/types';
import { MessageInstance } from 'antd/es/message/interface';

const Columns = [
    {
        title: 'CUSIP',
        key: 'cusip',
        dataIndex: 'cusip',
    },
    {
        title: 'START_DATE',
        key: 'startDate',
        dataIndex: 'startDate',
    },
    {
        title: 'SCEN_TYPE',
        key: 'scenType',
        dataIndex: 'scenType',
    },
    {
        title: 'PURPOSE',
        key: 'purpose',
        dataIndex: 'purpose',
    },
    {
        title: 'MODEL',
        key: 'model',
        dataIndex: 'model',
    },
    {
        title: 'SCENARIO',
        key: 'scenario',
        dataIndex: 'scenario',
    },
    {
        title: 'SCENARIO_TEXT',
        key: 'scenarioText',
        dataIndex: 'scenarioText',
    },
];

export default function PreviewStaticScenariosModal({
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
    const [statisScenarios, setStaticScenarios] = useState<
        PreviewStaticScenariosResponseType[] | undefined
    >();
    const [searchParams] = useSearchParams();

    const handleCloseModal = () => {
        setStaticScenarios(undefined);
        toggleModal();
    };

    const fetchPreviewStatisScenarios = async () => {
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
            const response = await previewStaticScenariosAPI(payload);

            setStaticScenarios(response.data.response);
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
            fetchPreviewStatisScenarios();
        }
    }, [isOpen]);

    const downloadStaticScenarios = async () => {
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
            const response = await downloadStaticScenariosAPI(payload);

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `preview_${aladdinId}_static_scenarios.csv`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            a.remove();
            window.URL.revokeObjectURL(url);
            handleCloseModal();
            messageApi.success(
                'Static Scenario Preview File Downloaded. Check Downlaods on Browser'
            );
        } catch (err: any) {
            console.error('Failed to pull preview file:', err);
            messageApi.error(
                err?.response?.data?.message ??
                    'Failed to download static scenario preview file. Please try again.'
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
            onOk={downloadStaticScenarios}
            onCancel={handleCloseModal}
            okButtonProps={{
                loading: isFileLoading,
            }}
            width={900}
            closeIcon={null}
        >
            <Table
                dataSource={statisScenarios}
                columns={Columns}
                pagination={false}
                loading={isLoading}
            />
        </Modal>
    );
}
