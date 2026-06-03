import { PreviewAnalyticsButton } from './ActionButtons/PreviewAnalyticsButton';
import { PreviewBondFeaturesButton } from './ActionButtons/PreviewBondFeatures';
import { PreviewStaticScenariosButton } from './ActionButtons/PreviewStaticScenariosButton';
import { message, Dropdown, Button, Divider } from 'antd';
import { SaveAnalyticsButton } from './ActionButtons/SaveAnalyticsButton';
import { Notes } from '../Notes';
import { useState } from 'react';
import { DownloadBrsStaticScenariosButton } from './ActionButtons/DownloadBrsStaticScenariosButton';
import { DownloadBrsAnalyticsButton } from './ActionButtons/DownloadBrsAnalyticsButton';
import { DownloadBrsBondFeaturesButton } from './ActionButtons/DownloadBrsBondFeatures';

type UtilityBarProps = {
    isAnalitycsSavePending: boolean;
    selectedAssetStatus?: string;
    selectedAladdinId?: string;
    selectedRowRequestId: number;
    selectedPayload?: string
};

export const UtilityBar = ({
    selectedAssetStatus,
    selectedAladdinId,
    isAnalitycsSavePending,
    selectedRowRequestId,
    selectedPayload
}: UtilityBarProps) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

    const items = [
        {
            key: 'previewBondFeaturesButton',
            label: (
                <PreviewBondFeaturesButton
                    messageApi={messageApi}
                    selectedAladdinId={selectedAladdinId}
                    selectedPayload={selectedPayload}
                />
            ),
        },
        {
            key: 'previewStaticScenariosButton',
            label: (
                <PreviewStaticScenariosButton
                    messageApi={messageApi}
                    selectedAladdinId={selectedAladdinId}
                    selectedPayload={selectedPayload}
                />
            ),
        },
        {
            key: 'previewAnalyticsButton',
            label: (
                <PreviewAnalyticsButton
                    messageApi={messageApi}
                    selectedAssetStatus={selectedAssetStatus}
                    selectedAladdinId={selectedAladdinId}
                />
            ),
        },
    ];
    const downLoadBrsitems = [
        {
            key: 'downloadBrsBondFeaturesButton',
            label: (
                <DownloadBrsBondFeaturesButton
                    messageApi={messageApi}
                    assetAnalyticsSetupId={selectedRowRequestId}
                    selectedAssetStatus={selectedAssetStatus}
                />
            ),
        },
        {
            key: 'downloadBrsStaticScenariosButton',
            label: (
                <DownloadBrsStaticScenariosButton
                    messageApi={messageApi}
                    assetAnalyticsSetupId={selectedRowRequestId}
                    selectedAssetStatus={selectedAssetStatus}
                    selectedPayload={selectedPayload}
                />
            ),
        },
        {
            key: 'downloadBrsAnalyticsButton',
            label: (
                <DownloadBrsAnalyticsButton
                    messageApi={messageApi}
                    selectedAssetStatus={selectedAssetStatus}
                    assetAnalyticsSetupId={selectedRowRequestId}
                />
            ),
        },
    ];
    const toggleNotesModal = (isOpen = false) => {
        setIsNotesModalOpen(isOpen);
    };

    return (
        <div className="actionBarContainer">
            {contextHolder}
            <div className="actionBarHeader">Utility Bar</div>
            <div className="actionBarButtonsContainer" style={{ justifyContent: 'end' }}>
                <div style={{ flex: 1 }}>
                    <SaveAnalyticsButton
                        isAnalitycsSavePending={isAnalitycsSavePending}
                        selectedAssetStatus={selectedAssetStatus}
                    />
                </div>
                <div style={{ height: '100%' }}>
                    <Divider type="vertical" />
                </div>
                <Dropdown menu={{ items }}>
                    <Button size="small">Preview</Button>
                </Dropdown>
                <Dropdown menu={{ items: downLoadBrsitems }}>
                    <Button size="small">Download</Button>
                </Dropdown>
                <Button size="small" onClick={() => toggleNotesModal(true)}>View Comments</Button>
            </div>
            {isNotesModalOpen && <Notes assetAnalyticsSetupId={selectedRowRequestId} isOpen={isNotesModalOpen} handleClose={toggleNotesModal} />}
        </div>
    );
};
