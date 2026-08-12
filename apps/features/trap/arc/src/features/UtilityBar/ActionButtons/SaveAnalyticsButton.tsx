import { Button, Form, Input, Space } from 'antd';
import { STATUSES_ENUM } from '../../../shared/constants';
import { normalizeStatus } from '../../../lib/helpers';
import { useState } from 'react';

export const SaveAnalyticsButton = ({
    selectedAssetStatus,
    isAnalitycsSavePending,
}: {
    selectedAssetStatus?: string;
    isAnalitycsSavePending: boolean;
}) => {
    const [noteText, setNoteText] = useState("");

    const saveOverridesDisabled =
        !!selectedAssetStatus &&
        normalizeStatus(selectedAssetStatus) !==
        normalizeStatus(STATUSES_ENUM.ANALYTICS_PENDING_REVIEW) &&
        normalizeStatus(selectedAssetStatus) !==
        normalizeStatus(STATUSES_ENUM.MANUAL);
    const isButtonDisabled = saveOverridesDisabled || noteText.trim() === "";
    return (
        <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="noteTextArea" noStyle>
                <Input style={{ padding: "0px 11px" }} onChange={(e) => setNoteText(e.target.value)} />
            </Form.Item>

            <Form.Item label={null} noStyle>
                <Button
                    htmlType="submit"
                    size="small"
                    loading={isAnalitycsSavePending}
                    disabled={isButtonDisabled}
                >
                    Save Analytics
                </Button>
            </Form.Item>
        </Space.Compact>
    );
};
