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
import { PayloadItem } from '../../lib/types';
import { extractCallable, extractCallDate, extractCollateralType, extractDefaultSpeed, extractDefaultType, extractDelinquency, extractPrepaymentSpeed, extractPrepaymentType, extractSeverity, hasValue, extractCallDateText, extractInfoInterestRateScenarioType, extractInfoModelFamilyOverrideType, extractOriginalAssetSetupId, extractInfoModelFamilyOverrideForAnalyticsInputsType, extractInfoAcceptModelOutputsType } from '../../lib/helpers';
import { AssetInfoInput } from './components/AssetInfoInput';
import { AssetInfoSelectCollateralType } from './components/AssetInfoSelectCollateralType';
import { AssetInfoDatePicker } from './components/AssetInfoDatePicker';
import { NoteType } from '../../shared/types';
import { AssetInfoCallable } from './components/AssetInfoCallable';
import { AssetInfoPrepaymentType } from './components/AssetInfoPrepaymentType';
import { AssetInfoDefaultType } from './components/AssetInfoDefaultType';
import { AssetInfoInterestRateScenarioType } from './components/AssetInfoInterestRateScenarioType';
import { AssetInfoModelFamilyOverrideType } from './components/AssetInfoModelFamilyOverrideType';
import { PREPAYMENT_TYPE_OPTIONS_ALL, PREPAYMENT_TYPE_OPTIONS_CMBS } from '../../shared/constants';
import { AssetInfoSwitchAcceptModelOutputs } from './components/AssetInfoSwitchAcceptModelOutputs';
import { useLocation } from 'react-router-dom';

export const AssetInfo = ({
    latestUpdateTimestamp,
}: {
    latestUpdateTimestamp: number;
}) => {
    const [assetInfo, setAssetInfo] = useState<NewAssetType | null>(null);
    const user = useUserInfo();
    const [form] = Form.useForm();
    const [note, setNote] = useState<NoteType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();

    const callableVal = Form.useWatch('callable', form);
    const callDateVal = Form.useWatch('callDateInput', form);
    const priceVal = Form.useWatch('priceInput', form);
    const analysisDateVal = Form.useWatch('analysisDateInput', form);
    const collateralTypeVal = Form.useWatch('collateralType', form);
    const overrideNotesVal = Form.useWatch('noteTextArea', form);
    const prepaymentType = Form.useWatch('prepaymentType', form);
    const defaultType = Form.useWatch('defaultType', form);
    const applyMultiplierVal = Form.useWatch('applyMultiplierEnabled', form);
    const multiplierInputValue = Form.useWatch('multiplierValue', form);
    const modelFamilyOverride = Form.useWatch('modelFamilyOverrideType', form);
    const prepayTypeOptions = modelFamilyOverride === 'BRS v2.2'
        ? PREPAYMENT_TYPE_OPTIONS_CMBS
        : PREPAYMENT_TYPE_OPTIONS_ALL;
    const interestRateScenarioValue = Form.useWatch('interestRateScenarioType', form);
    const modelFamilyOverrideForAnalyticsInputsValue = Form.useWatch('modelFamilyOverrideForAnalyticsType', form);
    const acceptModelOutputsValue = Form.useWatch('acceptModelOutputs', form);

    const prepaymentTypeValue = Form.useWatch('prepaymentType', form);
    const prepaymentSpeedValue = Form.useWatch('prepaymentSpeedInput', form);
    const defaultTypeValue = Form.useWatch('defaultType', form);
    const defaultSpeedValue = Form.useWatch('defaultSpeedInput', form);
    const severityValue = Form.useWatch('severityInput', form);
    const delinquencyValue = Form.useWatch('delinquencyInput', form);
    const originalAssetSetupIdValue = Form.useWatch('originalAssetSetupIdInput', form);



    const isCallDateValid = (callableVal === 'Y' || callableVal === 'C') ? hasValue(callDateVal) : true;
    const canSave = hasValue(callableVal) && isCallDateValid && hasValue(priceVal) && hasValue(analysisDateVal) && hasValue(collateralTypeVal) && hasValue(overrideNotesVal);

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }
    const query = useQuery();
    const selectedAssetIdParam = query.get('assetId');
    const selectedAssetId = selectedAssetIdParam ? Number(selectedAssetIdParam) : null;
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
                },
            ],
        };

        // Call the Claim
        claimAsset(payload).catch((e) => {
            console.warn(e);
        });
    };
    useEffect(() => {
        const callableInputVal = extractCallable(assetInfo?.payload);
        const callDateInputVal = callableInputVal === 'Y' ? extractCallDate(assetInfo?.payload) : (callableInputVal === 'C' ? extractCallDateText(assetInfo?.payload) : '');
        form.setFieldValue('callable', callableInputVal);
        form.setFieldValue('selectStatus', assetInfo?.status);
        form.setFieldValue('priceInput', assetInfo?.price);
        form.setFieldValue('callDateInput', callDateInputVal);
        form.setFieldValue('analysisDateInput', assetInfo?.analysisDate);
        form.setFieldValue('collateralType', extractCollateralType(assetInfo?.payload));
        form.setFieldValue('prepaymentType', extractPrepaymentType(assetInfo?.payload));
        form.setFieldValue('prepaymentSpeedInput', extractPrepaymentSpeed(assetInfo?.payload));
        form.setFieldValue('defaultType', extractDefaultType(assetInfo?.payload));
        form.setFieldValue('defaultSpeedInput', extractDefaultSpeed(assetInfo?.payload));
        form.setFieldValue('severityInput', extractSeverity(assetInfo?.payload));
        form.setFieldValue('delinquencyInput', extractDelinquency(assetInfo?.payload));
        form.setFieldValue('originalAssetSetupIdInput', extractOriginalAssetSetupId(assetInfo?.payload));
        form.setFieldValue('noteTextArea', note?.noteText);
        form.setFieldValue('interestRateScenarioType', extractInfoInterestRateScenarioType(assetInfo?.payload));
        form.setFieldValue('modelFamilyOverrideType', extractInfoModelFamilyOverrideType(assetInfo?.payload));
        form.setFieldValue('modelFamilyOverrideForAnalyticsType', extractInfoModelFamilyOverrideForAnalyticsInputsType(assetInfo?.payload));
        form.setFieldValue('acceptModelOutputs', extractInfoAcceptModelOutputsType(assetInfo?.payload));
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
            let payloadObj: PayloadItem[] = [];

            if (assetInfo?.payload != undefined) {
                try {
                    payloadObj = JSON.parse(assetInfo?.payload)?.payload;
                    if (!Array.isArray(payloadObj)) {
                        // If parsed result is not an array, fallback to empty array  
                        payloadObj = [];
                    }
                } catch {
                    // If JSON parsing fails, fallback to empty array  
                    payloadObj = [];
                }
            }
            // Helper function to update or add a payload node by type  
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const updateOrAddPayloadNode = (type: any, newParams: Record<string, any>) => {
                const index = payloadObj.findIndex((item) => item.type === type);
                if (index !== -1) {
                    // Merge new parameters into existing parameters  
                    payloadObj[index].parameters = {
                        ...payloadObj[index].parameters,
                        ...newParams,
                    };
                } else {
                    // Add new node if it doesn't exist  
                    payloadObj.push({
                        type,
                        parameters: newParams,
                    });
                }
            };

            // Update or add nodes accordingly  
            if (hasValue(collateralTypeVal)) {
                updateOrAddPayloadNode('COLLATERAL_TYPE', { collateralType: collateralTypeVal });
            }

            if (hasValue(callableVal)) {
                updateOrAddPayloadNode('CALLABLE', { callable: callableVal });
            }

            if ((callableVal === 'Y' || callableVal === 'C') && hasValue(callDateVal)) {
                updateOrAddPayloadNode('CALL_DATE', { callDate: callDateVal });
            }

            if (hasValue(applyMultiplierVal) || hasValue(multiplierInputValue)) {
                updateOrAddPayloadNode('OAD_OAC_MULTIPLIER', { applyMultiplier: applyMultiplierVal, multiplierValue: multiplierInputValue });
            }

            if (
                hasValue(interestRateScenarioValue) ||
                hasValue(modelFamilyOverride) ||
                hasValue(modelFamilyOverrideForAnalyticsInputsValue) ||
                hasValue(acceptModelOutputsValue)
            ) {
                updateOrAddPayloadNode('SECURITY_SETTINGS', {
                    interestRateScenario: interestRateScenarioValue,
                    modelFamilyOverride: modelFamilyOverride,
                    modelFamilyOverrideForAnalytics: modelFamilyOverrideForAnalyticsInputsValue,
                    acceptModelOutputs: acceptModelOutputsValue,
                });
            }

            if (hasValue(originalAssetSetupIdValue)) {
                updateOrAddPayloadNode('CORRECTION', { assetAnalyticsSetupId: originalAssetSetupIdValue });
            }

            const speedOverridesParams = {
                ...(hasValue(prepaymentTypeValue) ? { prepaymentType: prepaymentTypeValue } : {}),
                ...(hasValue(prepaymentSpeedValue) ? { prepaymentSpeed: Number(prepaymentSpeedValue) } : {}),
                ...(hasValue(defaultTypeValue) ? { defaultType: defaultTypeValue } : {}),
                ...(hasValue(defaultSpeedValue) ? { defaultSpeed: Number(defaultSpeedValue) } : {}),
                ...(hasValue(severityValue) ? { severity: Number(severityValue) } : { severity: null }),
                ...(hasValue(delinquencyValue) ? { delinquency: Number(delinquencyValue) } : { delinquency: null }),
            };

            if (Object.keys(speedOverridesParams).length > 0) {
                updateOrAddPayloadNode('SPEED_OVERRIDES', speedOverridesParams);
            }

            // Now payloadObj is updated with new values without deleting existing nodes  
            const requestPayload = {
                assets: [
                    {
                        assetAnalyticsSetupId: assetInfo?.assetAnalyticsSetupId,
                        assetClass: assetInfo?.assetClass,
                        instrumentType: assetInfo?.instrumentType,
                        newAssetRequestId: assetInfo?.newAssetRequestId,
                        aladdinId: assetInfo?.aladdinId,
                        assetType: assetInfo?.assetType,
                        assetSubType: assetInfo?.assetSubType,
                        analysisDate: analysisDateVal,
                        price: priceVal,
                        payload: payloadObj,
                        cdiCduBlob: assetInfo?.cdiCduBlob,
                        noteType: 'AIOR',
                        noteText: overrideNotesVal,
                    },
                ],
            }
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
            form.setFieldValue('interestRateScenarioType', extractInfoInterestRateScenarioType(assetInfo?.payload));
            form.setFieldValue('modelFamilyOverrideType', extractInfoModelFamilyOverrideType(assetInfo?.payload));
            form.setFieldValue('modelFamilyOverrideForAnalyticsType', extractInfoModelFamilyOverrideForAnalyticsInputsType(assetInfo?.payload));
            form.setFieldValue('acceptModelOutputs', extractInfoAcceptModelOutputsType(assetInfo?.payload));

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
            onValuesChange={(changedValues) => {
                if (changedValues.hasOwnProperty('callable')) {
                    form.resetFields(['callDateInput']);
                }
            }}
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
                    {assetInfo?.status == 'CORRECTION' ? (
                        <AssetInfoInput
                            title="Original Asset ID"
                            value={extractOriginalAssetSetupId(assetInfo?.payload)}
                            formItemName="originalAssetSetupIdInput"
                            inputType="number"
                            controls={false}
                        />
                    ) : null}
                    <AssetInfoItem title="Asset Type" value={assetInfo?.assetType} />
                    <AssetInfoItem title="Asset Sub Type" value={assetInfo?.assetSubType} />
                    <AssetInfoSelectCollateralType
                        title="Collateral Type"
                        value={extractCollateralType(assetInfo?.payload)}
                    />
                    <AssetInfoItem title="Current State" value={assetInfo?.status} />
                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: 0.9 }}>
                    <AssetInfoInput
                        title="Price"
                        value={assetInfo?.price}
                        formItemName="priceInput"
                        inputType="number"
                        required={true}
                        controls={false}
                    />
                    <AssetInfoInterestRateScenarioType
                        value={extractInfoInterestRateScenarioType(assetInfo?.payload)}
                    />
                    <AssetInfoModelFamilyOverrideType
                        name="modelFamilyOverrideType"
                        title="Model Family Override For Scenario"
                        value={extractInfoModelFamilyOverrideType(assetInfo?.payload)}
                    />
                    <AssetInfoModelFamilyOverrideType
                        name="modelFamilyOverrideForAnalyticsType"
                        title="Model Family Override For Analytics"
                        value={extractInfoModelFamilyOverrideForAnalyticsInputsType(assetInfo?.payload)}
                    />

                    <AssetInfoSwitchAcceptModelOutputs value={extractInfoAcceptModelOutputsType(assetInfo?.payload)} />
                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: 0.7 }}>
                    <AssetInfoDatePicker
                        title="Analysis Date"
                        value={assetInfo?.analysisDate}
                        formItemName="analysisDateInput"
                        required={true}
                    />
                    {checkIsTimerShown(assetInfo?.status) ? (
                        <TimeElapsed
                            title="Time in Current State"
                            initialDate={assetInfo?.lastModifiedDate}
                            selectedAssetId={selectedAssetId}
                        />
                    ) : null}
                    {checkIsTimerShown(assetInfo?.status) ? (
                        <TimeElapsed
                            title="Time since requested"
                            initialDate={assetInfo?.createdDate}
                            selectedAssetId={selectedAssetId}
                        />
                    ) : null}
                    <AssetInfoCallable
                        title="Callable"
                        value={extractCallable(assetInfo?.payload)}
                        required={true}
                    />
                    {
                        (callableVal === 'Y' || callableVal === 'C')
                        && (
                            (callableVal === 'Y') ? <AssetInfoDatePicker
                                title="Call Date"
                                value={extractCallDate(assetInfo?.payload)}
                                formItemName="callDateInput"
                                required={true}
                            />
                                : <AssetInfoInput
                                    title="Call Date Text"
                                    value={extractCallDateText(assetInfo?.payload)}
                                    formItemName="callDateInput"
                                    inputType="input"
                                    required={true}
                                    style={{ width: 142 }}
                                />
                        )
                    }

                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: 0.5 }}>
                    <AssetInfoPrepaymentType
                        title="Prepayment Type"
                        value={extractPrepaymentType(assetInfo?.payload)}
                        options={prepayTypeOptions}
                    />
                    <AssetInfoInput
                        title="Prepayment Speed"
                        value={extractPrepaymentSpeed(assetInfo?.payload)}
                        formItemName="prepaymentSpeedInput"
                        inputType="number"
                        required={
                            hasValue(prepaymentType) ? true : false
                        }
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
                        required={
                            hasValue(defaultType)
                        }
                        controls={false}
                    />
                    <AssetInfoInput
                        title="Severity"
                        value={extractSeverity(assetInfo?.payload)}
                        formItemName="severityInput"
                        inputType="number"
                        controls={false}
                    />
                </div>
                <Divider type="vertical" style={{ height: '100%', padding: 0 }} />
                <div style={{ flex: 0.7 }}>

                    <AssetInfoInput
                        title="Delinquency"
                        value={extractDelinquency(assetInfo?.payload)}
                        formItemName="delinquencyInput"
                        inputType="number"
                        controls={false}
                    />
                    <AssetInfoItem title="Overnight Risk" value='Enabled' />
                    <AssetInfoItem title="OAD/OAC Multiplier" value='Enabled' />
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
                        style={{ minHeight: 210, width: '90%' }}
                        required={true}
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
