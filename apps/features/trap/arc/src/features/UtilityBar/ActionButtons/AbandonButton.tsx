import { useCallback, useState } from 'react';
import { Button } from 'antd';
import { AbandonAssetModal } from '../Modals/AbandonAssetModal';

type AbandonButtonProps = {
    selectedAssetStatus?: string;
};

export const AbandonButton = ({ selectedAssetStatus }: AbandonButtonProps) => {
    const [isAbandonModalOpen, setIsAbandonModalOpen] = useState<boolean>(false);

    const canAbandon =
        selectedAssetStatus &&
        selectedAssetStatus != 'ANALYTICS VERIFIED IN ALADDIN' &&
        selectedAssetStatus != 'ABANDONED';
    const handleToggleAbandonModal = useCallback(() => {
        setIsAbandonModalOpen((isOpen) => !isOpen);
    }, []);

    return (
        <>
            <AbandonAssetModal isOpen={isAbandonModalOpen} onClose={handleToggleAbandonModal} />
            <Button
                type="primary"
                disabled={!canAbandon}
                size="small"
                onClick={handleToggleAbandonModal}
            >
                Abandon
            </Button>
        </>
    );
};
