/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import { normalizeStatus } from '../../../lib/helpers';
import { ANALYTICS_INTERFACE, DOWNLOAD_BRS_ANALYTICS_BUTTON_TEXT, STATUSES_ENUM } from '../../../shared/constants';
import { MessageInstance } from 'antd/es/message/interface';
import { downloadBrsFileAPI } from '../lib/services';

type DownloadBrsAnalyticsButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    assetAnalyticsSetupId: number;
};
export const DownloadBrsAnalyticsButton = ({
    selectedAssetStatus,
    assetAnalyticsSetupId,
    messageApi
}: DownloadBrsAnalyticsButtonProps) => {

    const canDownloadBrsAnalytics =
        selectedAssetStatus != normalizeStatus(STATUSES_ENUM.INPUT_PENDING_REVIEW)
        && selectedAssetStatus != normalizeStatus(STATUSES_ENUM.CORRECTION)
        && selectedAssetStatus != normalizeStatus(STATUSES_ENUM.INPUT_SENT_TO_ALADDIN)
        && selectedAssetStatus != normalizeStatus(STATUSES_ENUM.CALCUALTION_IN_PROGRESS)
        && selectedAssetStatus != normalizeStatus(STATUSES_ENUM.ANALYTICS_PENDING_REVIEW)
        && selectedAssetStatus != normalizeStatus(STATUSES_ENUM.INVALID_REQUEST);

    const handleToggleDownloadBrsAnalyticsOverrideModal = useCallback(async () => {
        const payload = {
            assetAnalyticsSetupId,
            interface: ANALYTICS_INTERFACE,
        };

        try {
            const response = await downloadBrsFileAPI(payload);

            if (response.status == 204) {
                messageApi.error(
                    'Failed to download the file; we have not published any analytics to BRS for this asset'
                );
            } else {
                const blob = new Blob([response.data], {
                    type: response.headers['content-type'] || 'text/csv',
                });

                const url = window.URL.createObjectURL(blob);

                let fileName = `download_${assetAnalyticsSetupId}_analytics_override.csv`;

                const contentDisposition =
                    response.headers['content-disposition'] ||
                    response.headers['Content-Disposition'];

                if (contentDisposition) {
                    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
                    const regularMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

                    if (utf8Match?.[1]) {
                        fileName = decodeURIComponent(utf8Match[1]);
                    } else if (regularMatch?.[1]) {
                        fileName = regularMatch[1];
                    }
                }

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();

                a.remove();
                window.URL.revokeObjectURL(url);

                messageApi.success('Analytics BRS File Downloaded. Check Downloads on Browser');
            }
        } catch (err: any) {
            console.error('Failed to pull BRS file:', err);

            messageApi.error(
                err?.response?.data?.message ??
                'Failed to download analytics brs file. Please try again.'
            );
        }
    }, [assetAnalyticsSetupId, messageApi]);

    return (
        <div>
            <Tooltip title={DOWNLOAD_BRS_ANALYTICS_BUTTON_TEXT} placement='top'>
                <Button
                    className="downloadBrsStaticScenarios"
                    type="primary"
                    disabled={!canDownloadBrsAnalytics}
                    onClick={handleToggleDownloadBrsAnalyticsOverrideModal}
                >
                    Download BRS Analytics
                </Button>
            </Tooltip>
        </div>
    );
};
