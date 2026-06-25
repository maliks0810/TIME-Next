/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { normalizeStatus } from '../../../lib/helpers';
import { downloadBrsFileAPI } from '../lib/services';
import { BOND_INTERFACE, DOWNLOAD_BRS_BOND_BUTTON_TEXT, STATUSES_ENUM } from '../../../shared/constants';

type DownloadBrsBondFeaturesButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    assetAnalyticsSetupId: number;
};
export const DownloadBrsBondFeaturesButton = ({
    messageApi,
    assetAnalyticsSetupId,
    selectedAssetStatus
}: DownloadBrsBondFeaturesButtonProps) => {

    const canDownloadBrsAnalytics = selectedAssetStatus === normalizeStatus(STATUSES_ENUM.INPUT_SENT_TO_ALADDIN) 
    || selectedAssetStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN) 
    || selectedAssetStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_VERIFIED_IN_ALADDIN)
    || selectedAssetStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_INPUT_VERIFIED_IN_ALADDIN);

    const canPublish = !!assetAnalyticsSetupId && canDownloadBrsAnalytics;

    const handleToggleBondDownloadBrsModal = useCallback(async () => {
        const payload = {
            assetAnalyticsSetupId,
            interface: BOND_INTERFACE
        };
    
        try {
            const response = await downloadBrsFileAPI(payload);
        
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'text/csv',
            });
        
            const url = window.URL.createObjectURL(blob);
        
            let fileName = `download_${assetAnalyticsSetupId}_bond_override.csv`;
        
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
        
            messageApi.success('Bond BRS File Downloaded. Check Downloads on Browser');
        } catch (err: any) {
            console.error('Failed to pull BRS file:', err);
            messageApi.error(
                err?.response?.data?.message ??
                'Failed to download bond brs file. Please try again.'
            );
        }
    }, [assetAnalyticsSetupId, messageApi]);

    return (
        <div>
            <Tooltip title={DOWNLOAD_BRS_BOND_BUTTON_TEXT} placement='top'>
                <Button
                    className="DownloadBrsBondFeatures"
                    type="primary"
                    disabled={!canPublish}
                    onClick={handleToggleBondDownloadBrsModal}
                >
                    Download BRS Bond Features
                </Button>
            </Tooltip>
        </div>
    );
};
