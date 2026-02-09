import { Form, Input, InputNumber, Select } from 'antd';
import { TRAPDatePicker } from '../../../lib/helpers';

// Lines 33 and 53 are hardcoded to disable input for purposes of MVP.
interface ModelInputAssumptionsProps {
    disabled?: boolean;
    price: number | null;
    callDate: string;
    aladdinId?: string;
    collateralType?: string
    analysisDate?: string;
}

export const ModelInputAssumptions = ({
    disabled,
    price,
    callDate,
    collateralType,
    analysisDate
}: ModelInputAssumptionsProps) => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 14,
                alignItems: 'center',
                padding: '12px 0px 0px 24px',
            }}
        >
            <label htmlFor="priceInput">
                <strong>Price</strong>
            </label>
            <Form.Item noStyle name="priceInput">
                <InputNumber
                    id="priceInput"
                    style={{ width: '120px' }}
                    value={price}
                    placeholder="Enter price"
                    disabled={disabled}
                    size="small"
                />
            </Form.Item>

            <label htmlFor="collateralType">
                <strong>Collateral Type</strong>
            </label>
            <Form.Item
                name="collateralType"
                rules={[{ required: true, message: 'Please Provide Collateral Type!' }]}
                label="Collateral Type"
                noStyle
            >
                <Select id="collateralType" style={{ width: '260px' }} value = {collateralType} options={[
                                { label: 'Closed-End Second (CES)', value: 'CES' },
                                { label: 'Non-Qualified Mortgage (NQM)', value: 'NQM' },
                                { label: 'Qualified Mortgage (QM)', value: 'QM' },
                                { label: 'Non-Performing Loan (NPL)', value: 'NPL' },
                            ]}/>
            </Form.Item>

            <label htmlFor="analysisDateInput">
                <strong>Analysis Date</strong>
            </label>
            <Form.Item noStyle name="analysisDateInput">
                <TRAPDatePicker
                    id="analysisDateInput"
                    style={{ width: '140px' }}
                    placeholder="Select Analysis Date"
                    format="YYYY-MM-DD"
                    value={analysisDate || null}
                    disabled={disabled}
                    allowClear
                />
            </Form.Item>

            <label htmlFor="callDateInput">
                <strong>Call Date</strong>
            </label>
            <Form.Item noStyle name="callDateInput">
                <TRAPDatePicker
                    id="callDateInput"
                    style={{ width: '140px' }}
                    placeholder="Select Call Date"
                    format="YYYY-MM-DD"
                    value={callDate || null}
                    disabled={disabled}
                    allowClear
                />
            </Form.Item>
            
            <label htmlFor="noteTextArea">
                <strong>Override Reason</strong>
            </label>

            <Form.Item
                name="noteTextArea"
                id="noteTextArea"
                rules={[{ required: true, message: 'Please Provide Override Reason!' }]}
                label="Note"
                noStyle
            >
                <Input.TextArea style={{ width: '40%' }} />
            </Form.Item>
        </div>
    );
};
