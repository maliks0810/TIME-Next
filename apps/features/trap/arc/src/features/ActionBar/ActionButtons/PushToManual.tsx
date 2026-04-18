import { useEffect, useState } from 'react';
import { Button, Modal, Tooltip } from 'antd';
import { useUserInfo } from '@platform/utils';
import { useSearchParams } from 'react-router-dom';
import { postPushToManual } from '../lib/services';
import { normalizeStatus } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';
import { MANUAL_BUTTON_HELP_TEXT } from '../../../shared/constants';

type PushToManualButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    setIsActionInprogress: (isLoading: boolean) => void;
};

export const PushToManualButton = ({
    selectedAssetStatus,
    messageApi,
    setIsActionInprogress
}: PushToManualButtonProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const userInfo = useUserInfo();
    const username = userInfo.email;
    const [isPushtoManualModalOpen, setIsPushtoManualModalOpen] = useState<boolean>(false);

    const handlePushtoManualCloseModal = () => {
        setIsPushtoManualModalOpen(!isPushtoManualModalOpen);
    };

    const manualModeDisabled =
        !!selectedAssetStatus
            ? (normalizeStatus(selectedAssetStatus) === 'MANUAL' || normalizeStatus(selectedAssetStatus) === 'ANALYTICS VERIFIED IN ALADDIN')
            : true;

    const conditionalOnClickAction = async () => {

        if (normalizeStatus(selectedAssetStatus) !== 'MANUAL') {
            setIsPushtoManualModalOpen(true);
        } else {
            await handlePushToManual();
        }
    }
    const handlePushToManual = async () => {
        const assetId = searchParams.get('assetId');
        if (!username || !assetId) return;
        setIsLoading(true);
        try {
            await postPushToManual({
                assetAnalyticsSetupId: +assetId,
                updatedBy: username,
            });
            messageApi.success('Pushed to Manual Bucket.');
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } catch (err: any) {
            console.error('Failed to push to Manual Bucket:', err);
            messageApi.error('Failed to push to Manual Bucket. Please try again.');
        } finally {
            setIsLoading(false);
            setIsPushtoManualModalOpen(false);
        }
    };

    useEffect(() => {
        setIsActionInprogress(isLoading);
    }, [isLoading]);

    return (
        <div>
            <Modal
                width="600px"
                height="100px"
                title="This action will push the asset to Manual Bucket, Do you still want to proceed?"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isPushtoManualModalOpen}
                onOk={handlePushToManual}
                okText={'Yes'}
                onCancel={handlePushtoManualCloseModal}
            >
            </Modal>
            <Tooltip title={MANUAL_BUTTON_HELP_TEXT} placement='top'>
                <Button
                    type="primary"
                    onClick={conditionalOnClickAction}
                    loading={isLoading}
                    disabled={manualModeDisabled}
                    size="small"
                >
                    Switch to Manual
                </Button>
            </Tooltip>
        </div>
    );
};
