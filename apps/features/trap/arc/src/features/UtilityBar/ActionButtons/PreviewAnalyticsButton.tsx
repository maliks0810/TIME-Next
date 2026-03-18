import { useCallback, useState } from 'react';
import { Button, Tooltip } from 'antd';
import PreviewAnalyticsModal from '../Modals/PreviewAnalyticsModal';
import { normalizeStatus } from '../../../lib/helpers';
import { PREVIEW_ANALYTICS_BUTTON_TEXT, STATUSES_ENUM } from '../../../shared/constants';
import { MessageInstance } from 'antd/es/message/interface';

type PreviewAnalyticsButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    selectedAladdinId?: string;
};
export const PreviewAnalyticsButton = ({
    selectedAssetStatus,
    messageApi,
    selectedAladdinId,
}: PreviewAnalyticsButtonProps) => {
    const [isPreviewAnalyticsOverridesModalOpen, setIsPreviewAnalyticsOverridesModalOpen] =
        useState(false);

    const canPreviewAnalytics =
        selectedAssetStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_PENDING_REVIEW) ||
        selectedAssetStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN) ||
        selectedAssetStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_VERIFIED_IN_ALADDIN);

    const handleTogglePreviewAnalyticsOverrideModal = useCallback(() => {
        setIsPreviewAnalyticsOverridesModalOpen((prevState) => !prevState);
    }, []);

    return (
        <div>
            <PreviewAnalyticsModal
                aladdinId={selectedAladdinId as string}
                isOpen={isPreviewAnalyticsOverridesModalOpen}
                toggleModal={handleTogglePreviewAnalyticsOverrideModal}
                messageApi={messageApi}
            />
            <Tooltip title={PREVIEW_ANALYTICS_BUTTON_TEXT} placement='top'>
                <Button
                    className="previewStaticScenarios"
                    type="primary"
                    disabled={!canPreviewAnalytics}
                    onClick={handleTogglePreviewAnalyticsOverrideModal}
                >
                    Preview Analytics
                </Button>
            </Tooltip>
        </div>
    );
};
