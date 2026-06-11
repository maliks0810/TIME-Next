import { useCallback, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { ACCEPT_BUTTON_HELPTEXT } from '../../../shared/constants';
import { AcceptAssetModal } from '../Modals/AcceptAssetModal';

type AcceptButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    selectedPayload?: string
    setIsActionInprogress: (isLoaing: boolean) => void;
};

export const AcceptButton = ({ selectedAssetStatus }: AcceptButtonProps) => {
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState<boolean>(false);

    const canAccept =
        selectedAssetStatus &&
        (selectedAssetStatus == 'CORRECTION');
    const handleToggleAcceptModal = useCallback(() => {
        setIsAcceptModalOpen((isOpen) => !isOpen);
    }, []);

    return (
        <>
            {canAccept && (
                <>
                    <AcceptAssetModal isOpen={isAcceptModalOpen} onClose={handleToggleAcceptModal} />
                    <Tooltip title={ACCEPT_BUTTON_HELPTEXT} placement='top' popupVisible={false}>
                        <Button
                            type="primary"
                            disabled={!canAccept}
                            size="small"
                            onClick={handleToggleAcceptModal}
                        >
                            Accept
                        </Button>
                    </Tooltip>
                </>
            )}
        </>
    );
};
