import { useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { downloadBRSFileZip } from './lib/services';
import { AxiosResponse } from '@platform/utils';
import axios from 'axios';

const getFile = (response: AxiosResponse, fileName: string) => {
    
    const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/zip',
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
}

interface DownloadBrsZipButtonProps {
    assetAnalyticsSetupId: string;
    aladdinId: string;
    messageApi: MessageInstance;
}
export const DownloadBrsZipButton = ({
    assetAnalyticsSetupId,
    aladdinId,
    messageApi
}: DownloadBrsZipButtonProps) => {
    const handleToggleDownloadBrsZip = useCallback(async () => {

        try{
            const response = await downloadBRSFileZip(Number(assetAnalyticsSetupId));

            const contentDisposition = response.headers['content-disposition'];

            let fileName = 'download.zip';
            if (contentDisposition) {
                const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
                const normalMatch = contentDisposition.match(/filename=([^;]+)/i);
                
                if (utf8Match) {
                    fileName = decodeURIComponent(utf8Match[1]);
                } else if (normalMatch) {
                    fileName = normalMatch[1].replace(/['"]/g, '');
                }
            }
            getFile(
                response,
                `${aladdinId}${fileName}`
            );

            messageApi.success('Analytics BRS File Downloaded. Check Downloads on Browser');
        }
        catch (err: unknown) {            
            if (axios.isAxiosError(err) && err?.response?.status === 404) {
                console.error('404 BRS file does not exist');
                messageApi.error('No BRS files to download');
            }
            else{
                messageApi.error(
                    'Failed to download bond brs file. Something else went wrong.'
                );
            }
        }
        
        
    }, [assetAnalyticsSetupId, messageApi]);

    return (
        <Tooltip title='Be sure you select the correct ID when there are multiple' placement='top'>
            <Button
                onClick={handleToggleDownloadBrsZip}
            >
                Download BRS Files
            </Button>
        </Tooltip>
    );
};
