import { useEffect, useState } from 'react';
import { Button, Divider, Form, message } from 'antd';
import { TimeElapsed } from './components/TimeElapsed';
import { AssetInfoItem } from './components/AssetInfoItem';
import { checkIsTimerShown, convertDateToPST } from './lib/helpers';
import { getModelInputById } from './lib/services';
import { NewAssetType } from './lib/types';
import { ClaimAssetPayload } from '../../lib/types';
import { claimAsset } from '../../lib/services';
import { useUserInfo } from '@platform/utils';
import { updateAnalyticsInputOverrides } from '../../lib/services';

import { extractCallable, extractCallDate, extractCollateralType, extractDefaultSpeed, extractDefaultType, extractDelinquency, extractPrepaymentSpeed, extractPrepaymentType, extractSeverity } from '../../lib/helpers';
import { AssetInfoInput } from './components/AssetInfoInput';
import { AssetInfoSelectCollateralType } from './components/AssetInfoSelectCollateralType';
import { AssetInfoDatePicker } from './components/AssetInfoDatePicker';
import { NoteType } from '../../shared/types';
import { AssetInfoCallable } from './components/AssetInfoCallable';
import { AssetInfoPrepaymentType } from './components/AssetInfoPrepaymentType';
import { AssetInfoDefaultType } from './components/AssetInfoDefaultType';

export const AssetInfo = ({
    selectedAssetId,
    latestUpdateTimestamp,
}: {
    selectedAssetId?: number | null;
    latestUpdateTimestamp: number;
}) => {
    const [assetInfo, setAssetInfo] = useState<NewAssetType | null>(null);
    const user = useUserInfo();
    const [form] = Form.useForm();
    const [note, setNote] = useState<NoteType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();

    const canSave = assetInfo?.status === 'ANALYTICS INPUT PENDING REVIEW' || assetInfo?.status === 'MANUAL';

    useEffect(() => {
        if (selectedAssetId) {
            getModelInputById(selectedAssetId).then(({ data }) => {
                setAssetInfo(data.response);
                setNote(data.notes.response[0]);
            });
        }
    }, [selectedAssetId, latestUpdateTimestamp]);

    const handleClaim = () => {
        // Generate the Claim Payload
        const payload: ClaimAssetPayload = {
            claims: [
                {
                    anchorType: 'NAAID',
                    anchorId: selectedAssetId as number,
                    claimedBy: user.email as string,
                },
            ],
        };

        // Call the Claim
        claimAsset(payload).catch((e) => {
            console.warn(e);
        });
    };
    useEffect(() => {
        form.setFieldValue('selectStatus', assetInfo?.status);
        form.setFieldValue('priceInput', assetInfo?.price);
        form.setFieldValue('callDateInput', extractCallDate(assetInfo?.payload));
        form.setFieldValue('analysisDateInput', assetInfo?.analysisDate);
        form.setFieldValue('collateralType', extractCollateralType(assetInfo?.payload));
        form.setFieldValue('callable', extractCallable(assetInfo?.payload));
        form.setFieldValue('prepaymentType', extractPrepaymentType(assetInfo?.payload));
        form.setFieldValue('prepaymentSpeedInput', extractPrepaymentSpeed(assetInfo?.payload));
        form.setFieldValue('defaultType', extractDefaultType(assetInfo?.payload));
        form.setFieldValue('defaultSpeedInput', extractDefaultSpeed(assetInfo?.payload));
        form.setFieldValue('severityInput', extractSeverity(assetInfo?.payload));
        form.setFieldValue('delinquencyInput', extractDelinquency(assetInfo?.payload));
        form.setFieldValue('noteTextArea', note?.noteText);
    }, [assetInfo]);

    useEffect(() => {
        if (!selectedAssetId) {
            form.resetFields();
            setAssetInfo(null);
        }
    }, [selectedAssetId]);

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
                            {
                                "type": "CALLABLE",
                                "parameters": {
                                    "callable": form.getFieldValue('callable')
                                }
                            },
                            {
                                "type": "SPEED_OVERRIDES",
                                "parameters": {
                                    "prepaymentType": form.getFieldValue('prepaymentType'),
                                    "prepaymentSpeed": form.getFieldValue('prepaymentSpeedInput') as number,
                                    "defaultType": form.getFieldValue('defaultType'),
                                    "defaultSpeed": form.getFieldValue('defaultSpeedInput') as number,
                                    "severity": form.getFieldValue('severityInput') as number,
                                    "delinquency": form.getFieldValue('delinquencyInput') as number,
                                }
                            }
                        ],
                        cdiCduBlob: assetInfo?.cdiCduBlob,
                        modifiedBy: user.email,
                        assetSubType: null,
                        noteType: 'AIOR',
                        noteText: form.getFieldValue('noteTextArea'),
                    },
                ],
            };
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const response = await updateAnalyticsInputOverrides(requestPayload as any);
            const callDate = extractCallDate(response.data.response[0].payload);
            form.setFieldValue('callDateInput', callDate);
            form.setFieldValue('collateralType', extractCollateralType(assetInfo?.payload));
            form.setFieldValue('analysisDateInput', assetInfo?.analysisDate);
            form.setFieldValue('noteTextArea', '');
            form.setFieldValue('callable', extractCallable(assetInfo?.payload));
            form.setFieldValue('prepaymentType', extractPrepaymentType(assetInfo?.payload));
            form.setFieldValue('prepaymentSpeed', extractPrepaymentSpeed(assetInfo?.payload));
            form.setFieldValue('defaultType', extractDefaultType(assetInfo?.payload));
            form.setFieldValue('defaultSpeed', extractDefaultSpeed(assetInfo?.payload));
            form.setFieldValue('severity', extractSeverity(assetInfo?.payload));
            form.setFieldValue('delinquency', extractDelinquency(assetInfo?.payload));

            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } catch (err: any) {
            messageApi.error(
                err?.response?.data?.message ?? 'Failed to override Model Inputs. Please try again.'
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
            <div className="assetInfoContainer">
                <div style={{ flex: 1 }}>
                    <AssetInfoItem title="Aladdin ID" value={assetInfo?.aladdinId} />
                    <AssetInfoItem
                        title="Internal Asset ID"
                        value={assetInfo?.assetAnalyticsSetupId}
                    />
                    <AssetInfoItem title="Asset Type" value={assetInfo?.assetType} />
                    <AssetInfoSelectCollateralType
                        title="Collateral Type"
                        value={extractCollateralType(assetInfo?.payload)}
                    />
                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: 1 }}>
                    <AssetInfoItem title="Current State" value={assetInfo?.status} />
                    <AssetInfoItem
                        title="Analytics Date/Time Start"
                        value={convertDateToPST(assetInfo?.createdDate)}
                    />
                    {checkIsTimerShown(assetInfo?.status) ? (
                        <TimeElapsed
                            title="Time since requested"
                            initialDate={assetInfo?.createdDate}
                            selectedAssetId={selectedAssetId}
                        />
                    ) : null}
                    {checkIsTimerShown(assetInfo?.status) ? (
                        <TimeElapsed
                            title="Time in Current State"
                            initialDate={assetInfo?.lastModifiedDate}
                            selectedAssetId={selectedAssetId}
                        />
                    ) : null}
                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: 0.8 }}>
                    <AssetInfoInput
                        title="Price"
                        value={assetInfo?.price}
                        formItemName="priceInput"
                        inputType="number"
                        required= {true}
                        controls={false}
                    />
                    <AssetInfoDatePicker
                        title="Analysis Date"
                        value={assetInfo?.analysisDate}
                        formItemName="analysisDateInput"
                    />
                    <AssetInfoCallable
                        title="Callable"
                        value={extractCallable(assetInfo?.payload)}
                    />
                    <AssetInfoDatePicker
                        title="Call Date"
                        value={extractCallDate(assetInfo?.payload)}
                        formItemName="callDateInput"
                    />
                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: 0.5 }}>
                    <AssetInfoPrepaymentType
                        title="Prepayment Type"
                        value={extractPrepaymentType(assetInfo?.payload)}
                    />
                    <AssetInfoInput
                        title="Prepayment Speed"
                        value={extractPrepaymentSpeed(assetInfo?.payload)}
                        formItemName="prepaymentSpeedInput"
                        inputType="number"
                        required= {false}
                        controls={false}
                    />
                    <AssetInfoDefaultType
                        title="Default Type"
                        value={extractDefaultType(assetInfo?.payload)}
                    />
                    <AssetInfoInput
                        title="Default Speed"
                        value={extractDefaultSpeed(assetInfo?.payload)}
                        formItemName="defaultSpeedInput"
                        inputType="number"
                        controls={false}
                    />
                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: '0 1 0%' }}>
                    <AssetInfoInput
                        title="Severity"
                        value={extractSeverity(assetInfo?.payload)}
                        formItemName="severityInput"
                        inputType="number"
                        controls={false}
                    />
                    <AssetInfoInput
                        title="Delinquency"
                        value={extractDelinquency(assetInfo?.payload)}
                        formItemName="delinquencyInput"
                        inputType="number"
                        controls={false}
                    />
                    <AssetInfoItem title="Claimed By" value={assetInfo?.claimedBy} />
                    <AssetInfoItem
                        title="Claimed At"
                        value={convertDateToPST(assetInfo?.claimedAt ?? '')}
                    />
                    <Form.Item noStyle>
                        <div style={{ display: 'flex', paddingTop: 10, paddingBottom: 4 }}>
                            <Button
                                className="claimButton"
                                onClick={handleClaim}
                                size="small"
                                disabled={!selectedAssetId || user.email === assetInfo?.claimedBy}
                            >
                                Take Over Claim
                            </Button>
                        </div>
                    </Form.Item>
                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: 1.5 }}>
                    <AssetInfoInput
                        title="Override Reason"
                        value={assetInfo?.price}
                        inputType="textArea"
                        formItemName="noteTextArea"
                        style={{ minHeight: 160, width: '90%' }}
                        required= {true}
                    />
                    <Form.Item noStyle>
                        <div style={{ display: 'flex', justifyContent: 'end', paddingBottom: 4 }}>
                            <Button
                                loading={isLoading}
                                htmlType="submit"
                                size="small"
                                className="claimButton"
                                disabled={!canSave}
                            >
                                Save Input Overrides
                            </Button>
                        </div>
                    </Form.Item>
                </div>
            </div>
        </Form>
    );
};
