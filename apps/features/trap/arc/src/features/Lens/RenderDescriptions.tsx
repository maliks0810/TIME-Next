import { Descriptions, Empty } from 'antd';
import { formatTimelineTime, formatTimelineDate, renderValue, checkIsChanged, formatLabel } from './lib/helper';

export const renderDescriptions = (
    item: Record<string, unknown> | undefined,
    baseline: Record<string, unknown> | undefined,
    columns = 2,
) => {
    if (!item) { return <Empty />; }

    // format the dates into more logical formats, even if the type becomes different from what the database stores
    if (item['analysisDate']) item['analysisDate'] = new Date(item['analysisDate'] as Date).toISOString().split('T')[0];
    if (item['riskDate']) item['riskDate'] = new Date(item['riskDate'] as Date).toISOString().split('T')[0];
    if (item['krdDate']) item['krdDate'] = new Date(item['krdDate'] as Date).toISOString().split('T')[0];
    if (item['createdDate']) item['createdDate'] = formatTimelineDate(item['createdDate'] as string).toString() + ', ' + formatTimelineTime(item['createdDate'] as string).toString();
    if (item['lastModifiedDate']) {
        const lastModifiedDateValue = item['lastModifiedDate'];
        delete item['lastModifiedDate']; // delete and then readd to move the its order to the last place
        item['lastModifiedDate'] = lastModifiedDateValue;
        item['lastModifiedDate'] = formatTimelineDate(item['lastModifiedDate'] as string).toString() + ', ' + formatTimelineTime(item['lastModifiedDate'] as string);
    }
    
    const entries = Object.entries(item);
    if (entries.length === 0) { return <Empty />; }

    const sameRef = baseline !== undefined && baseline === item;
    const cellWidth = `${100 / (columns * 2)}%`;   // 2 cells (label+content) per column

    const highlightStyle: React.CSSProperties = {
        backgroundColor: '#fff7e6',
        width: cellWidth,
    };
    const labelStyle: React.CSSProperties = {
        width: cellWidth,
        fontWeight: 500,
    };
    const contentStyle: React.CSSProperties = {
        width: cellWidth,
    };

    return (
        <Descriptions
            bordered
            size="small"
            column={columns}
            labelStyle={labelStyle}
            contentStyle={contentStyle}
        >

            {entries.map(([key, value]) => {
                const changed =
                    !sameRef &&
                    baseline !== undefined &&
                    checkIsChanged(value, baseline?.[key]);
                return (
                    <Descriptions.Item
                        key={key}
                        label={formatLabel(key)}
                        contentStyle={changed ? highlightStyle : contentStyle}
                    >
                        {renderValue(value)}
                        {changed && (
                            <div style={{ fontSize: 11, color: '#888' }}>
                                (was: {renderValue(baseline?.[key])})
                            </div>
                        )}
                    </Descriptions.Item>
                );
            })}


        </Descriptions>
    );
};