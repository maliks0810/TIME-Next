import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useUserInfo } from '@platform/utils';
import { useSearchParams } from 'react-router-dom';
import { publishAnalyticsInput } from '../lib/services';
import { normalizeStatus } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';

type PublishButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    setIsActionInprogress: (isLoaing: boolean) => void;
};

export const PublishButton = ({ selectedAssetStatus, messageApi, setIsActionInprogress }: PublishButtonProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const userInfo = useUserInfo();
    const username = userInfo.email;

    const canPublish =
        !!selectedAssetStatus &&
        normalizeStatus(selectedAssetStatus) === 'ANALYTICS INPUT PENDING REVIEW';

    const publishOverrides = async () => {
        const assetId = searchParams.get('assetId');

        if (!assetId) {
            messageApi.warning('Please select a security from the table first.');
            return;
        }
        if (!canPublish) {
            messageApi.warning('Status must be "ANALYTICS INPUT PENDING REVIEW" to publish.');
            return;
        }
        setIsLoading(true);

        const payload = {
            assetAnalyticsSetupId: +assetId,
            updatedBy: username,
        };
        try {
            await publishAnalyticsInput(payload);
            messageApi.success('Analytics inputs published successfully.');
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } catch (err: any) {
            console.error('Failed to publish analytics inputs:', err);
            messageApi.error(
                err?.response?.data?.message ??
                    'Failed to publish analytics inputs. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };
    useEffect (() => {
        setIsActionInprogress(isLoading);
    }, [isLoading]);

    return (
        <Button
            type="primary"
            size="small"
            loading={isLoading}
            disabled={!canPublish}
            onClick={async () => {
                if (!isLoading)
                    await publishOverrides();
            }}
        >
            Publish Inputs
        </Button>
    );
};
