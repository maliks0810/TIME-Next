
import { useState } from 'react';
import { Button } from 'antd';
import { ClaimAssetPayload } from '../../../lib/types';
import { claimAsset } from '../../../lib/services';
import { useUserInfo } from '@platform/utils';
import { NewAssetType } from '../lib/types';

function ClaimButton({ selectedAssetId, assetInfo }: {
    selectedAssetId: number | null;
    assetInfo: NewAssetType | null
}) {
    const [loading, setLoading] = useState(false);
    const user = useUserInfo();

    const onClickClaim = async () => {
        if (loading) return; // Prevent multiple calls if already loading  

        setLoading(true);
        try {
            // Generate the Claim Payload
            const payload: ClaimAssetPayload = {
                claims: [
                    {
                        anchorType: 'NAAID',
                        anchorId: selectedAssetId as number,
                    },
                ],
            };
            // Call the Claim
            await claimAsset(payload).catch((e) => {
                console.warn(e);
            });
        } catch (error) {
            console.error('Claim failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', paddingTop: 10, paddingBottom: 4 }}>
            <Button
                className="claimButton"
                onClick={onClickClaim}
                size="small"
                disabled={!selectedAssetId || user.email === assetInfo?.claimedBy}
                loading={loading}
            >
                Take Over Claim
            </Button>
        </div>
    );
}

export default ClaimButton;