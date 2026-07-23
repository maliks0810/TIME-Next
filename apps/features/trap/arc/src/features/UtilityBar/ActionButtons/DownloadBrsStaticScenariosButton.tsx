/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import { normalizeStatus } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';
import { DOWNLOAD_BRS_STATIC_BUTTON_TEXT, STATIC_INTERFACE, STATUSES_ENUM } from '../../../shared/constants';
import { downloadBrsFileAPI } from '../lib/services';

type DownloadBrsStaticScenariosButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    assetAnalyticsSetupId: number;
    selectedPayload?: string;
};
export const DownloadBrsStaticScenariosButton = ({
    messageApi,
    assetAnalyticsSetupId,
    selectedAssetStatus
}: DownloadBrsStaticScenariosButtonProps) => {

    const canDownloadBrsAnalytics = selectedAssetStatus != normalizeStatus(STATUSES_ENUM.INPUT_PENDING_REVIEW)
        && selectedAssetStatus != normalizeStatus(STATUSES_ENUM.CORRECTION);

    const canPublish = !!assetAnalyticsSetupId && canDownloadBrsAnalytics;

    const handleToggleScenariosDownloadBrsModal = useCallback(async () => {
        const payload = {
            assetAnalyticsSetupId,
            interface: STATIC_INTERFACE
        };

        try {
            const response = await downloadBrsFileAPI(payload);

            if (response.status == 204) {
                messageApi.error(
                    'Failed to download the file; we have not published any static scenario file to BRS for this asset'
                );
            } else {
                const blob = new Blob([response.data], {
                    type: response.headers['content-type'] || 'text/csv',
                });

                const url = window.URL.createObjectURL(blob);

                let fileName = `download_${assetAnalyticsSetupId}_staticScenario_override.csv`;

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

                messageApi.success('Static Scenario BRS File Downloaded. Check Downloads on Browser');
            }
        } catch (err: any) {
            console.error('Failed to pull BRS file:', err);

            messageApi.error(
                err?.response?.data?.message ??
                'Failed to download static scenario brs file. Please try again.'
            );
        }
    }, [assetAnalyticsSetupId, messageApi]);

    return (
        <div>
            <Tooltip title={DOWNLOAD_BRS_STATIC_BUTTON_TEXT} placement='top'>
                <Button
                    className="DownloadBrsStaticScenarios"
                    type="primary"
                    disabled={!canPublish}
                    onClick={handleToggleScenariosDownloadBrsModal}
                >
                    Download BRS Static Scenarios
                </Button>
            </Tooltip>
        </div>
    );
};
