import { WidgetComponentProps } from '../../../types/widget';
import { Typography } from 'antd';
import * as Icons from '@ant-design/icons';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import styles from './LinkWidget.module.scss';
import { useMemo } from 'react';

export const LinkWidget = ({ widgetInstance, widgetDefinition }: WidgetComponentProps) => {
    const { config } = widgetInstance;

    const title = config?.params?.title;
    const displayText = config?.params?.displayText;
    const description = config?.params?.description;
    const icon = config?.params?.icon;
    const isNewTab =
        config?.params?.isNewTab || widgetDefinition?.configSchema?.properties?.isNewTab?.default;

    const url = useMemo(() => {
        const url = config?.params?.url;
        return url ? `https://${url?.replaceAll('https://', '').replaceAll('http://')}` : '';
    }, [config]);

    const target = useMemo(() => (isNewTab ? '_blank' : '_self'), [isNewTab]);
    //@ts-expect-error: Workaround for icons to allow all values;
    const IconComponent = icon ? Icons[icon.trim()] : null;
    return (
        <WidgetCardShell>
            <div className={styles.container}>
                {title && <Typography.Title level={3}>{title}</Typography.Title>}
                <a className={styles.link} href={url} target={target}>
                    {icon && <IconComponent className={styles.icon} />}
                    <div className={styles.info}>
                        <Typography.Text strong>{displayText || url}</Typography.Text>
                        {description && (
                            <Typography.Text type="secondary">{description}</Typography.Text>
                        )}
                    </div>
                </a>
            </div>
        </WidgetCardShell>
    );
};
