import { memo, useEffect, useState } from 'react';
import { Form, message } from 'antd';
import { AssetInfo } from '../AssetInfo';
import { AnalyticsTable } from '../AnalyticsTable';
import { ActionBar } from '../ActionBar';
import { UtilityBar } from '../UtilityBar';
import { RowDataType } from '../AnalyticsTable/lib/types';
import { AnalyticsRequest } from '../../lib/types';
import { updateAnalyticsOverrides } from '../../lib/services';

const getValueToPublish = (row: RowDataType) => {
    switch (true) {
        case row?.override && String(row.override).trim() !== '':
            return row.override;
        case row?.anser && String(row.anser).trim() !== '':
            return row.anser;
        default:
            return '';
    }
};

type NewAssetsContentProps = {
    selectedRowRequestId?: number | null;
    selectedRowAladdinId?: string;
    selectedStatus?: string;
    latestUpdateTimestamp: number;
    selectedPayload?: string
};

function NewAssetsContent({
    selectedRowRequestId,
    latestUpdateTimestamp,
    selectedStatus,
    selectedRowAladdinId,
    selectedPayload
}: NewAssetsContentProps) {
    const [form] = Form.useForm();
    const [isAnalitycsSavePending, setIsAnalitycsSavePending] = useState(false);
    const [isActionInprogress, setIsActionInprogress] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();

    const handleSaveAnalyticsOverride = async () => {
        const fields = form.getFieldValue('rows') || {};

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const valuesToPublish = Object.keys(fields).reduce((acc: any, key: string) => {
            if (fields[key]?.valueToPublish) {
                acc[key] = fields[key].valueToPublish;
            }

            return acc;
        }, {});

        if (!selectedRowRequestId) return;
        setIsAnalitycsSavePending(true);
        try {
            await updateAnalyticsOverrides({
                assets: [
                    {
                        ...valuesToPublish,
                        noteText: form.getFieldValue('noteTextArea'),
                        noteType: 'AOR',
                    } satisfies AnalyticsRequest,
                ],
            });
            messageApi.success('Analytics updated successfully.');
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } catch (err: any) {
            messageApi.error(
                err?.response?.data?.message ??
                'Failed to update analytics. Please try again.'
            );
        } finally {
            setIsAnalitycsSavePending(false);
        }
    };

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.rows) {
            const changedRowName = Object.keys(changedValues.rows)[0];
            form.setFieldValue(
                ['rows', changedRowName, 'valueToPublish'],
                getValueToPublish(allValues.rows[changedRowName])
            );
        }
    };

    useEffect(() => {
        form.setFieldValue('noteTextArea', "");
    }, [selectedRowRequestId]);

    return (
        <div style={{ width: '75vw', display: 'flex', gap: '4px', flexDirection: 'column' }}>
            {contextHolder}
            <AssetInfo
                //selectedAssetId={selectedRowRequestId}
                latestUpdateTimestamp={latestUpdateTimestamp}
            />
            {/* <SecuritySettings
                selectedAssetId={selectedRowRequestId}
                latestUpdateTimestamp={latestUpdateTimestamp}
            /> */}
            <Form
                form={form}
                onValuesChange={handleValuesChange}
                onFinish={handleSaveAnalyticsOverride}
                key={`${latestUpdateTimestamp}_${selectedRowRequestId}`}
            >
                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                        <ActionBar selectedAssetStatus={selectedStatus} selectedPayload= {selectedPayload} setIsActionInprogress={setIsActionInprogress} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <UtilityBar
                            selectedAssetStatus={selectedStatus}
                            isAnalitycsSavePending={isAnalitycsSavePending}
                            selectedAladdinId={selectedRowAladdinId}
                            selectedRowRequestId={selectedRowRequestId as number}
                            selectedPayload={selectedPayload}
                        />
                    </div>
                </div>
                <AnalyticsTable
                    selectedAssetId={selectedRowRequestId}
                    selectedStatus={selectedStatus}
                    latestUpdateTimestamp={latestUpdateTimestamp}
                    form={form}
                    isActionInprogress={isActionInprogress}
                />
            </Form>
        </div>
    );
}

export default memo(NewAssetsContent);
