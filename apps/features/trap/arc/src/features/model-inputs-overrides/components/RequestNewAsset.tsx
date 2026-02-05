import { Form, InputNumber, message, Modal, Select, Input } from 'antd';
import { requestNewAsset } from '../../../lib/services';
import { useUserInfo } from '@platform/utils';
import { TRAPDatePicker } from '../../../lib/helpers';

const initialFormValues = {
    assetClass: 'DEBT-FI',
    instrumentType: 'SD',
    assetType: 'NARMBS',
};

export const RequestNewAsset = ({
    isOpen,
    onClose,
    onAssetCreated,
}: {
    isOpen: boolean;
    onClose: () => void;
    onAssetCreated: (assetId: number) => void;
}) => {
    const [form] = Form.useForm();
    const user = useUserInfo();
    const [messageApi, contextHolder] = message.useMessage();

    const price = Form.useWatch('priceInputNA', form);
    const callDate = Form.useWatch('callDateInputNA', form);
    const aladdinId = Form.useWatch('aladdinId', form);

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
        ]);
    };

    const handleOk = async () => {
        if (!price) return;
        try {
            const {
                data: { response },
            } = await requestNewAsset({
                assets: [
                    {
                        aladdinId: form.getFieldValue('aladdinId'),
                        price: form.getFieldValue('priceInputNA'),
                        assetType: form.getFieldValue('assetType'),
                        requestedBy: user.email,
                        cdiCduBlob: '',
                        assetClass: form.getFieldValue('assetClass'),
                        instrumentType: form.getFieldValue('instrumentType'),
                        analysisDate: form.getFieldValue('analysisDate'),
                        payload: [
                            {
                                type: 'CALL_DATE',
                                parameters: {
                                    callDate: form.getFieldValue('callDateInputNA'),
                                },
                            },
                            {
                                type: 'COLLATERAL_TYPE',
                                parameters: {
                                    collateralType: form.getFieldValue('collateralType'),
                                },
                            },
                        ],
                    },
                ],
            });

            messageApi.success('New Asset succesfully requested.');
            const createdAsset = response[0];
            onAssetCreated(createdAsset.assetAnalyticsSetupId);
            onClose();
            handleResetForm();
        } catch (e) {
            console.log(e);
            messageApi.error('An error occured');
        }
    };

    const handleCancel = () => {
        onClose();
        handleResetForm();
    };

    const okDisabled = !(callDate && aladdinId && price);

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
                okText={'Submit'}
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
                            options={[
                                {
                                    label: 'Securitized Debt',
                                    value: 'SD',
                                },
                            ]}
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
                            options={[
                                {
                                    label: 'Non Agency RMBS',
                                    value: 'NARMBS',
                                },
                            ]}
                        >
                            <option value="NARMBS">Non Agency RMBS</option>
                        </Select>
                    </Form.Item>

                    <label htmlFor="collateralType">
                        <strong>Collateral Type</strong>
                    </label>
                    <Form.Item name="collateralType" noStyle>
                        <Select
                            placeholder="Select Collatteral Type"
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
                            ]}
                        />
                    </Form.Item>

                    <label htmlFor="aladdinId">
                        <strong>Aladdin Id</strong>
                    </label>
                    <Form.Item name="aladdinId" noStyle>
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
                        <strong>Price</strong>
                    </label>
                    <Form.Item name="priceInputNA" noStyle>
                        <InputNumber
                            style={{ width: '120px' }}
                            placeholder="Enter price"
                            controls={false}
                            size="small"
                        />
                    </Form.Item>
                    <label htmlFor="analysisDate">
                        <strong>Analysis Date</strong>
                    </label>
                    <Form.Item name="analysisDate" noStyle>
                        <TRAPDatePicker
                            id="analysisDate"
                            style={{ width: '140px' }}
                            placeholder="Select Analysis Date"
                            format="YYYY-MM-DD"
                            allowClear
                        />
                    </Form.Item>

                    <label htmlFor="callDateInputNA">
                        <strong>Call Date</strong>
                    </label>

                    <Form.Item name="callDateInputNA" noStyle>
                        <TRAPDatePicker
                            id="callDateInputNA"
                            style={{ width: '140px' }}
                            placeholder="Select Call Date"
                            format="YYYY-MM-DD"
                            allowClear
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
