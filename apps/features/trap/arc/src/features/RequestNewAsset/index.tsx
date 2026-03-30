import { Form, InputNumber, message, Modal, Select, Input, FormInstance } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useUserInfo } from '@platform/utils';
import { requestNewAsset } from '../../lib/services';
import { hasValue, TRAPDatePicker } from '../../lib/helpers';
import { PayloadItem, RequestedNewAsset, RequestNewAssetPayload } from '../../lib/types';
import { CALLABLE_OPTIONS, PREPAYMENT_TYPE_OPTIONS_ALL, PREPAYMENT_TYPE_OPTIONS_CMBS } from '../../shared/constants';

const initialFormValues = {
    assetClass: 'DEBT-FI',
    instrumentType: 'SD',
    assetType: 'NARMBS',
    interestRateScenario: 'Forward',
    modelFamilyOverride: 'BRS v6.5'
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
    //const callDate = Form.useWatch('callDateInputNA', form);
    const aladdinId = Form.useWatch('aladdinId', form);

    const analysisDate = Form.useWatch('analysisDate', form);
    const collateralType = Form.useWatch('collateralType', form);
    const callable = Form.useWatch('callableInput', form);
    const callDate = Form.useWatch('callDateInputNA', form);
    const interestRateScenario = Form.useWatch('interestRateScenario', form);
    const modelFamilyOverride = Form.useWatch('modelFamilyOverride', form);
    const prepayTypeOptions = modelFamilyOverride === 'BRS v2.2'
        ? PREPAYMENT_TYPE_OPTIONS_CMBS
        : PREPAYMENT_TYPE_OPTIONS_ALL;
    const defaultTypeInput = Form.useWatch('defaultTypeInput', form);
    const defaultSpeedInput = Form.useWatch('defaultSpeedInput', form);
    const prepaymentTypeInput = Form.useWatch('prepaymentTypeInput', form);
    const prepaymanetSpeedInput = Form.useWatch('prepaymanetSpeedInput', form);


    const handleResetForm = () => {
        form.resetFields([
            'aladdinId',
            'priceInputNA',
            'assetType',
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
            'modelFamilyOverride'
        ]);
    };

    const handleSelectAsset = (assetAnalyticsSetupId: number) => {
        const params = new URLSearchParams();
        params.set('assetId', assetAnalyticsSetupId + '');
        setSearchParams(params);
    };

    const buildNewAssetRequest = (
        formInstance: FormInstance,
        currentUser: { email: string }
    ): RequestNewAssetPayload => {
        // pull raw values once (use your *actual* Form.Item names)
        const callableValue = formInstance.getFieldValue('callableInput'); // Y | N | C
        const collateralTypeValue = formInstance.getFieldValue('collateralType');

        const prepaymentTypeValue = formInstance.getFieldValue('prepaymentTypeInput');
        const prepaymentSpeedValue = formInstance.getFieldValue('prepaymanetSpeedInput');
        const defaultTypeValue = formInstance.getFieldValue('defaultTypeInput');
        const defaultSpeedValue = formInstance.getFieldValue('defaultSpeedInput');
        const severityValue = formInstance.getFieldValue('severityInput');
        const delinquencyValue = formInstance.getFieldValue('delinquencyInput');
        const interestRateScenarioValue = formInstance.getFieldValue('interestRateScenario');
        const modelFamilyOverrideValue = formInstance.getFieldValue('modelFamilyOverride');

        const payload: PayloadItem[] = [];

        // CALL_DATE (only if provided)
        if (isCallDateValid) {
            const callDateValue = formInstance.getFieldValue('callDateInputNA');
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
        if (hasValue(interestRateScenarioValue) || hasValue(modelFamilyOverrideValue)) {
            payload.push({
                type: 'SECURITY_SETTINGS',
                parameters: { interestRateScenario: interestRateScenarioValue, modelFamilyOverride: modelFamilyOverrideValue },
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
            aladdinId: formInstance.getFieldValue('aladdinId'),
            price: Number(formInstance.getFieldValue('priceInputNA')),
            assetType: formInstance.getFieldValue('assetType'),
            requestedBy: currentUser.email,
            cdiCduBlob: '',
            assetClass: formInstance.getFieldValue('assetClass'),
            instrumentType: formInstance.getFieldValue('instrumentType'),
            analysisDate: formInstance.getFieldValue('analysisDate'),
            ...(payload.length > 0 ? { payload } : {}),
        };

        return { assets: [asset] };
    };

    const handleOk = async () => {
        if (!price) return;

        try {
            const requestBody = buildNewAssetRequest(form, user);

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

    const handleCancel = () => {
        onClose();
        handleResetForm();
    };

    const isCallDateValid = (callable === 'Y' || callable === 'C') ? hasValue(callDate) : true;

    // Call date is optional (per your requirement). Require only aladdinId + price.
    const okDisabled = !(hasValue(aladdinId) && hasValue(price) && hasValue(collateralType) && hasValue(analysisDate)
        && hasValue(callable) && isCallDateValid && hasValue(interestRateScenario) && hasValue(modelFamilyOverride)
        && ((hasValue(defaultTypeInput) && hasValue(defaultSpeedInput)) || !hasValue(defaultTypeInput) )
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
                        gridTemplateColumns: '120px 1fr',
                        gap: 14,
                        alignItems: 'center',
                        padding: '12px 0px 0px 24px',
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

                    <label htmlFor="assetType">
                        <strong>Asset Type</strong>
                    </label>
                    <Form.Item name="assetType" noStyle>
                        <Select
                            defaultValue="NARMBS"
                            style={{
                                width: '180px',
                                padding: '4px',
                                borderRadius: '6px',
                                border: '1px solid lightgray',
                                backgroundColor: 'white',
                            }}
                            options={[{ label: 'Non Agency RMBS', value: 'NARMBS' }]}
                        />
                    </Form.Item>

                    <label htmlFor="collateralType">
                        <strong>Collateral Type*</strong>
                    </label>
                    <Form.Item name="collateralType" required={true} noStyle>
                        <Select
                            placeholder="Select Collateral Type"

                            style={{
                                width: '260px',
                                padding: '4px',
                                borderRadius: '6px',
                                border: '1px solid lightgray',
                                backgroundColor: 'white',
                            }}
                            options={[
                                { label: 'Close Ended Second (CES)', value: 'CES' },
                                { label: 'Non-Qualified Mortgage (NQM)', value: 'NQM' },
                                { label: 'Qualified Mortgage (QM)', value: 'QM' },
                                { label: 'Non Performing Loan (NPL)', value: 'NPL' },
                                { label: 'Home Equity Line of Credit (HELOC)', value: 'HELOC' },
                                { label: 'Re-Performing Loan (RPL)', value: 'RPL' },
                                { label: 'Single Family Rental (SFR)', value: 'SFR' },
                            ]}
                        />
                    </Form.Item>

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
                            // id="interestRateScenario"
                            defaultValue="Forward"
                            style={{ width: '120px' }}
                            options={[
                                { label: 'Forward', value: 'Forward' },
                                { label: 'Nominal', value: 'Nominal' }
                            ]}
                        />
                    </Form.Item>

                    <label htmlFor="modelFamilyOverride">
                        <strong>Model Family Override</strong>
                    </label>
                    <Form.Item noStyle name="modelFamilyOverride">
                        <Select
                            // id="modelFamilyOverride"
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