import { useState } from 'react';
import { Form, Segmented, Switch, message } from 'antd';
import { PayloadItem, WorkflowConfig } from '../../lib/types';
import {
    CALLABLE_SELECT_OPTIONS,
    INTEREST_RATE_SCENARIO_OPTIONS,
    MODEL_FAMILY_OVERRIDE_OPTIONS,
    PREPAYMENT_DEFAULT_TYPE_OPTIONS,
} from '../../lib/constants';
import { PREPAYMENT_TYPE_OPTIONS_ALL } from '../../../../shared/constants';
import { buildDefaultOverrides } from '../../lib/helpers';
import {
    TRAPDatePicker,
    extractCallDate,
    extractCallable,
    extractDefaultSpeed,
    extractDefaultType,
    extractDelinquency,
    extractInfoAcceptModelOutputsType,
    extractInfoApplyMultiplierEnabledType,
    extractInfoInterestRateScenarioType,
    extractInfoModelFamilyOverrideForAnalyticsInputsType,
    extractInfoModelFamilyOverrideForInputsType,
    extractMultiplierValue,
    extractPrepaymentSpeed,
    extractPrepaymentType,
    extractSeverity,
    speedOverridesExist,
} from '../../../../lib/helpers';
import LabeledNumberInput from './LabeledNumberInput ';
import LabeledSelect from './LabeledSelect';
import JsonEditor from './JsonEditor';

type DefaultOverridesTabProps = {
    draft: WorkflowConfig;
    onChange: (overrides: PayloadItem[]) => void;
};

const labelStyle: React.CSSProperties = { fontWeight: 600 };

export const DefaultOverridesTab = ({ draft, onChange }: DefaultOverridesTabProps) => {
    const [view, setView] = useState<'visual' | 'json'>('visual');
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    // Wrap the PayloadItem[] so the existing extract* helpers (which expect a { payload: [...] }
    // shape or JSON string) can read the current values.
    const wrapped = { payload: draft.defaultOverrides };
    const speedEnabled = Form.useWatch('speedOverridesEnabled', form);
    const multiplierEnabled = Form.useWatch('applyMultiplierEnabled', form);

    const initialValues = {
        callable: extractCallable(wrapped),
        callDate: extractCallDate(wrapped),
        interestRateScenario: extractInfoInterestRateScenarioType(wrapped),
        modelFamilyOverride: extractInfoModelFamilyOverrideForInputsType(wrapped),
        modelFamilyOverrideForAnalytics: extractInfoModelFamilyOverrideForAnalyticsInputsType(wrapped),
        acceptModelOutputs: extractInfoAcceptModelOutputsType(wrapped),
        applyMultiplierEnabled: extractInfoApplyMultiplierEnabledType(wrapped),
        multiplierValue: extractMultiplierValue(wrapped),
        speedOverridesEnabled: speedOverridesExist(wrapped),
        prepaymentType: extractPrepaymentType(wrapped),
        prepaymentSpeed: extractPrepaymentSpeed(wrapped),
        defaultType: extractDefaultType(wrapped),
        defaultSpeed: extractDefaultSpeed(wrapped),
        severity: extractSeverity(wrapped),
        delinquency: extractDelinquency(wrapped),
    };

    const handleValuesChange = () => {
        onChange(buildDefaultOverrides(form.getFieldsValue(true)));
    };

    return (
        <div className='defaultOverridesTabContainer'>
            {contextHolder}
            <Segmented
                value={view}
                onChange={(value) => setView(value as 'visual' | 'json')}
                options={[
                    { label: 'Visual', value: 'visual' },
                    { label: 'JSON', value: 'json' }
                ]}
            />

            {view === 'visual' && (
                <Form
                    form={form}
                    initialValues={initialValues}
                    onValuesChange={handleValuesChange}
                    className='form'
                >
                    <LabeledSelect
                        label="Callable"
                        name="callable"
                        options={CALLABLE_SELECT_OPTIONS}
                    />

                    <label htmlFor="callDate" style={labelStyle}>
                        Call Date
                    </label>
                    <Form.Item name="callDate" noStyle>
                        <TRAPDatePicker id="callDate" style={{ width: 350 }} allowClear />
                    </Form.Item>

                    <LabeledSelect
                        label="Interest Rate Scenario"
                        name="interestRateScenario"
                        options={INTEREST_RATE_SCENARIO_OPTIONS}
                    />

                    <LabeledSelect
                        label="Model Family Override For Scenario"
                        name="modelFamilyOverride"
                        options={MODEL_FAMILY_OVERRIDE_OPTIONS}
                    />

                    <LabeledSelect
                        label="Model Family Override For Analytics"
                        name="modelFamilyOverrideForAnalytics"
                        options={MODEL_FAMILY_OVERRIDE_OPTIONS}
                    />

                    <label htmlFor="acceptModelOutputs" style={labelStyle}>
                        Use SAC API
                    </label>
                    <Form.Item name="acceptModelOutputs" noStyle valuePropName="checked">
                        <Switch
                            style={{
                                width: '20px',
                            }}
                        />
                    </Form.Item>

                    <label htmlFor="applyMultiplierEnabled" style={labelStyle}>
                        Apply Multiplier
                    </label>
                    <Form.Item name="applyMultiplierEnabled" noStyle valuePropName="checked">
                        <Switch
                            style={{
                                width: '20px',
                            }}
                        />
                    </Form.Item>
                    {multiplierEnabled && (
                        <>
                            <LabeledNumberInput label=" Multiplier  Value" name="multiplierValue" />
                        </>
                    )}
                    <label htmlFor="speedOverridesEnabled" style={labelStyle}>
                        Speed Overrides
                    </label>
                    <Form.Item name="speedOverridesEnabled" noStyle valuePropName="checked">
                        <Switch
                            style={{
                                width: '20px',
                            }}
                        />
                    </Form.Item>

                    {speedEnabled && (
                        <>
                            <LabeledSelect
                                label=" Prepayment Type"
                                name="prepaymentType"
                                options={PREPAYMENT_TYPE_OPTIONS_ALL}
                            />
                            <LabeledNumberInput label="Prepayment Speed" name="prepaymentSpeed" />

                            <LabeledSelect
                                label=" Default Type"
                                name="defaultType"
                                options={PREPAYMENT_DEFAULT_TYPE_OPTIONS}
                            />

                            <LabeledNumberInput label="Default Speed" name="defaultSpeed" />
                            <LabeledNumberInput label="Severity" name="severity" />
                            <LabeledNumberInput label="Delinquency" name="delinquency" />
                        </>
                    )}
                </Form>
            )}

            {/* Lazy: the JSON editor only mounts once the JSON view is selected. */}
            {view === 'json' && (
                <JsonEditor
                    overrides={draft.defaultOverrides}
                    onChange={onChange}
                    onError={(msg) => messageApi.error(msg)}
                />
            )}
        </div>
    );
};


