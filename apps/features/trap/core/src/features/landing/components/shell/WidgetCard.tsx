import React from 'react';

import {
    AppstoreOutlined,
    TableOutlined,
    BarChartOutlined,
    BankOutlined,
    UploadOutlined,
    ControlOutlined,
    PieChartOutlined,
    DashboardOutlined,
    FontSizeOutlined,
    SlidersOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import clsx from 'clsx';
import type { WidgetDefinitionLike } from '../../../../types/widget';
import styles from './WidgetsPanel.module.scss';
import { useActiveCanvas } from '../shell/activeCanvas';

// A representative icon per widget, inferred from its name/category — visual anchor
// for each catalogue row (mirrors the concept's widget cards).
function iconFor(widgetDef: WidgetDefinitionLike): React.ReactNode {
    const widgetName = widgetDef?.name?.toLowerCase() || '';
    const widgetCategory = widgetDef?.category?.toLowerCase() || '';
    if (/grid|table|tranche/.test(widgetName)) return <TableOutlined />;
    if (/chart|performance/.test(widgetName)) return <BarChartOutlined />;
    if (/deal|bank|capital|asset/.test(widgetName)) return <BankOutlined />;
    if (/cdi|upload|extract|staging/.test(widgetName)) return <UploadOutlined />;
    if (/text|comment|dynamic/.test(widgetName)) return <FontSizeOutlined />;
    if (/radio|checkbox|select|control|button|tabs|date|time/.test(widgetName))
        return <ControlOutlined />;
    if (/kpi|counter/.test(widgetName)) return <SlidersOutlined />;
    if (widgetCategory.includes('portfolio')) return <PieChartOutlined />;
    if (widgetCategory.includes('arc')) return <DashboardOutlined />;
    return <AppstoreOutlined />;
}

export const WidgetCard = ({ widgetDef }: { widgetDef: WidgetDefinitionLike }) => {
    const activeCanvas = useActiveCanvas();

    const selectWidget = (widgetDef: WidgetDefinitionLike) => {
        activeCanvas?.onWidgetParamsSelect({});
        activeCanvas?.setSelectedWidgetDefId(widgetDef?.id as string);
    };

    return (
        <Tooltip title={widgetDef?.description} mouseEnterDelay={0.5}>
            <div
                key={widgetDef?.id}
                className={clsx(styles.card, [
                    {
                        [styles.activeCard]: activeCanvas?.selectedWidgetDef?.id === widgetDef?.id,
                    },
                ])}
                onClick={() => selectWidget(widgetDef)}
            >
                <span className={styles.ic}>{iconFor(widgetDef)}</span>
                <span className={styles.tx}>
                    <div className={styles.name}>{widgetDef?.name}</div>
                    <div className={styles.desc}>
                        {widgetDef?.description || widgetDef?.uiHints?.category}
                    </div>
                </span>
            </div>
        </Tooltip>
    );
};
