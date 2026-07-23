import { useCallback, useState } from 'react';
import PreviewBondFeaturesModal from '../Modals/PreviewBondFeaturesModal';
import { Button, Tooltip } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { extractInfoApplyMultiplierEnabledType } from '../../../lib/helpers';
import { PREVIEW_BOND_BUTTON_TEXT } from '../../../shared/constants';

type PreviewBondFeaturesButtonProps = {
    messageApi: MessageInstance;
    selectedAladdinId?: string;
    selectedPayload?: string
};
export const PreviewBondFeaturesButton = ({
    messageApi,
    selectedAladdinId,
    selectedPayload
}: PreviewBondFeaturesButtonProps) => {
    const [isBondPreviewModalOpen, setIsBondPreviewModalOpen] = useState(false);

    const checkIsBondFeaturesDisabled = () => {
        if (!selectedPayload) {
            return true;
        }

        return extractInfoApplyMultiplierEnabledType(selectedPayload) === false;
    };

    const canPublish = !!selectedAladdinId &&!checkIsBondFeaturesDisabled();

    const handleToggleBondPreviewModal = useCallback(() => {
        setIsBondPreviewModalOpen((prevState) => !prevState);
    }, []);

    return (
        <div>
            <PreviewBondFeaturesModal
                toggleModal={handleToggleBondPreviewModal}
                isOpen={isBondPreviewModalOpen}
                aladdinId={selectedAladdinId as string}
                messageApi={messageApi}
            />
            <Tooltip title={PREVIEW_BOND_BUTTON_TEXT} placement='top'>
                <Button
                    className="previewBondFeatures"
                    type="primary"
                    disabled={!canPublish}
                    onClick={handleToggleBondPreviewModal}
                >
                    Preview Bond Features
                </Button>
            </Tooltip>
        </div>
    );
};
