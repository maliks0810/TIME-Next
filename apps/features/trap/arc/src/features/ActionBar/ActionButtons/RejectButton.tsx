import { useCallback, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { REJECT_BUTTON_HELPTEXT } from '../../../shared/constants';
import { RejectAssetModal } from '../Modals/RejectAssetModal';

type RejectButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    selectedPayload?: string
    setIsActionInprogress: (isLoaing: boolean) => void;
};

export const RejectButton = ({ selectedAssetStatus }: RejectButtonProps) => {
    const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);

    const canReject =
        selectedAssetStatus &&
        (selectedAssetStatus == 'CORRECTION');
    const handleToggleRejectModal = useCallback(() => {
        setIsRejectModalOpen((isOpen) => !isOpen);
    }, []);

    return (
        <>
            {canReject && (
                <>
                    <RejectAssetModal isOpen={isRejectModalOpen} onClose={handleToggleRejectModal} />
                    <Tooltip title={REJECT_BUTTON_HELPTEXT} placement='top' popupVisible={false}>
                        <Button
                            type="primary"
                            disabled={!canReject}
                            size="small"
                            onClick={handleToggleRejectModal}
                        >
                            Reject
                        </Button>
                    </Tooltip>
                </>
            )}
        </>
    );
};
