import { useEffect, useState } from 'react';
import { Button, Modal, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { postVerifyAnalyticsOnAladdin } from '../lib/services';
import { normalizeStatus } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';
import { PUBLISH_TDC_BUTTON_HELPTEXT } from '../../../shared/constants';

type PublishToTDCButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    setIsActionInprogress: (isLoaing: boolean) => void;
};

export const PublishToTDCButton = ({
    selectedAssetStatus,
    messageApi,
    setIsActionInprogress
}: PublishToTDCButtonProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const [isPublishToTDCModalOpen, setIsPublishToTDCModalOpen] = useState<boolean>(false);

    const handlePublishToTDCCloseModal = () => {
        setIsPublishToTDCModalOpen(!isPublishToTDCModalOpen);
    };

    const verifyOnAladdinDisabled =
        !!selectedAssetStatus
            ? (normalizeStatus(selectedAssetStatus) !== 'ANALYTICS SENT TO ALADDIN' && normalizeStatus(selectedAssetStatus) !== 'MANUAL')
            : true;

    const conditionalOnClickAction = async () => {

        if (normalizeStatus(selectedAssetStatus) == 'MANUAL') {
            setIsPublishToTDCModalOpen(true);
        } else {
            await handleVerifyOnAladdin();
        }
    }
    const handleVerifyOnAladdin = async () => {
        const assetId = searchParams.get('assetId');
        if (!assetId) return;
        setIsLoading(true);
        try {
            await postVerifyAnalyticsOnAladdin({
                assetAnalyticsSetupId: +assetId,
            });
            messageApi.success('Verification on Aladdin recorded.');
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } catch (err: any) {
            console.error('Failed to publish to TDC:', err);
            messageApi.error('Failed to verify analytics on Aladdin. Please try again.');
        } finally {
            setIsPublishToTDCModalOpen(false);
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
                title="You have not published analytics via ARC, Do you still want to publish to TDC?"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isPublishToTDCModalOpen}
                onOk={async () => {
                    if (isLoading) return; // prevent multiple submits from modal  
                    setIsLoading(true);
                    try {
                        await handleVerifyOnAladdin();
                    } finally {
                        setIsLoading(false);
                    }
                }}
                okText={'Yes'}
                okButtonProps={{ loading: isLoading }}
                onCancel={handlePublishToTDCCloseModal}
            >
            </Modal>
            <Tooltip title={PUBLISH_TDC_BUTTON_HELPTEXT} placement='top'>
                <Button
                    type="primary"
                    onClick={async () => {
                        if (isLoading) return; // prevent multiple calls  
                        setIsLoading(true);
                        try {
                            await conditionalOnClickAction();
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                    loading={isLoading}
                    disabled={verifyOnAladdinDisabled}
                    size="small"
                >
                    Publish to TDC
                </Button>
            </Tooltip>
        </div>
    );
};
