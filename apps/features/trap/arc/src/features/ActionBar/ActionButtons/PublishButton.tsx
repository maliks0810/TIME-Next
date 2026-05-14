import { useEffect, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { publishAnalyticsInput } from '../lib/services';
import { extractCallable, extractCollateralType, normalizeStatus, speedOverridesExist } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';
import { COMMON_COLLATERAL_TYPES, PUBLISH_BUTTON_HELPTEXT } from '../../../shared/constants';

type PublishButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    selectedPayload?: string
    setIsActionInprogress: (isLoaing: boolean) => void;
};

export const PublishButton = ({ selectedAssetStatus, messageApi, selectedPayload, setIsActionInprogress }: PublishButtonProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchParams] = useSearchParams();

    const canPublish = normalizeStatus(selectedAssetStatus) === 'ANALYTICS INPUT PENDING REVIEW'
        && (COMMON_COLLATERAL_TYPES.includes(extractCollateralType(selectedPayload))
            || extractCallable(selectedPayload) !== 'N' || speedOverridesExist(selectedPayload));

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
        };
        try {
            await publishAnalyticsInput(payload);
            messageApi.success('Analytics inputs published successfully.');
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } catch (err: any) {
            console.error('Failed to publish analytics inputs:', err);
            if (err?.response?.status === 401) {
                const serverMessage = err?.response?.data ?? 'Unauthorized to perform this action';
                messageApi.error(`Failed to publish analytics inputs: ${serverMessage}`);
            } else {
                // Fallback for all other errors
                messageApi.error(
                    err?.response?.data?.message ??
                    'Failed to publish analytics inputs. Please try again.'
                );
            }
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        setIsActionInprogress(isLoading);
    }, [isLoading]);

    return (
        <Tooltip title={PUBLISH_BUTTON_HELPTEXT} placement='top'>
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
        </Tooltip>
    );
};
