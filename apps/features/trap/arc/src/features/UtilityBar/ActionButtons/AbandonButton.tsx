import { useCallback, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { AbandonAssetModal } from '../Modals/AbandonAssetModal';
import { ABANDON_BUTTON_HELPTEXT } from '../../../shared/constants';

type AbandonButtonProps = {
    selectedAssetStatus?: string;
};

export const AbandonButton = ({ selectedAssetStatus }: AbandonButtonProps) => {
    const [isAbandonModalOpen, setIsAbandonModalOpen] = useState<boolean>(false);

    const canAbandon =
        selectedAssetStatus &&
        selectedAssetStatus != 'ANALYTICS VERIFIED IN ALADDIN' &&
        selectedAssetStatus != 'ABANDONED' &&
        selectedAssetStatus != 'CORRECTION';
    const handleToggleAbandonModal = useCallback(() => {
        setIsAbandonModalOpen((isOpen) => !isOpen);
    }, []);

    return (
        <>
            <AbandonAssetModal isOpen={isAbandonModalOpen} onClose={handleToggleAbandonModal} />
            <Tooltip title={ABANDON_BUTTON_HELPTEXT} placement='top' popupVisible={false}>
                <Button
                    type="primary"
                    disabled={!canAbandon}
                    size="small"
                    onClick={handleToggleAbandonModal}
                >
                    Abandon
                </Button>
            </Tooltip>
        </>
    );
};
