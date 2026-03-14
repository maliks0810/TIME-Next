import { useCallback, useState } from 'react';
import PreviewStaticScenariosModal from '../Modals/PreviewStaticScenariosModal';
import { Button } from 'antd';
import { normalizeStatus } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';

type PreviewStaticScenariosButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    selectedAladdinId?: string;
};
export const PreviewStaticScenariosButton = ({
    selectedAssetStatus,
    messageApi,
    selectedAladdinId,
}: PreviewStaticScenariosButtonProps) => {
    const [isScenariosPreviewModalOpen, setIsScenariosPreviewModalOpen] = useState(false);

    const canPublish =
        !!selectedAssetStatus &&
        normalizeStatus(selectedAssetStatus) === 'ANALYTICS INPUT PENDING REVIEW';

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
            <Button
                className="previewStaticScenarios"
                type="primary"
                disabled={!canPublish}
                onClick={handleToggleScenariosPreviewModal}
            >
                Preview Static Scenarios
            </Button>
        </div>
    );
};
