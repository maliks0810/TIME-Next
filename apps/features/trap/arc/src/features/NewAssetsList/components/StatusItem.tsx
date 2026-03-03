import { Button, Card } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ClaimAssetPayload, NewAsset, TableRow } from '../../../lib/types';
import { claimAsset } from '../../../lib/services';
import { useUserInfo } from '@platform/utils';

const getCardBodyStyles = (isActive?: boolean) =>
    isActive
        ? {
              padding: '6px 8px',
              border: '1px solid #0080ffff',
              borderRadius: 8,
          }
        : {
              padding: '6px 8px',
          };

export const StatusItem = ({
    asset,
    isActive,
}: {
    asset: TableRow<NewAsset>;
    isActive?: boolean;
}) => {
    const [, setSearchParams] = useSearchParams();
    const user = useUserInfo();
    const handleClaim = () => {
        // Generate the Claim Payload
        const payload: ClaimAssetPayload = {
            claims: [
                {
                    anchorType: 'NAAID',
                    anchorId: asset.assetAnalyticsSetupId as number,
                    claimedBy: user.email as string,
                },
            ],
        };

        // Call the Claim
        claimAsset(payload).catch((e) => {
            console.warn(e);
        });
    };

    const handleSelectAsset = () => {
        const params = new URLSearchParams();
        params.set('assetId', asset.assetAnalyticsSetupId + '');
        setSearchParams(params);
    };

    return (
        <div style={{ padding: '4px 0' }}>
            <Card
                styles={{
                    body: getCardBodyStyles(isActive),
                }}
                onClick={handleSelectAsset}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <div>{asset.aladdinId}</div>
                        <div style={{ color: '#9ca3af', fontSize: 12 }}>{asset.raw.assetType}</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div>
                            {asset.raw.claimedBy ? (
                                <div style={{ color: '#9ca3af', fontSize: 12 }}>
                                    <div>Claimed By: {asset.raw.claimedBy}</div>
                                    <div>Claimed At: {asset.raw.claimedAt}</div>
                                </div>
                            ) : null}
                            {asset.raw.status === 'ANALYTICS CALCULATION IN PROGRESS' ? (
                                <div style={{ color: '#9ca3af', fontSize: 12 }}>
                                    Triggered At: {asset.raw.lastModifiedDate}
                                </div>
                            ) : null}
                        </div>
                        {user.email !== asset.raw.claimedBy ? (
                            <Button
                                onClick={handleClaim}
                                type="text"
                                style={{ color: '#59d75dff' }}
                            >
                                + Claim
                            </Button>
                        ) : null}
                    </div>
                </div>
            </Card>
        </div>
    );
};
