import { MessageInstance } from 'antd/es/message/interface';
import PreviewAnalyticsModal from '../../../../../arc/src/features/UtilityBar/Modals/PreviewAnalyticsModal';
import PreviewBondFeaturesModal from '../../../../../arc/src/features/UtilityBar/Modals/PreviewBondFeaturesModal';
import PreviewStaticScenariosModal from '../../../../../arc/src/features/UtilityBar/Modals/PreviewStaticScenariosModal';

export const PreviewModals = ({
    previewState,
    handleToggle,
    messageApi,
}: {
    previewState: {
        previewModal: 'bond' | 'static' | 'analytics' | null;
        aladdinId: string | null;
        assetId: string | null;
    };
    handleToggle: () => void;
    messageApi: MessageInstance;
}) => {
    switch (previewState.previewModal) {
        case 'analytics':
            return (
                <PreviewAnalyticsModal
                    isOpen
                    aladdinId={previewState.aladdinId as string}
                    assetId={previewState.assetId as string}
                    toggleModal={handleToggle}
                    messageApi={messageApi}
                />
            );
        case 'bond':
            return (
                <PreviewBondFeaturesModal
                    isOpen
                    aladdinId={previewState.aladdinId as string}
                    assetId={previewState.assetId as string}
                    toggleModal={handleToggle}
                    messageApi={messageApi}
                />
            );
        case 'static':
            return (
                <PreviewStaticScenariosModal
                    isOpen
                    aladdinId={previewState.aladdinId as string}
                    assetId={previewState.assetId as string}
                    toggleModal={handleToggle}
                    messageApi={messageApi}
                />
            );
        default:
            return null;
    }
};
