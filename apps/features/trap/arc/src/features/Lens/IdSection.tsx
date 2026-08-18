import { Tooltip } from 'antd';
import '../../lib/styles.scss';

export function IdSection({
    ids,
    handleSearch,
}: {
    ids: string[];
    handleSearch: (aladdinId: string) => Promise<void>;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            {ids.map(aladdinId => (
                <Tooltip key={aladdinId}>
                    <div
                        className='lens-recent-asset-creations-buttons'
                        onClick={() => handleSearch(aladdinId)}
                    >
                        {aladdinId}
                    </div>
                </Tooltip>
            ))}
        </div>
    );
}