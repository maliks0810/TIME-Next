import { useEffect, useState } from 'react';
import { Button, Divider } from 'antd';
import { TimeElapsed } from './components/TimeElapsed';
import { AssetInfoItem } from './components/AssetInfoItem';
import { convertDateToPST, getNextAction, getNextStatus } from './lib/helpers';
import { getModelInputById } from './lib/services';
import { NewAssetType } from './lib/types';
import { ClaimAssetPayload } from '../../lib/types';
import { claimAsset } from '../../lib/services';
import { useUserInfo } from '@platform/utils';

export const AssetInfo = ({
    selectedAssetId,
    latestUpdateTimestamp,
}: {
    selectedAssetId?: number | null;
    latestUpdateTimestamp: number;
}) => {
    const [assetInfo, setAssetInfo] = useState<NewAssetType | null>(null);
    const user = useUserInfo();

    useEffect(() => {
        if (selectedAssetId) {
            getModelInputById(selectedAssetId).then(({ data }) => {
                setAssetInfo(data.response);
            });
        }
    }, [selectedAssetId, latestUpdateTimestamp]);

    const handleClaim = () => {
        // Generate the Claim Payload
        const payload: ClaimAssetPayload = {
            claims: [
                {
                    anchorType: 'NAAID',
                    anchorId: selectedAssetId as number,
                    claimedBy: user.email as string,
                },
            ],
        };

        // Call the Claim
        claimAsset(payload).catch((e) => {
            console.warn(e);
        });
    };

    return (
        <div className="assetInfoContainer">
            <div style={{ flex: 1 }}>
                <AssetInfoItem title="Aladdin ID" value={assetInfo?.aladdinId} />
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <AssetInfoItem title="Asset Type" value={assetInfo?.assetType} />
                    <AssetInfoItem title="Asset Sub-Type" value={assetInfo?.assetSubType} />
                </div>
                <AssetInfoItem title="Internal Asset ID" value={assetInfo?.assetAnalyticsSetupId} />
            </div>
            <Divider type="vertical" style={{ height: '100%', padding: 8 }} />
            <div style={{ flex: 1 }}>
                <AssetInfoItem
                    title="Analytics Date/Time Start"
                    value={convertDateToPST(assetInfo?.createdDate)}
                />
                <TimeElapsed
                    title="Time since requested"
                    initialDate={assetInfo?.createdDate}
                    selectedAssetId={selectedAssetId}
                />
            </div>
            <Divider type="vertical" style={{ height: '100%', padding: 8 }} />
            <div style={{ flex: 1 }}>
                <AssetInfoItem title="Current State" value={assetInfo?.status} />
                <TimeElapsed
                    title="Time in Current State"
                    initialDate={assetInfo?.lastModifiedDate}
                    selectedAssetId={selectedAssetId}
                />
            </div>
            <Divider type="vertical" style={{ height: '100%', padding: 8 }} />
            <div style={{ flex: 1 }}>
                <AssetInfoItem title="Claimed By" value={assetInfo?.claimedBy} />
                <AssetInfoItem
                    title="Claimed At"
                    value={convertDateToPST(assetInfo?.claimedAt ?? '')}
                />
                <Button
                    className="claimButton"
                    onClick={handleClaim}
                    disabled={!selectedAssetId || user.email === assetInfo?.claimedBy}
                >
                    Take Over Claim
                </Button>
            </div>
            <Divider type="vertical" style={{ height: '100%', padding: 8 }} />
            <div style={{ flex: 1 }}>
                <AssetInfoItem title="Next Action" value={getNextAction(assetInfo?.status)} />
                <AssetInfoItem title="Next State" value={getNextStatus(assetInfo?.status)} />
                {/* <Button className="advanceButton">Advance to Next State</Button> */}
            </div>
        </div>
    );
};
