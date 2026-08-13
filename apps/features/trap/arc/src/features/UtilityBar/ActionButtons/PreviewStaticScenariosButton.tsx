import { useCallback, useState } from 'react';
import PreviewStaticScenariosModal from '../Modals/PreviewStaticScenariosModal';
import { Button, Tooltip } from 'antd';
import { extractCallable, speedOverridesExist } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';
import { PREVIEW_STATIC_BUTTON_TEXT } from '../../../shared/constants';

type PreviewStaticScenariosButtonProps = {
    messageApi: MessageInstance;
    selectedAladdinId?: string;
    selectedPayload?: string;
};
export const PreviewStaticScenariosButton = ({
    messageApi,
    selectedAladdinId,
    selectedPayload,
}: PreviewStaticScenariosButtonProps) => {
    const [isScenariosPreviewModalOpen, setIsScenariosPreviewModalOpen] = useState(false);

    const canPublish = !!selectedAladdinId && (speedOverridesExist(selectedPayload) || extractCallable(selectedPayload) !== 'N');

    const handleToggleScenariosPreviewModal = useCallback(() => {
        setIsScenariosPreviewModalOpen((prevState) => !prevState);
    }, []);

    return (
        <div>
            <PreviewStaticScenariosModal
                toggleModal={handleToggleScenariosPreviewModal}
                isOpen={isScenariosPreviewModalOpen}
                aladdinId={selectedAladdinId as string}
                messageApi={messageApi}
            />
            <Tooltip title={PREVIEW_STATIC_BUTTON_TEXT} placement='top'>
                <Button
                    className="previewStaticScenarios"
                    type="primary"
                    disabled={!canPublish}
                    onClick={handleToggleScenariosPreviewModal}
                >
                    Preview Static Scenarios
                </Button>
            </Tooltip>
        </div>
    );
};
