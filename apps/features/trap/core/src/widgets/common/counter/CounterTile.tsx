/* eslint-disable  @typescript-eslint/no-explicit-any */
import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import styles from './CounterTile.module.scss';
import { Typography } from 'antd';
import { useMemo } from 'react';
import { WidgetConfigProperty } from '../../../features/widget-studio/components/PropertyConfig';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { COUNTER_TILE_STORE_KEY } from '../../constants';
import { useGetActiveTab } from '../../../state/Tabs/hooks';

const getWidgetValues = (
    config: Record<string, any>,
    properties: Record<string, WidgetConfigProperty>
) => {
    const { params } = config;
    if (!properties) return {};
    if (!params) return {};
    const {
        textColor = properties['textColor']?.['default'] || '',
        titleText = properties['titleText']?.['default'] || '',
        suffixText = properties['suffixText']?.['default'] || '',
        prefixText = properties['prefixText']?.['default'] || '',
        titlePosition = properties['titlePosition']?.['default'] || 'top',
        emptyStateText = properties['emptyStateText']?.['default'] || '',
        numberFormat = properties['numberFormat']?.['default'] || 'integer',
    } = params;

    return {
        textColor,
        text: titleText,
        position: titlePosition,
        suffix: suffixText,
        prefix: prefixText,
        emptyText: emptyStateText,
        numberFormat,
    };
};

export const CounterTileWidget = (props: WidgetComponentProps) => {
    const {
        widgetInstance: { config = {} },
        widgetDefinition,
        result,
    } = props;

    const key = COUNTER_TILE_STORE_KEY;

    const setWidgetValueToChannel = useSetWidgetValue();
    const counterTileValue = useGetWidgetValue({
        channelId: config.params?.channel,
        key,
    });
    const activeTab = useGetActiveTab();

    const channelId = config.params?.channel;
    const value = config.params?.filter || null;

    const configSchema = widgetDefinition?.configSchema;
    const properties = configSchema?.properties || {};

    const { text, position, suffix, prefix, emptyText, textColor } = useMemo(
        () => getWidgetValues(config, properties),
        [config, properties]
    );

    const handleClick = () => {
        const isTileClickableConfig = config?.params?.['clickable'] ?? true;

        // if false - no click
        if (!isTileClickableConfig) return;

        setWidgetValueToChannel({
            key,
            channelId,
            value: counterTileValue === value ? null : value,
            activeTab,
        });
    };

    const widgetStyles = useMemo(() => {
        const styleObject = { titlePosition: '' };

        switch (position) {
            case 'bottom':
                styleObject['titlePosition'] = styles.bottom;
                break;
            case 'top':
                styleObject['titlePosition'] = styles.top;
                break;
        }
        return styleObject;
    }, [position]);

    const widgetColor = useMemo(() => {
        const { params = {} } = config;

        switch (params['themeMode']) {
            case 'customSolid':
                return { backgroundColor: params['customColor'], background: '' };
            case 'customGradient':
                return {
                    background: `linear-gradient(45deg, ${params['customGradientStart']}, ${params['customGradientEnd']})`,
                    backgroundColor: '',
                };
            default:
                return {
                    backgroundColor: properties['customColor']?.['default'] || '#FFFFFF',
                    background: '',
                };
        }
    }, [config, properties]);

    const content = useMemo(() => {
        if (!result) return emptyText;
        return result['counter'];
    }, [result, emptyText]);

    const widgetTextTitle = useMemo(() => {
        if (text) return text;

        if (result) return result['title'];
    }, [text, result]);

    return (
        <WidgetCardShell style={widgetColor}>
            <div className={styles.container} onClick={handleClick}>
                <Typography.Title
                    level={5}
                    className={`${widgetStyles.titlePosition} ${value === counterTileValue ? styles.activeTile : ''}`}
                    style={{ color: textColor }}
                >
                    {widgetTextTitle}
                </Typography.Title>
                <div className={styles.content}>
                    <Typography.Text className={styles.prefix} style={{ color: textColor }}>
                        {prefix}
                    </Typography.Text>
                    <Typography.Text strong className={styles.value} style={{ color: textColor }}>
                        {content}
                    </Typography.Text>
                    <Typography.Text className={styles.suffix} style={{ color: textColor }}>
                        {suffix}
                    </Typography.Text>
                </div>
            </div>
        </WidgetCardShell>
    );
};
