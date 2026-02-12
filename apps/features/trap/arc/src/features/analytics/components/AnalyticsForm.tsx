/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Space, Button, message, Form, Tooltip } from 'antd';
import { useUserInfo } from '@platform/utils';
import { FileOutlined } from '@ant-design/icons';

import { AnalyticsRequest, NewAsset, NewAssetAnalytics, NoteType } from '../../../lib/types';
import {
    postVerifyAnalytics,
    postVerifyAnalyticsOnAladdin,
    publishAnalytics,
    updateAnalyticsOverrides,
} from '../../../lib/services';

import { normalizeStatus } from '../../../lib/helpers';
import AnalyticsFormLayout from './AnalyticsFormLayout';
import PreviewAnalyticsModal from './PreviewAnalyticsModal';

export type AnalyticsFormProps = {
    asset?: NewAssetAnalytics | null;
    onRefresh?: (assetId?: number | null) => void;
    selectedRow: NewAsset | null;
    latestNote: NoteType | null;
};

export const AnalyticsForm: React.FC<AnalyticsFormProps> = ({
    asset,
    onRefresh,
    selectedRow,
    latestNote,
}) => {
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [isPreviewAnalyticsOverridesModalOpen, setIsPreviewAnalyticsOverridesModalOpen] =
        useState(false);
    const [form] = Form.useForm();
    const userInfo = useUserInfo();
    const username = userInfo.email;
    const [messageApi, contextHolder] = message.useMessage();

    const handleTogglePreviewAnalyticsOverrideModal = () => {
        setIsPreviewAnalyticsOverridesModalOpen((isOpen) => !isOpen);
    };

    // Derive assetId and normalized status safely (works even when asset is null)
    const assetId = asset?.assetAnalyticsSetupId ?? -1;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const statusNormalized = normalizeStatus(asset?.status);

    // Final disabled states
    const saveOverridesDisabled =
        !!selectedRow && normalizeStatus(selectedRow?.status) !== 'ANALYTICS PENDING REVIEW';
    const publishAnalyticsDisabled =
        !!selectedRow && normalizeStatus(selectedRow?.status) !== 'ANALYTICS PENDING REVIEW';
    const verifyOnAladdinDisabled =
        !!selectedRow && normalizeStatus(selectedRow?.status) !== 'ANALYTICS SENT TO ALADDIN';

    const handleSaveOverrides = async () => {
        if (!username || !asset) return;
        setActionLoading(true);
        try {
            await updateAnalyticsOverrides({
                assets: [
                    {
                        ...asset,
                        assetIdType: form.getFieldValue('assetIdType'),
                        currency: form.getFieldValue('currency'),
                        curveType: form.getFieldValue('curveType'),
                        krdBenchCusip: form.getFieldValue('krdBenchCusip'),
                        krdSource: form.getFieldValue('krdSource'),
                        oad: form.getFieldValue('oad'),
                        krd10Y: form.getFieldValue('krd10Y'),
                        krd15Y: form.getFieldValue('krd15Y'),
                        krd1Y: form.getFieldValue('krd1Y'),
                        krd20Y: form.getFieldValue('krd20Y'),
                        krd25Y: form.getFieldValue('krd25Y'),
                        krd2Y: form.getFieldValue('krd2Y'),
                        krd30Y: form.getFieldValue('krd30Y'),
                        krd3M: form.getFieldValue('krd3M'),
                        krd3Y: form.getFieldValue('krd3Y'),
                        krd40Y: form.getFieldValue('krd40Y'),
                        krd50Y: form.getFieldValue('krd50Y'),
                        krd5Y: form.getFieldValue('krd5Y'),
                        krd7Y: form.getFieldValue('krd7Y'),
                        modDur: form.getFieldValue('modDur'),
                        modDurToWorst: form.getFieldValue('modDurToWorst'),
                        oac: form.getFieldValue('oac'),
                        oas: form.getFieldValue('oas'),
                        oas1: form.getFieldValue('oas1'),
                        price: form.getFieldValue('price'),
                        spdDur: form.getFieldValue('spdDur'),
                        spreadToWorst: form.getFieldValue('spreadToWorst'),
                        wal: form.getFieldValue('wal'),
                        walToWorst: form.getFieldValue('walToWorst'),
                        yieldToMaturity: form.getFieldValue('yieldToMaturity'),
                        yieldToWorst: form.getFieldValue('yieldToWorst'),
                        zvWal: form.getFieldValue('zvWal'),
                        zvYield: form.getFieldValue('zvYield'),
                        noteText: form.getFieldValue('noteTextArea'),

                        staticYield: form.getFieldValue('staticYield'),
                        modelOad: form.getFieldValue('modelOad'),
                        modelOac: form.getFieldValue('modelOac'),
                        volDur: form.getFieldValue('volDur'),
                        assetId: form.getFieldValue('assetId'),
                        claimedBy: form.getFieldValue('claimedBy'),
                        claimedAt: form.getFieldValue('claimedAt'),
                        oav: form.getFieldValue('oav'),
                        inflDuration: form.getFieldValue('inflDuration'),
                        realDuration: form.getFieldValue('realDuration'),
                        sprdOffWal: form.getFieldValue('sprdOffWal'),
                        volatility: form.getFieldValue('volatility'),
                        volConv: form.getFieldValue('volConv'),
                        realYield: form.getFieldValue('realYield'),
                        rorCbe: form.getFieldValue('rorCbe'),

                        noteType: 'AOR',
                        modifiedBy: username,
                    } satisfies AnalyticsRequest,
                ],
            });
            messageApi.success('Analytics overrides sent.');
            onRefresh?.();
        } catch (err: any) {
            messageApi.error(
                err?.response?.data?.message ??
                    'Failed to save analytics overrides. Please try again.'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handlePublishAnalytics = async () => {
        if (!username || !asset) return;
        setActionLoading(true);
        try {
            console.log(form.getFieldValue('noteTextArea'));
            const response = await publishAnalytics({
                analytics: [
                    {
                        ...asset,
                        modifiedBy: asset.lastModifiedBy ?? username,
                    } satisfies AnalyticsRequest,
                ],
            });
            console.log(response);
            await postVerifyAnalytics({
                updatedBy: username,
                assetAnalyticsSetupId: asset.assetAnalyticsSetupId,
            });
            messageApi.success('Analytics verification sent.');
            onRefresh?.();
        } catch (err: any) {
            messageApi.error(
                err?.response?.data?.message ?? 'Failed to verify analytics. Please try again.'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyOnAladdin = async () => {
        if (!username || !asset) return;
        setActionLoading(true);
        try {
            await postVerifyAnalyticsOnAladdin({
                assetAnalyticsSetupId: asset.assetAnalyticsSetupId,
                updatedBy: username,
            });
            messageApi.success('Verification on Aladdin recorded.');
            onRefresh?.();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: any) {
            messageApi.error('Failed to verify analytics on Aladdin. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    if (!asset) {
        return null;
    }

    return (
        <>
            <Form
                form={form}
                initialValues={{ ...asset, noteTextArea: latestNote?.noteText }}
                onFinish={handleSaveOverrides}
                scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
            >
                <PreviewAnalyticsModal
                    assetAnalyticsSetupId={assetId}
                    aladdinId={asset.aladdinId}
                    isOpen={isPreviewAnalyticsOverridesModalOpen}
                    toggleModal={handleTogglePreviewAnalyticsOverrideModal}
                    messageApi={messageApi}
                />
                {contextHolder}
                <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                    {/* <Title level={4} style={{ marginBottom: 0 }}>
                        {asset.aladdinId} — <Text type="secondary">{'Aladdin Id'}</Text>
                    </Title> */}

                    {/* We don't know what the other states are- assuming completed */}
                    <Space align="end">
                        {/* <Tag>{asset.status}</Tag> */}

                        <Form.Item label={null} noStyle>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={actionLoading}
                                disabled={saveOverridesDisabled}
                            >
                                Save Analytics
                            </Button>
                        </Form.Item>

                        <Tooltip title="Preview Analytics Override">
                            <Button
                                type="primary"
                                onClick={handleTogglePreviewAnalyticsOverrideModal}
                            >
                                <FileOutlined />
                                Preview Analytics
                            </Button>
                        </Tooltip>

                        <Button
                            type="primary"
                            onClick={handlePublishAnalytics}
                            loading={actionLoading}
                            disabled={publishAnalyticsDisabled}
                        >
                            Publish Analytics
                        </Button>

                        <Button
                            type="primary"
                            onClick={handleVerifyOnAladdin}
                            loading={actionLoading}
                            disabled={verifyOnAladdinDisabled}
                        >
                            Publish to TDC
                        </Button>
                    </Space>
                </Space>

                <AnalyticsFormLayout asset={asset as NewAssetAnalytics} selectedRow={selectedRow} />
            </Form>
        </>
    );
};
