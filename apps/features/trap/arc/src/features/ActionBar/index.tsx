import { AbandonButton } from '../UtilityBar/ActionButtons/AbandonButton';
import { PublishAnalyticsButton } from './ActionButtons/PublishAnalyticsButton';
import { PublishButton } from './ActionButtons/PublishButton';
import { PublishToTDCButton } from './ActionButtons/PublishToTDC';
import { RunAnalyticsButton } from './ActionButtons/RunAnalyticsButton';
import { message } from 'antd';

type ActionBarProps = {
    selectedAssetStatus?: string;
    setIsActionInprogress: (isActionInProgress: boolean) => void;
};

export const ActionBar = ({ selectedAssetStatus, setIsActionInprogress }: ActionBarProps) => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <div className="actionBarContainer">
            {contextHolder}
            <div className="actionBarHeader">Action Bar</div>
            <div className="actionBarButtonsContainer">
                <PublishButton messageApi={messageApi} selectedAssetStatus={selectedAssetStatus} setIsActionInprogress={setIsActionInprogress} />
                <RunAnalyticsButton
                    messageApi={messageApi}
                    selectedAssetStatus={selectedAssetStatus}
                />
                <PublishAnalyticsButton
                    messageApi={messageApi}
                    selectedAssetStatus={selectedAssetStatus}
                    setIsActionInprogress={setIsActionInprogress}
                />
                <PublishToTDCButton
                    messageApi={messageApi}
                    selectedAssetStatus={selectedAssetStatus}
                    setIsActionInprogress={setIsActionInprogress}
                />
                <AbandonButton selectedAssetStatus={selectedAssetStatus} />
            </div>
        </div>
    );
};
