/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Dropdown, MenuProps, Space } from 'antd';
import { EyeFilled } from '@ant-design/icons';

import { STATUSES_ENUM } from '../../../../../arc/src/shared/constants';

export function getPreviewOptions(record: any): MenuProps['items'] {
    if (
        [
            STATUSES_ENUM.ANALYTICS_PENDING_REVIEW.toUpperCase(),
            STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN.toUpperCase(),
            STATUSES_ENUM.ANALYTICS_VERIFIED_IN_ALADDIN.toUpperCase(),
        ].includes(record.status as STATUSES_ENUM)
    ) {
        return [
            {
                key: 'analytics',
                label: 'Preview Analytics',
            },
        ];
    } else {
        return [
            {
                key: 'bond',
                label: 'Preview Bond Features',
            },
            {
                key: 'static',
                label: 'Preview Static Scenarios',
            },
        ];
    }
}
export const PreviewCustomCellRenderer = ({
    data,
    handlePreview,
}: {
    data: any;
    handlePreview: any;
}) => (
    <Space size="middle">
        <Dropdown
            menu={{
                items: getPreviewOptions(data),
                onClick: ({ key }) =>
                    handlePreview({
                        previewModal: key,
                        aladdinId: data.aladdinId,
                        assetId: data.assetAnalyticsSetupId,
                    }),
            }}
            overlayClassName="preview-dropdown"
            overlayStyle={{ padding: 0 }}
            placement="top"
        >
            <EyeFilled style={{ cursor: 'pointer', color: '#1D39C4' }} />
        </Dropdown>
    </Space>
);
