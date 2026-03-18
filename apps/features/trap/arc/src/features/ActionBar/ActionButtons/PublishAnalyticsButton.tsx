import { useEffect, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { useUserInfo } from '@platform/utils';
import { useSearchParams } from 'react-router-dom';
import { publishAnalytics, postVerifyAnalytics } from '../lib/services';
import { normalizeStatus } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';
import { PUBLISH_ANALYTICS_BUTTON_HELPTEXT } from '../../../shared/constants';

type PublishAnalyticsButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    setIsActionInprogress: (isLoaing: boolean) => void;
};

export const PublishAnalyticsButton = ({
    selectedAssetStatus,
    messageApi,
    setIsActionInprogress
}: PublishAnalyticsButtonProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const userInfo = useUserInfo();
    const username = userInfo.email;

    const publishAnalyticsDisabled =
        !!selectedAssetStatus ? normalizeStatus(selectedAssetStatus) !== 'ANALYTICS PENDING REVIEW' : true;

    const handlePublishAnalytics = async () => {
        const assetId = searchParams.get('assetId');
        if (!username || !assetId) return;
        setIsLoading(true);
        try {
            await publishAnalytics({
                assetAnalyticsSetupId: +assetId,
                updatedBy: username,
            });
            await postVerifyAnalytics({
                updatedBy: username,
                assetAnalyticsSetupId: +assetId,
            });
            messageApi.success('Analytics verification sent.');
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } catch (err: any) {
            messageApi.error(
                err?.response?.data?.message ?? 'Failed to verify analytics. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsActionInprogress(isLoading);
    }, [isLoading]);

    return (
        <Tooltip title={PUBLISH_ANALYTICS_BUTTON_HELPTEXT} placement='top'>
            <Button
                type="primary"
                onClick={handlePublishAnalytics}
                loading={isLoading}
                disabled={publishAnalyticsDisabled}
                size="small"
            >
                Publish Analytics
            </Button>
        </Tooltip>
    );
};
