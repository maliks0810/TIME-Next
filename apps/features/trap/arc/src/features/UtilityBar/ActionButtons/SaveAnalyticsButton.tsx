import { Button, Form, Input, Space } from 'antd';
import { STATUSES_ENUM } from '../../../shared/constants';
import { normalizeStatus } from '../../../lib/helpers';

export const SaveAnalyticsButton = ({
    selectedAssetStatus,
    isAnalitycsSavePending,
}: {
    selectedAssetStatus?: string;
    isAnalitycsSavePending: boolean;
}) => {
    const saveOverridesDisabled =
        !!selectedAssetStatus &&
        normalizeStatus(selectedAssetStatus) !==
        normalizeStatus(STATUSES_ENUM.ANALYTICS_PENDING_REVIEW);

    return (
        <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="noteTextArea" noStyle>
                <Input style={{ padding: "0px 11px" }} />
            </Form.Item>

            <Form.Item label={null} noStyle>
                <Button
                    htmlType="submit"
                    size="small"
                    loading={isAnalitycsSavePending}
                    disabled={saveOverridesDisabled}
                >
                    Save Analytics
                </Button>
            </Form.Item>
        </Space.Compact>
    );
};
