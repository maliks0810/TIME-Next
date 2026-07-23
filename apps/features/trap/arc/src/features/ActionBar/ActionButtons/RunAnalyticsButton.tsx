import { useUserInfo } from '@platform/utils';
import { useState } from 'react';
import { Button, Modal, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { postNewAssetStatus } from '../lib/services';
import { MessageInstance } from 'antd/es/message/interface';
import { extractCallable, extractInfoApplyMultiplierEnabledType, speedOverridesExist } from '../../../lib/helpers';
import { RUN_ANALYTICS_BUTTON_HELPTEXT } from '../../../shared/constants';

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

  const canRunAnalytics =
    selectedAssetStatus === 'ANALYTICS INPUT SENT TO ALADDIN' ||
    selectedAssetStatus === 'MANUAL' ||
    selectedAssetStatus === 'INVALID REQUEST' ||
    (selectedAssetStatus === 'ANALYTICS INPUT PENDING REVIEW' &&
      extractInfoApplyMultiplierEnabledType(selectedPayload) === false &&
      extractCallable(selectedPayload) === 'N' &&
      !speedOverridesExist(selectedPayload));

  const verifyAnalyticsInput = async () => {
    const assetId = searchParams.get('assetId');
    const status = 'Analytics Input Verified in Aladdin';

    if (!assetId) {
      console.warn('Please select a security from the table first.');
      return;
    }

    if (!username) {
      throw Error('There must be a user signed in to update status');
    }

    const payload = {
      assetAnalyticsSetupId: +assetId,
      status,
    };

    try {
      await postNewAssetStatus(payload);
      messageApi.success('Status updated successfully.');
       /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      console.error('Failed to update status:', err);
      messageApi.error(err?.response?.data?.message ?? 'Failed to update status. Please try again.');
    } finally {
      setIsRunAnaltyicsModalOpen(false);
    }
  };

  const conditionalOnClickAction = async () => {
    if (selectedAssetStatus === 'MANUAL') {
      setIsRunAnaltyicsModalOpen(true);
    } else {
      await verifyAnalyticsInput();
    }
  };

  const handleRunAnaltyicsCloseModal = () => {
    setIsRunAnaltyicsModalOpen(false);
  };

  return (
    <div>
      <Modal
        width="600px"
        height="100px"
        title="You have not published analytics input via ARC, Do you still want to run analytics?"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isRunAnaltyicsModalOpen}
        onOk={async () => {
          if (isLoading) return; // prevent multiple submits from modal  
          setIsLoading(true);
          try {
            await verifyAnalyticsInput();
          } finally {
            setIsLoading(false);
          }
        }}
        okText={'Yes'}
        okButtonProps={{ loading: isLoading }}
        onCancel={handleRunAnaltyicsCloseModal}
      >
      </Modal>
      <Tooltip title={RUN_ANALYTICS_BUTTON_HELPTEXT} placement="top">
        <Button
          type="primary"
          size="small"
          disabled={!canRunAnalytics || isLoading}
          loading={isLoading}
          onClick={async () => {
            if (isLoading) return; // prevent multiple calls  
            setIsLoading(true);
            try {
              await conditionalOnClickAction();
            } finally {
              setIsLoading(false);
            }
          }}
        >
          Run Analytics
        </Button>
      </Tooltip>
    </div>
  );
}; 