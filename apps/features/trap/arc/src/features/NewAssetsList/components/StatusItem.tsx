import { Card } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { NewAsset, TableRow } from '../../../lib/types';

const getCardBodyStyles = (isActive?: boolean) =>
    isActive
        ? {
            padding: '6px 6px',
            border: '1px solid #0080ffff',
            borderRadius: 8,
        }
        : {
            padding: '6px 6px',
        };

export const StatusItem = ({
    asset,
    isActive,
}: {
    asset: TableRow<NewAsset>;
    isActive?: boolean;
}) => {
    const [, setSearchParams] = useSearchParams();

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
                                <div style={{ color: '#9ca3af', fontSize: 12, wordBreak: 'break-all' }}>
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
                    </div>
                </div>
            </Card>
        </div>
    );
};
