import { useCallback, useState } from 'react';
import PreviewBondFeaturesModal from '../Modals/PreviewBondFeaturesModal';
import { Button } from 'antd';
import { normalizeStatus } from '../../../lib/helpers';
import { MessageInstance } from 'antd/es/message/interface';

// const CollateralTypesWithBondFeatureEnabled = ['NQM', 'CES', 'NPL'];

type PreviewBondFeaturesButtonProps = {
    messageApi: MessageInstance;
    selectedAssetStatus?: string;
    selectedAladdinId?: string;
};
export const PreviewBondFeaturesButton = ({
    selectedAssetStatus,
    messageApi,
    selectedAladdinId,
}: PreviewBondFeaturesButtonProps) => {
    const [isBondPreviewModalOpen, setIsBondPreviewModalOpen] = useState(false);

    // const checkIsBondFeaturesDisabled = useCallback(() => {
    //     if (!assetInfo) {
    //         return true;
    //     }
    //     const assetInfoCollateralType = extractCollateralType(assetInfo?.payload);

    //     return !CollateralTypesWithBondFeatureEnabled.some(
    //         (collatType) => collatType === assetInfoCollateralType
    //     );
    // }, [assetInfo]);

    const canPublish =
        !!selectedAssetStatus &&
        normalizeStatus(selectedAssetStatus) === 'ANALYTICS INPUT PENDING REVIEW';

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
            <Button
                className="previewStaticScenarios"
                type="primary"
                disabled={!canPublish}
                onClick={handleToggleBondPreviewModal}
            >
                Preview Bond Features
            </Button>
        </div>
    );
};
