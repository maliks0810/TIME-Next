import { Form, Select } from 'antd';

export const AssetInfoSelectCollateralType = ({
    value,
    title,
}: {
    value?: string;
    title: string;
}) => {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ minHeight: 20, fontSize: 13 }}>
                <Form.Item
                    name="collateralType"
                    rules={[{ required: true, message: 'Please Provide Collateral Type!' }]}
                    noStyle
                >
                    <Select
                        id="collateralType"
                        style={{ width: '260px' }}
                        value={value}
                        options={[
                            { label: 'Closed-End Second (CES)', value: 'CES' },
                            { label: 'Non-Qualified Mortgage (NQM)', value: 'NQM' },
                            { label: 'Qualified Mortgage (QM)', value: 'QM' },
                            { label: 'Non-Performing Loan (NPL)', value: 'NPL' },
                            { label: 'Home Equity Line of Credit (HELOC)', value: 'HELOC' },
                            { label: 'Re-Performing Loan (RPL)', value: 'RPL' },
                            { label: 'Single Family Rental (SFR)', value: 'SFR' },
                        ]}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}</div>
        </div>
    );
};
