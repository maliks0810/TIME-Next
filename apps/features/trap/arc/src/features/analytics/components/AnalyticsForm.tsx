/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import {
    Descriptions,
    Space,
    Divider,
    Button,
    message,
    Input,
    Form,
    InputNumber,
    Tooltip,
} from 'antd';
import { useUserInfo } from '@platform/utils';
import { FileOutlined } from '@ant-design/icons';

import { AnalyticsRequest, NewAsset, NewAssetAnalytics, NoteType } from '../../../lib/types';
import {
    postVerifyAnalytics,
    postVerifyAnalyticsOnAladdin,
    publishAnalytics,
    updateAnalyticsOverrides,
    previewAnalyticsOverrideAPI,
} from '../../../lib/services';

import { normalizeStatus, nullspace, convertDateToPST } from '../../../lib/helpers';
import { Notes } from '../../Notes';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [clickedVAById, setClickedVAById] = useState<Record<number, boolean>>({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [clickedVOAById, setClickedVOAById] = useState<Record<number, boolean>>({});
    const [form] = Form.useForm();
    const userInfo = useUserInfo();
    const username = userInfo.email;
    console.log(asset);

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

    useEffect(() => {
        if (assetId < 0) return; // no selected asset yet
        setClickedVAById((prev) => (assetId in prev ? prev : { ...prev, [assetId]: false }));
        setClickedVOAById((prev) => (assetId in prev ? prev : { ...prev, [assetId]: false }));
    }, [assetId]);

    const previewAnalyticsOverrides = async () => {
        if (!assetId) {
            message.warning('Please select a security from the table first.');
            return;
        }
        setActionLoading(true);

        const payload = {
            assetAnalyticsSetupId: asset?.assetAnalyticsSetupId as number,
            aladdinId: asset?.assetId as string,
        };
        try {
            const response = await previewAnalyticsOverrideAPI(payload);

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `preview_${asset?.aladdinId}_analytics_override.csv`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            a.remove();
            window.URL.revokeObjectURL(url);

            message.success(
                'Analytics Override Preview File Downloaded. Check Downloads on Browser'
            );
        } catch (err: any) {
            console.error('Failed to pull preview file:', err);
            message.error(
                err?.response?.data?.message ??
                    'Failed to download analytics override preview file. Please try again.'
            );
        } finally {
            setActionLoading(false);
        }
    };

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
            message.success('Analytics overrides sent.');
            onRefresh?.(assetId);
        } catch (err: any) {
            message.error(
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
            setClickedVAById((prev) => ({ ...prev, [assetId]: true }));
            message.success('Analytics verification sent.');
            onRefresh?.(assetId);
        } catch (err: any) {
            message.error(
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
            setClickedVOAById((prev) => ({ ...prev, [assetId]: true }));
            message.success('Verification on Aladdin recorded.');
            onRefresh?.(assetId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: any) {
            message.error('Failed to verify analytics on Aladdin. Please try again.');
            message.useMessage();
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
                                onClick={async () => {
                                    await previewAnalyticsOverrides();
                                }}
                            >
                                <FileOutlined/>
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

                <Divider style={{ margin: '12px 0' }} />
                <div
                    style={{
                        maxHeight: 'calc(100vh - 330px)',
                        overflow: 'auto',
                    }}
                >
                    <Descriptions title="Identification & Setup" size="small" column={3} bordered>
                        <Descriptions.Item label="Analytics Override Id">
                            {asset.analyticsOverrideId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Asset Analytics Setup Id">
                            {asset.assetAnalyticsSetupId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Asset Id">
                            {asset.assetId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Asset Id Type">
                            <Form.Item name="assetIdType" style={{ marginBottom: 0 }}>
                                <Input style={{ width: '100%' }} />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Currency">
                            <Form.Item name="currency" style={{ marginBottom: 0 }}>
                                <Input style={{ width: '100%' }} />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Curve Type">
                            <Form.Item name="curveType" style={{ marginBottom: 0 }}>
                                <Input style={{ width: '100%' }} />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Risk Date">
                            {convertDateToPST(asset.riskDate)}
                        </Descriptions.Item>
                        <Descriptions.Item label="KRD Bench CUSIP">
                            <Form.Item name="krdBenchCusip" style={{ marginBottom: 0 }}>
                                <Input style={{ width: '100%' }} />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="KRD Source">
                            <Form.Item name="krdSource" style={{ marginBottom: 0 }}>
                                <Input style={{ width: '100%' }} />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="KRD Date">
                            {convertDateToPST(asset.krdDate)}
                        </Descriptions.Item>
                    </Descriptions>
                    <br />

                    <Descriptions title="Pricing & Yields" size="small" column={4} bordered>
                        <Descriptions.Item label="Price">
                            <Form.Item name="price" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.price}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="Yield to Maturity">
                            <Form.Item name="yieldToMaturity" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.yieldToMaturity}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="Yield to Worst">
                            <Form.Item name="yieldToWorst" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.yieldToWorst}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="ZV Yield">
                            <Form.Item name="zvYield" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.zvYield}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="Real Yield">
                            <Form.Item name="realYield" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.realYield}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="Static Yield">
                            <Form.Item name="staticYield" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.staticYield}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="Spread to Worst">
                            <Form.Item name="spreadToWorst" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.spreadToWorst}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="OAS">
                            <Form.Item name="oas" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.oas}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="Static Spread">
                            <Form.Item name="oas1" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.oas1}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="ROR CBE">
                            <Form.Item name="rorCbe" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.rorCbe}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                    </Descriptions>

                    <br />
                    <Descriptions title="Durations & Convexity" size="small" column={4} bordered>
                        <Descriptions.Item label="OAD">
                            <Form.Item name="oad" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.oad}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Model OAD">
                            <Form.Item name="modelOad" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.modelOad}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="OAC">
                            <Form.Item name="oac" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.oac}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Model OAC">
                            <Form.Item name="modelOac" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.modelOac}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mod Duration">
                            <Form.Item name="modDur" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.modDur}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mod Duration (To Worst)">
                            <Form.Item name="modDurToWorst" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.modDurToWorst}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Spread Duration">
                            <Form.Item name="spdDur" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.spdDur}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Vol Dur">
                            <Form.Item name="volDur" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.volDur}
                                />
                            </Form.Item>
                        </Descriptions.Item>

                        <Descriptions.Item label="OAV">
                            <Form.Item name="oav" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.oav}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Infl Duration">
                            <Form.Item name="inflDuration" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.inflDuration}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Real Duration">
                            <Form.Item name="realDuration" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.realDuration}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="SPRD Off WAL">
                            <Form.Item name="sprdOffWal" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.sprdOffWal}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Volatility">
                            <Form.Item name="volatility" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.volatility}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Vol Conv">
                            <Form.Item name="volConv" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.volConv}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                    </Descriptions>
                    <br />
                    <Descriptions title="WAL / ZV WAL" size="small" column={3} bordered>
                        <Descriptions.Item label="WAL">
                            <Form.Item name="wal" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.wal}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="WAL to Worst">
                            <Form.Item name="walToWorst" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.walToWorst}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="ZV WAL">
                            <Form.Item name="zvWal" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.zvWal}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                    </Descriptions>
                    <br />
                    <Descriptions title="Key Rate Durations (KRD)" size="small" column={4} bordered>
                        <Descriptions.Item label="3M">
                            <Form.Item name="krd3M" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd3M}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="1Y">
                            <Form.Item name="krd1Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd1Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="2Y">
                            <Form.Item name="krd2Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd2Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="3Y">
                            <Form.Item name="krd3Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd3Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="5Y">
                            <Form.Item name="krd5Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd5Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="7Y">
                            <Form.Item name="krd7Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd7Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="10Y">
                            <Form.Item name="krd10Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd10Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="15Y">
                            <Form.Item name="krd15Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd15Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="20Y">
                            <Form.Item name="krd20Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd20Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="25Y">
                            <Form.Item name="krd25Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd25Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="30Y">
                            <Form.Item name="krd30Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd30Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="40Y">
                            <Form.Item name="krd40Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    controls={false}
                                    value={asset.krd40Y}
                                />
                            </Form.Item>
                        </Descriptions.Item>
                        {/* <Descriptions.Item label="50Y">
                            <Form.Item name="krd50Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    controls={false}
                                    value={asset.krd50Y}
                                />
                            </Form.Item>
                        </Descriptions.Item> */}
                    </Descriptions>
                    <br />
                    <Descriptions title="Processing & Audit" size="small" column={3} bordered>
                        <Descriptions.Item label="File Processing Status">
                            {asset.fileProcessingStatus}
                        </Descriptions.Item>
                        <Descriptions.Item label="Retry Count">
                            {asset.retryCount ?? nullspace}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Attempt Date">
                            {asset.lastAttemptDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="BRS File Name">
                            {asset.brsFileName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created By">{asset.createdBy}</Descriptions.Item>
                        <Descriptions.Item label="Created Date">
                            {convertDateToPST(asset.createdDate)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Modified By">
                            {asset.lastModifiedBy}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Modified Date">
                            {convertDateToPST(asset.lastModifiedDate)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">{asset.status}</Descriptions.Item>
                        <Descriptions.Item label="Claimed By">{asset.claimedBy}</Descriptions.Item>
                        <Descriptions.Item label="Claimed At">
                            {convertDateToPST(asset.claimedAt ?? '')}
                        </Descriptions.Item>
                    </Descriptions>
                    <br />
                    <Descriptions size="small" column={3} bordered>
                        <Descriptions.Item label="Note">
                            <Form.Item name="noteTextArea">
                                <Input.TextArea />
                            </Form.Item>
                        </Descriptions.Item>
                    </Descriptions>
                    <Notes selectedRow={selectedRow} noteType={'AOR'} />
                </div>
            </Form>
        </>
    );
};
