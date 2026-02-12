/* eslint-disable @typescript-eslint/no-explicit-any */

// Component is semi-refactored to use the newassetstable generic. Need to move statusstates out and any other helpers.
import { useCallback, useEffect, useState } from 'react';
import { Button, message, Form, Tag, Divider, Tooltip } from 'antd';

import { AnalyticsInputRequestCollection, NewAsset, NoteType } from '../../lib/types';
import {
    getModelInputById,
    postNewAssetStatus,
    publishAnalyticsInput,
    updateAnalyticsInputOverrides,
} from '../../lib/services';
import { useUserInfo } from '@platform/utils';

import {
    extractCallDate,
    extractCollateralType,
    formatIso,
    normalizeStatus,
} from '../../lib/helpers';
import { ModelInputAssumptions } from './components/ModelInputAssumptions';
import { Notes } from '../Notes';
import PreviewBondFeaturesModal from './components/PreviewBondFeaturesModal';
import PreviewStaticScenariosModal from './components/PreviewStaticScenariosModal';

type ModelInputsOverridesProps = {
    selectedRowRequestId?: number | null;
};

const CollateralTypesWithBondFeatureEnabled = ['NQM', 'CES', 'NPL'];

export function ModelInputsOverrides({ selectedRowRequestId }: ModelInputsOverridesProps) {
    const [form] = Form.useForm();
    const [assetInfo, setAssetInfo] = useState<NewAsset | null>(null);
    const [note, setNote] = useState<NoteType | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();
    const userInfo = useUserInfo();
    const username = userInfo.email;

    console.log(assetInfo);

    const checkIsBondFeaturesDisabled = useCallback(() => {
        if (!assetInfo) {
            return true;
        }
        const assetInfoCollateralType = extractCollateralType(assetInfo?.payload);

        return !CollateralTypesWithBondFeatureEnabled.some(
            (collatType) => collatType === assetInfoCollateralType
        );
    }, [assetInfo]);

    const [isBondPreviewModalOpen, setIsBondPreviewModalOpen] = useState(false);
    const [isScenariosPreviewModalOpen, setIsScenariosPreviewModalOpen] = useState(false);

    const handleToggleBondPreviewModal = useCallback(() => {
        setIsBondPreviewModalOpen((prevState) => !prevState);
    }, []);

    const handleToggleScenariosPreviewModal = useCallback(() => {
        setIsScenariosPreviewModalOpen((prevState) => !prevState);
    }, []);
    /**
     * Get the Asset Analytics Setup Id and render the contents
     * @param asset The selected Asset
     */
    const fetchAssetInfo = () => {
        // Call the get analytics by input id endpoint
        getModelInputById(selectedRowRequestId as number)
            .then((a: any) => {
                const itemObj = a?.data?.response;
                const item: NewAsset = {
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
                };
                setAssetInfo(item);
                setNote(a.data.notes.response[0]);
            })
            .catch((e) => {
                console.warn(e);
            });
    };

    useEffect(() => {
        form.setFieldValue('selectStatus', assetInfo?.status);
        form.setFieldValue('priceInput', assetInfo?.price);
        form.setFieldValue('callDateInput', extractCallDate(assetInfo?.payload));
        form.setFieldValue('analysisDateInput', assetInfo?.analysisDate);
        form.setFieldValue('collateralType', extractCollateralType(assetInfo?.payload));
        form.setFieldValue('noteTextArea', note?.noteText);
        // resetNoteInput();
    }, [assetInfo]);

    useEffect(() => {
        if (selectedRowRequestId) {
            fetchAssetInfo();
        }
    }, [selectedRowRequestId]);

    const canPublish =
        !!assetInfo?.status &&
        normalizeStatus(assetInfo?.status) === 'ANALYTICS INPUT PENDING REVIEW';
    const canVerifyInAladdin = assetInfo?.status === 'ANALYTICS INPUT SENT TO ALADDIN';
    const canSave = assetInfo?.status === 'ANALYTICS INPUT PENDING REVIEW';

    const saveInputOverrides = async () => {
        setIsLoading(true);
        try {
            const requestPayload = {
                assets: [
                    {
                        assetAnalyticsSetupId: assetInfo?.assetAnalyticsSetupId,
                        assetClass: assetInfo?.assetClass,
                        instrumentType: assetInfo?.instrumentType,
                        newAssetRequestId: assetInfo?.newAssetRequestId,
                        aladdinId: assetInfo?.aladdinId,
                        assetType: assetInfo?.assetType,
                        analysisDate: form.getFieldValue('analysisDateInput'),
                        price: form.getFieldValue('priceInput'),
                        payload: [
                            {
                                type: 'CALL_DATE',
                                parameters: { callDate: form.getFieldValue('callDateInput') },
                            },
                            {
                                type: 'COLLATERAL_TYPE',
                                parameters: {
                                    collateralType: form.getFieldValue('collateralType'),
                                },
                            },
                        ],
                        cdiCduBlob: assetInfo?.cdiCduBlob,
                        modifiedBy: username,
                        assetSubType: null,
                        noteType: 'AIOR',
                        noteText: form.getFieldValue('noteTextArea'),
                    },
                ],
            };
            const response = await updateAnalyticsInputOverrides(requestPayload as any);
            const callDate = extractCallDate(response.data.response[0].payload);
            form.setFieldValue('callDateInput', callDate);
            form.setFieldValue('collateralType', extractCollateralType(assetInfo?.payload));
            form.setFieldValue('analysisDateInput', assetInfo?.analysisDate);
            form.setFieldValue('noteTextArea', '');
            fetchAssetInfo();
        } catch (err: any) {
            message.error(
                err?.response?.data?.message ?? 'Failed to verify analytics. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAnalyticsInput = async () => {
        const status = 'Analytics Input Verified in Aladdin';

        if (!assetInfo) {
            console.warn('Please select a security from the table first.');
            return;
        }
        setIsLoading(true);
        if (!username) {
            setIsLoading(false);
            throw Error('There must be a user signed in to update status');
        }
        const payload = {
            assetAnalyticsSetupId: selectedRowRequestId as number,
            status,
            updatedBy: username,
        };

        try {
            await postNewAssetStatus(payload);
            fetchAssetInfo();
            messageApi.success('Status updated successfully.');
        } catch (err: any) {
            console.error('Failed to update status:', err);
            messageApi.error(
                err?.response?.data?.message ?? 'Failed to update status. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const publishOverrides = async ({
        price: editedPrice,
        callDate: editedCallDate,
    }: {
        price: number | null;
        callDate: string;
    }) => {
        if (!assetInfo) {
            messageApi.warning('Please select a security from the table first.');
            return;
        }
        if (!canPublish) {
            messageApi.warning('Status must be "ANALYTICS INPUT PENDING REVIEW" to publish.');
            return;
        }
        setIsLoading(true);

        const effectivePrice =
            typeof editedPrice === 'number'
                ? editedPrice
                : typeof assetInfo.price === 'number'
                  ? assetInfo.price
                  : null;

        let effectiveCallDate = (editedCallDate ?? '').trim();
        if (!effectiveCallDate) {
            const raw = assetInfo?.payload;
            effectiveCallDate = (typeof raw === 'string' ? extractCallDate(raw) : undefined) ?? '';
        }

        const collateralType =
            (typeof assetInfo?.payload === 'string'
                ? extractCollateralType(assetInfo?.payload)
                : undefined) ?? '';

        if (effectivePrice == null || Number.isNaN(effectivePrice) || effectivePrice <= 0) {
            messageApi.error('Please provide a valid positive price before publishing.');
            setIsLoading(false);
            return;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveCallDate)) {
            messageApi.error('Please provide a call date in YYYY-MM-DD format before publishing.');
            setIsLoading(false);
            return;
        }

        const payload: AnalyticsInputRequestCollection = {
            analyticsInput: [
                {
                    assetAnalyticsSetupId: selectedRowRequestId as number,
                    aladdinId: assetInfo.aladdinId,
                    assetType: assetInfo.assetType,
                    price: effectivePrice,
                    updatedBy: username,
                    payload: [
                        {
                            type: 'CALL_DATE',
                            parameters: { callDate: effectiveCallDate },
                        },
                        {
                            type: 'COLLATERAL_TYPE',
                            parameters: { collateralType: collateralType },
                        },
                    ],
                },
            ],
        };
        try {
            await publishAnalyticsInput(payload);
            messageApi.success('Analytics inputs published successfully.');
            fetchAssetInfo();
        } catch (err: any) {
            console.error('Failed to publish analytics inputs:', err);
            messageApi.error(
                err?.response?.data?.message ??
                    'Failed to publish analytics inputs. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form
            form={form}
            onFinish={async () => {
                await saveInputOverrides();
            }}
        >
            {contextHolder}
            <PreviewBondFeaturesModal
                assetAnalyticsSetupId={selectedRowRequestId as number}
                toggleModal={handleToggleBondPreviewModal}
                isOpen={isBondPreviewModalOpen}
                aladdinId={assetInfo?.aladdinId as string}
                messageApi={messageApi}
            />
            <PreviewStaticScenariosModal
                assetAnalyticsSetupId={selectedRowRequestId as number}
                toggleModal={handleToggleScenariosPreviewModal}
                isOpen={isScenariosPreviewModalOpen}
                aladdinId={assetInfo?.aladdinId as string}
                messageApi={messageApi}
            />
            <div
                style={{
                    paddingRight: '32px',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                }}
            >
                <h3 style={{ textAlign: 'left' }}>Analytics Input Assumptions</h3>
                <Tag>{assetInfo?.status}</Tag>
            </div>
            <div className="ModelInputsOverridesContainer">
                <div
                    style={{
                        paddingRight: '32px',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        display: 'flex',
                        width: '100%',
                    }}
                >
                    <div className="ModelInputAssumptionsContainer">
                        <ModelInputAssumptions
                            price={assetInfo?.price ?? null}
                            callDate={extractCallDate(assetInfo?.payload)}
                            collateralType={extractCollateralType(assetInfo?.payload)}
                            analysisDate={assetInfo?.analysisDate}
                            disabled={!assetInfo}
                        />

                        <div className="assumptionsActions">
                            <Form.Item>
                                <Button
                                    type="primary"
                                    loading={isLoading}
                                    htmlType="submit"
                                    disabled={!canSave}
                                >
                                    Save Input Overrides
                                </Button>
                            </Form.Item>
                            <Tooltip
                                title={
                                    checkIsBondFeaturesDisabled()
                                        ? 'Available only for NQM, CES or NPL Collateral Types'
                                        : null
                                }
                            >
                                <Button
                                    className="previewBondFeatures"
                                    type="primary"
                                    disabled={
                                        !canPublish || isLoading || checkIsBondFeaturesDisabled()
                                    }
                                    onClick={handleToggleBondPreviewModal}
                                >
                                    Preview Bond Features
                                </Button>
                            </Tooltip>
                            <Tooltip title="Preview Static Scenarios">
                                <Button
                                    className="previewStaticScenarios"
                                    type="primary"
                                    disabled={!canPublish || isLoading}
                                    onClick={handleToggleScenariosPreviewModal}
                                >
                                    Preview Static Scenarios
                                </Button>
                            </Tooltip>
                            <Button
                                className="saveOverride"
                                type="primary"
                                disabled={!canPublish || isLoading}
                                onClick={async () => {
                                    await publishOverrides({
                                        price: form.getFieldValue('priceInput'),
                                        callDate: form.getFieldValue('callDateInput'),
                                    });
                                }}
                            >
                                Publish
                            </Button>
                            {/* <Button
                                className="previewStaticScenarios"
                                type="primary"
                                disabled={!canVerifyInAladdin}
                                // onClick={async () => {
                                //     await publishOverrides({
                                //         price: form.getFieldValue('priceInput'),
                                //         callDate: form.getFieldValue('callDateInput'),
                                //     });
                                //     fetchAssetInfo();
                                // }}
                            >
                                Download Published Files
                            </Button>                             */}
                            <Button
                                type="primary"
                                disabled={!canVerifyInAladdin}
                                loading={isLoading}
                                onClick={async () => {
                                    await verifyAnalyticsInput();
                                }}
                            >
                                Run Analytics
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Divider />
            <div style={{ maxHeight: 'calc(100vh - 700px)', height: '100%', overflow: 'auto' }}>
                <Notes
                    selectedRow={assetInfo}
                    noteType="AIOR"
                    //isNoteEditable={selectedRow?.status === 'ANALYTICS INPUT PENDING REVIEW'}
                />
            </div>
        </Form>
    );
}
