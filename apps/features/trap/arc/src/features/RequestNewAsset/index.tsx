import { Form, InputNumber, message, Modal, Select, Input, Switch } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useUserInfo } from '@platform/utils';
import { getMetaData, requestNewAsset } from '../../lib/services';
import { hasValue, TRAPDatePicker } from '../../lib/helpers';
import { MetaDataResponse, PayloadItem, RequestedNewAsset, RequestNewAssetPayload } from '../../lib/types';
import { CALLABLE_OPTIONS, PREPAYMENT_TYPE_OPTIONS_ALL, PREPAYMENT_TYPE_OPTIONS_CMBS } from '../../shared/constants';
import { useEffect, useState } from 'react';
import AssetTypeselect from './AssetTypeselect';

const initialFormValues = {
    assetClass: 'DEBT-FI',
    instrumentType: 'SD',
    assetType: 'NARMBS',
    interestRateScenario: 'Forward',
    modelFamilyOverride: 'BRS v6.5',
    modelFamilyOverrideForAnalytics: 'BRS v6.5'
};

export const RequestNewAsset = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const [form] = Form.useForm();
    const user = useUserInfo();
    const [messageApi, contextHolder] = message.useMessage();
    const [, setSearchParams] = useSearchParams();

    const price = Form.useWatch('priceInputNA', form);
    const aladdinId = Form.useWatch('aladdinId', form);
    const analysisDate = Form.useWatch('analysisDate', form);
    const collateralType = Form.useWatch('collateralType', form);
    const callable = Form.useWatch('callableInput', form);
    const callDate = Form.useWatch('callDateInputNA', form);
    const interestRateScenario = Form.useWatch('interestRateScenario', form);
    const modelFamilyOverride = Form.useWatch('modelFamilyOverride', form);
    const modelFamilyOverrideForAnalytics = Form.useWatch('modelFamilyOverrideForAnalytics', form);
    const prepayTypeOptions = modelFamilyOverride === 'BRS v2.2'
        ? PREPAYMENT_TYPE_OPTIONS_CMBS
        : PREPAYMENT_TYPE_OPTIONS_ALL;
    const defaultTypeInput = Form.useWatch('defaultTypeInput', form);
    const defaultSpeedInput = Form.useWatch('defaultSpeedInput', form);
    const prepaymentTypeInput = Form.useWatch('prepaymentTypeInput', form);
    const prepaymanetSpeedInput = Form.useWatch('prepaymanetSpeedInput', form);
    const severityInputFormValue = Form.useWatch('severityInput', form);
    const delinquencyInputFormValue = Form.useWatch('delinquencyInput', form);
    const acceptModelOutputsFormValue = Form.useWatch('acceptModelOutputs', form);
    const assetTypeFormValue = Form.useWatch('assetType', form);
    const assetSubTypeFormValue = Form.useWatch('assetSubType', form);
    const assetClassFormValue = Form.useWatch('assetClass', form);
    const instrumentTypeFormValue = Form.useWatch('instrumentType', form);
    const [metaData, setMetaData] = useState<MetaDataResponse | null>(null);
    const [selectedAssetTypeValue, setSelectedAssetTypeValue] = useState<string | null>(null);
    const [selectedAssetSubTypeValue, setSelectedAssetSubTypeValue] = useState<string | null>(null);
    const [selectedCollateralTypeValue, setSelectedCollateralTypeValue] = useState<string | null>(null);

    const handleResetForm = () => {
        form.resetFields([
            'aladdinId',
            'priceInputNA',
            'assetType',
            'assetSubType',
            'assetClass',
            'instrumentType',
            'collateralType',
            'callDateInputNA',
            'analysisDate',
            'callableInput',
            'prepaymentTypeInput',
            'prepaymanetSpeedInput',
            'defaultTypeInput',
            'defaultSpeedInput',
            'severityInput',
            'delinquencyInput',
            'interestRateScenario',
            'modelFamilyOverride',
            'modelFamilyOverrideForAnalytics'
        ]);
    };

    useEffect(() => {
        if (isOpen) {
            form.resetFields();
            setSelectedAssetTypeValue('NARMBS');
        }
    }, [isOpen, form]);

    const handleSelectAsset = (assetAnalyticsSetupId: number) => {
        const params = new URLSearchParams();
        params.set('assetId', assetAnalyticsSetupId + '');
        setSearchParams(params);
    };

    const buildNewAssetRequest = (
        //formInstance: FormInstance,
        currentUser: { email: string }
    ): RequestNewAssetPayload => {
        // pull raw values once (use your *actual* Form.Item names)
        const callableValue = callable; // Y | N | C
        const collateralTypeValue = collateralType;
        const prepaymentTypeValue = prepaymentTypeInput;
        const prepaymentSpeedValue = prepaymanetSpeedInput;
        const defaultTypeValue = defaultTypeInput;
        const defaultSpeedValue = defaultSpeedInput;
        const severityValue = severityInputFormValue;
        const delinquencyValue = delinquencyInputFormValue;
        const interestRateScenarioValue = interestRateScenario;
        const modelFamilyOverrideValue = modelFamilyOverride;
        const modelFamilyOverrideForAnalyticsValue = modelFamilyOverrideForAnalytics;
        const acceptModelOutputsValue = acceptModelOutputsFormValue;

        const payload: PayloadItem[] = [];

        // CALL_DATE (only if provided)
        if (isCallDateValid) {
            const callDateValue = callDate;
            payload.push({
                type: 'CALL_DATE',
                parameters: { callDate: callDateValue },
            });
        }

        // CALLABLE (only if provided)
        if (hasValue(callableValue)) {
            payload.push({
                type: 'CALLABLE',
                parameters: { callable: callableValue },
            });
        }

        // COLLATERAL_TYPE (only if provided)
        if (hasValue(collateralTypeValue)) {
            payload.push({
                type: 'COLLATERAL_TYPE',
                parameters: { collateralType: collateralTypeValue },
            });
        }

        // SECURITY_SETTINGS (only if provided)
        if (hasValue(interestRateScenarioValue) || hasValue(modelFamilyOverrideValue) || hasValue(modelFamilyOverrideForAnalyticsValue)) {
            payload.push({
                type: 'SECURITY_SETTINGS',
                parameters: { interestRateScenario: interestRateScenarioValue, modelFamilyOverride: modelFamilyOverrideValue, modelFamilyOverrideForAnalytics: modelFamilyOverrideForAnalyticsValue, acceptModelOutputs: acceptModelOutputsValue },
            });
        }

        // SPEED_OVERRIDES: include ONLY if at least one field exists
        const speedOverridesParams = {
            ...(hasValue(prepaymentTypeValue) ? { prepaymentType: prepaymentTypeValue } : {}),
            ...(hasValue(prepaymentSpeedValue)
                ? { prepaymentSpeed: Number(prepaymentSpeedValue) }
                : {}),
            ...(hasValue(defaultTypeValue) ? { defaultType: defaultTypeValue } : {}),
            ...(hasValue(defaultSpeedValue) ? { defaultSpeed: Number(defaultSpeedValue) } : {}),
            ...(hasValue(severityValue) ? { severity: Number(severityValue) } : {}),
            ...(hasValue(delinquencyValue) ? { delinquency: Number(delinquencyValue) } : {}),
        };

        if (Object.keys(speedOverridesParams).length > 0) {
            payload.push({
                type: 'SPEED_OVERRIDES',
                parameters: speedOverridesParams,
            });
        }

        const asset: RequestedNewAsset = {
            aladdinId: aladdinId,
            price: Number(price),
            assetType: assetTypeFormValue,
            assetSubType: assetSubTypeFormValue,
            requestedBy: currentUser.email,
            cdiCduBlob: '',
            assetClass: assetClassFormValue,
            instrumentType: instrumentTypeFormValue,
            analysisDate: analysisDate,
            ...(payload.length > 0 ? { payload } : {}),
        };

        return { assets: [asset] };
    };

    const handleOk = async () => {
        if (!price) return;

        try {
            const requestBody = buildNewAssetRequest(user);

            const {
                data: { response },
            } = await requestNewAsset(requestBody);

            messageApi.success('New asset created successfully!');
            const createdAsset = response[0];
            handleSelectAsset(createdAsset.assetAnalyticsSetupId);
            onClose();
            handleResetForm();
        } catch (e) {
            messageApi.error('Failed to create new asset. Please try again!' + e);
        }
    };

    useEffect(() => {

        const fetch = async () => {
            try {
                const reponse = await getMetaData();
                setMetaData(reponse.data);

                const firstAssetType = reponse.data.assetTypes.find(at => at);
                if (firstAssetType) {
                    setSelectedAssetTypeValue(firstAssetType.assetTypeValue);
                    const firstSubType = firstAssetType.assetSubTypes.find(ast => ast);
                    if (firstSubType) {
                        setSelectedAssetSubTypeValue(firstSubType.assetSubTypeValue);
                    }
                }
            } catch (e) {
                console.error('Unable to fetch meta data', e);
            }
        };

        fetch();
    }, []);


    const handleCancel = () => {
        onClose();
        handleResetForm();
    };

    // Get filtered lists based on selections 
    const assetTypes = metaData?.assetTypes || [];
    const assetSubTypes =
        assetTypes?.find(at => at.assetTypeValue === assetTypeFormValue)?.assetSubTypes || [];
    const collateralTypes =
        assetSubTypes?.find(ast => ast.assetSubTypeValue === assetSubTypeFormValue)?.collateralTypes || [];

    // Handlers for cascading selects  
    const onAssetTypeChange = (value: string) => {
        setSelectedAssetTypeValue(value);
        setSelectedAssetSubTypeValue(null);
        setSelectedCollateralTypeValue(null);

        form.resetFields([
            'assetSubType',
            'collateralType',
        ]);
    };

    const onAssetSubTypeChange = (value: string) => {
        setSelectedAssetSubTypeValue(value);
        setSelectedCollateralTypeValue(null);

        form.resetFields([
            'collateralType',
        ]);
    };

    const onCollateralTypeChange = (value: string) => {
        setSelectedCollateralTypeValue(value);
    };

    // If callable is C or Y then call date needs to be valid value. If the callable is N then assume callDate is valid
    const isCallDateValid = (callable === 'Y' || callable === 'C') ? hasValue(callDate) : true;

    // Call date is optional (per your requirement). Require only aladdinId + price.
    const okDisabled = !(hasValue(aladdinId) && hasValue(price) && hasValue(collateralType) && hasValue(analysisDate)
        && hasValue(callable) && isCallDateValid && hasValue(interestRateScenario) && hasValue(modelFamilyOverride) && hasValue(modelFamilyOverrideForAnalytics)
        && ((hasValue(defaultTypeInput) && hasValue(defaultSpeedInput)) || !hasValue(defaultTypeInput))
        && ((hasValue(prepaymentTypeInput) && hasValue(prepaymanetSpeedInput)) || !hasValue(prepaymentTypeInput)));

    return (
        <>
            {contextHolder}
            <Modal
                width="600px"
                height="600px"
                title="New Asset"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isOpen}
                onOk={handleOk}
                okText="Submit"
                onCancel={handleCancel}
                okButtonProps={{ disabled: okDisabled }}
                styles={{
                    body: {
                        minHeight: '40vh',
                        overflowY: 'auto',
                    },
                }}
            >
                <Form
                    form={form}
                    initialValues={initialFormValues}
                    onValuesChange={(changedValues) => {
                        if (changedValues.hasOwnProperty('callableInput')) {
                            form.resetFields(['callDateInputNA']);
                        }
                    }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '220px 1fr',
                        gap: 20,
                        alignItems: 'center',
                        padding: '7px 0px 0px 24px',
                    }}
                >
                    <label htmlFor="assetclass">
                        <strong>Asset Class</strong>
                    </label>
                    <Form.Item name="assetClass" noStyle>
                        <Select
                            id="assetClass"
                            defaultValue="DEBT-FI"
                            style={{
                                width: '180px',
                                padding: '4px',
                                borderRadius: '6px',
                                border: '1px solid lightgray',
                                backgroundColor: 'white',
                            }}
                            options={[{ label: 'DEBT - Fixed Income', value: 'DEBT-FI' }]}
                        />
                    </Form.Item>

                    <label htmlFor="instrumentType">
                        <strong>Instrument Type</strong>
                    </label>
                    <Form.Item name="instrumentType" noStyle>
                        <Select
                            defaultValue="SD"
                            style={{
                                width: '180px',
                                padding: '4px',
                                borderRadius: '6px',
                                border: '1px solid lightgray',
                                backgroundColor: 'white',
                            }}
                            options={[{ label: 'Securitized Debt', value: 'SD' }]}
                        />
                    </Form.Item>

                    <AssetTypeselect
                        label="Asset Type"
                        name="assetType"
                        value={selectedAssetTypeValue}
                        onChange={onAssetTypeChange}
                        defaultValue="NARMBS"
                        options={assetTypes.map(at => ({
                            label: at.assetTypeDescription || at.assetTypeValue,
                            value: at.assetTypeValue,
                        }))}
                    />

                    <AssetTypeselect
                        label="Asset Sub Type"
                        name="assetSubType"
                        value={selectedAssetSubTypeValue}
                        onChange={onAssetSubTypeChange}
                        placeholder="Select Asset Sub Type"
                        options={assetSubTypes.map(at => ({
                            label: at.assetSubTypeDescription || at.assetSubTypeValue,
                            value: at.assetSubTypeValue,
                        })) || []}
                        allowClear
                    />

                    <AssetTypeselect
                        label="Collateral Type"
                        name="collateralType"
                        value={selectedCollateralTypeValue}
                        onChange={onCollateralTypeChange}
                        placeholder="Select Collateral Type"
                        options={collateralTypes.map(at => ({
                            label: at.collateralTypeDescription || at.collateralTypeValue,
                            value: at.collateralTypeValue,
                        })) || []}
                        allowClear
                        required
                    />

                    <label htmlFor="aladdinId">
                        <strong>Aladdin Id*</strong>
                    </label>
                    <Form.Item name="aladdinId" required={true} noStyle>
                        <Input
                            style={{
                                width: '140px',
                                padding: '4px',
                                borderRadius: '6px',
                                border: '1px solid lightgray',
                            }}
                            placeholder="Enter Aladdin Id"
                        />
                    </Form.Item>

                    <label htmlFor="priceInputNA">
                        <strong>Price*</strong>
                    </label>
                    <Form.Item name="priceInputNA" required={true} noStyle>
                        <InputNumber
                            style={{ width: '120px' }}
                            placeholder="Enter price"
                            controls={false}
                            size="small"
                        />
                    </Form.Item>

                    <label htmlFor="analysisDate">
                        <strong>Analysis Date*</strong>
                    </label>
                    <Form.Item name="analysisDate" required={true} noStyle>
                        <TRAPDatePicker
                            id="analysisDate"
                            style={{ width: '140px' }}
                            placeholder="Select Analysis Date"
                            format="YYYY-MM-DD"
                            allowClear
                        />
                    </Form.Item>

                    <label htmlFor="interestRateScenario">
                        <strong>Interest Rate Scenario</strong>
                    </label>
                    <Form.Item noStyle name="interestRateScenario">
                        <Select
                            defaultValue="Forward"
                            style={{ width: '120px' }}
                            options={[
                                { label: 'Forward', value: 'Forward' },
                                { label: 'Nominal', value: 'Nominal' }
                            ]}
                        />
                    </Form.Item>

                    <label htmlFor="modelFamilyOverride">
                        <strong>Model Family Override For Scenario</strong>
                    </label>
                    <Form.Item noStyle name="modelFamilyOverride">
                        <Select
                            defaultValue="BRS v6.5"
                            style={{ width: '120px' }}
                            options={[
                                { label: 'BRS v6.5', value: 'BRS v6.5' },
                                { label: 'BRS v6.4', value: 'BRS v6.4' },
                                { label: 'BRS v2.2', value: 'BRS v2.2' },
                                { label: 'BRCLO v2.01', value: 'BRCLO v2.01' },
                                { label: 'STATIC', value: 'STATIC' }
                            ]}
                        />
                    </Form.Item>
                    <label htmlFor="modelFamilyOverrideForAnalytics">
                        <strong>Model Family Override For Analytics</strong>
                    </label>
                    <Form.Item noStyle name="modelFamilyOverrideForAnalytics">
                        <Select
                            defaultValue="BRS v6.5"
                            style={{ width: '120px' }}
                            options={[
                                { label: 'BRS v6.5', value: 'BRS v6.5' },
                                { label: 'BRS v6.4', value: 'BRS v6.4' },
                                { label: 'BRS v2.2', value: 'BRS v2.2' },
                                { label: 'BRCLO v2.01', value: 'BRCLO v2.01' },
                                { label: 'STATIC', value: 'STATIC' }
                            ]}
                        />
                    </Form.Item>
                    <label htmlFor="acceptModelOutputs">
                        <strong>Use SAC API</strong>
                    </label>
                    <Form.Item name="acceptModelOutputs" noStyle valuePropName="checked">
                        <Switch
                            style={{
                                width: '20px',
                            }}
                        />
                    </Form.Item>
                    <label htmlFor="callableInput">
                        <strong>Callable*</strong>
                    </label>
                    <Form.Item noStyle name="callableInput" required>
                        <Select
                            id="callableInput"
                            style={{ width: '120px' }}
                            options={CALLABLE_OPTIONS}
                        />
                    </Form.Item>

                    {
                        (callable === 'Y' || callable === 'C') && <label htmlFor="callDateInputNA">
                            <strong>Call Date{callable === 'C' ? ' (Text)' : ''}*</strong>
                        </label>
                    }

                    <Form.Item name="callDateInputNA" noStyle required>
                        {
                            callable === 'Y' && <TRAPDatePicker
                                id="callDateInputNA"
                                style={{ width: '140px' }}
                                placeholder="Select Call Date"
                                format="YYYY-MM-DD"
                                allowClear
                            />
                        }
                        {
                            callable === 'C' && <Input
                                id="callDateInputNA"
                                style={{ width: '200px' }}
                                placeholder="Put Down Call date text"
                                allowClear
                            />
                        }
                    </Form.Item>

                    <label htmlFor="prepaymentTypeInput">
                        <strong>Prepayment Type</strong>
                    </label>
                    <Form.Item noStyle name="prepaymentTypeInput">
                        <Select
                            id="prepaymentTypeInput"
                            style={{ width: '90px' }}
                            options={prepayTypeOptions}
                        />
                    </Form.Item>

                    <label htmlFor="prepaymanetSpeedInput">
                        <strong>Prepayment Speed</strong>
                    </label>
                    <Form.Item noStyle name="prepaymanetSpeedInput">
                        <InputNumber
                            id="prepaymanetSpeedInput"
                            style={{ width: '70px' }}
                            size="small"
                            controls={false}
                        />
                    </Form.Item>

                    <label htmlFor="defaultTypeInput">
                        <strong>Default Type</strong>
                    </label>
                    <Form.Item noStyle name="defaultTypeInput">
                        <Select
                            id="defaultTypeInput"
                            style={{ width: '90px' }}
                            options={[
                                { label: 'CDR', value: 'CDR' },
                                { label: 'SDA', value: 'SDA' },
                            ]}
                        />
                    </Form.Item>

                    <label htmlFor="defaultSpeedInput">
                        <strong>Default Speed</strong>
                    </label>
                    <Form.Item noStyle name="defaultSpeedInput">
                        <InputNumber
                            id="defaultSpeedInput"
                            style={{ width: '70px' }}
                            size="small"
                            controls={false}
                        />
                    </Form.Item>

                    <label htmlFor="severityInput">
                        <strong>Severity</strong>
                    </label>
                    <Form.Item noStyle name="severityInput">
                        <InputNumber
                            id="severityInput"
                            style={{ width: '70px' }}
                            size="small"
                            controls={false}
                        />
                    </Form.Item>

                    <label htmlFor="delinquencyInput">
                        <strong>Delinquency</strong>
                    </label>
                    <Form.Item noStyle name="delinquencyInput">
                        <InputNumber
                            id="delinquencyInput"
                            style={{ width: '70px' }}
                            size="small"
                            controls={false}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};