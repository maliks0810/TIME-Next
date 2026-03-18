import { useUserInfo } from '@platform/utils';
import { useState } from 'react';
import { Button, Modal, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { postNewAssetStatus } from '../lib/services';
import { MessageInstance } from 'antd/es/message/interface';
import { extractCallable, extractCollateralType } from '../../../lib/helpers';
import { COMMON_COLLATERAL_TYPES, RUN_ANALYTICS_BUTTON_HELPTEXT } from '../../../shared/constants';

type RunAnalyticsProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    selectedPayload?: string;
};

export const RunAnalyticsButton = ({ messageApi, selectedAssetStatus, selectedPayload }: RunAnalyticsProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRunAnaltyicsModalOpen, setIsRunAnaltyicsModalOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const userInfo = useUserInfo();
    const username = userInfo.email;

    const canRunAnalytics = (selectedAssetStatus === 'ANALYTICS INPUT SENT TO ALADDIN' 
    || selectedAssetStatus === 'MANUAL'  
    || selectedAssetStatus === 'INVALID REQUEST')
    || (selectedAssetStatus === 'ANALYTICS INPUT PENDING REVIEW' && !COMMON_COLLATERAL_TYPES.includes(extractCollateralType(selectedPayload)) 
            && extractCallable(selectedPayload)=== 'N');

    const conditionalOnClickAction = async () => {

        if (selectedAssetStatus == 'MANUAL') {
            setIsRunAnaltyicsModalOpen(true);
        } else {
            await verifyAnalyticsInput();
        }
    }
    const handleRunAnaltyicsCloseModal = () => {
        setIsRunAnaltyicsModalOpen(!isRunAnaltyicsModalOpen);
    };
    const verifyAnalyticsInput = async () => {
        const assetId = searchParams.get('assetId');
        const status = 'Analytics Input Verified in Aladdin';

        if (!assetId) {
            console.warn('Please select a security from the table first.');
            return;
        }
        setIsLoading(true);
        if (!username) {
            setIsLoading(false);
            throw Error('There must be a user signed in to update status');
        }
        const payload = {
            assetAnalyticsSetupId: +assetId,
            status,
            updatedBy: username,
        };

        try {
            await postNewAssetStatus(payload);
            messageApi.success('Status updated successfully.');
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } catch (err: any) {
            console.error('Failed to update status:', err);
            messageApi.error(
                err?.response?.data?.message ?? 'Failed to update status. Please try again.'
            );
        } finally {
            setIsLoading(false);
            setIsRunAnaltyicsModalOpen(false);
        }
    };
    return (<div>
        <Modal
            width="600px"
            height="100px"
            title="You have not published analytics input via ARC, Do you still want to run analytics?"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isRunAnaltyicsModalOpen}
            onOk={verifyAnalyticsInput}
            okText={'Yes'}
            onCancel={handleRunAnaltyicsCloseModal}
        >
        </Modal>
        <Tooltip title={RUN_ANALYTICS_BUTTON_HELPTEXT} placement='top'>
            <Button
                type="primary"
                size="small"
                disabled={!canRunAnalytics}
                loading={isLoading}
                onClick={async () => {
                    await conditionalOnClickAction();
                }}
            >
                Run Analytics
            </Button>
        </Tooltip>
    </div>
    );
};
