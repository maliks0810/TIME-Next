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
                            { label: 'Prime Jumbo (PJ)', value: 'PJ' },
                            { label: 'Non-Performing Loan (NPL)', value: 'NPL' },
                            { label: 'Home Equity Line of Credit (HELOC)', value: 'HELOC' },
                            { label: 'Re-Performing Loan (RPL)', value: 'RPL' },
                            { label: 'Single Family Rental (SFR)', value: 'SFR' },
                            { label: 'Agency Investor (AGI)', value: 'AGI' },
                            { label: 'Residential Transition Loans (RTL)', value: 'RTL' },
                            { label: 'Legacy (LEG)', value: 'LEG' },
                            { label: 'Credit Risk Transfer (CRT)', value: 'CRT' },
                            { label: 'Manufactured Housing (MH)', value: 'MH' },
                            { label: 'Other (OTH)', value: 'OTH' },
                        ]}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>{title}</div>
        </div>
    );
};
