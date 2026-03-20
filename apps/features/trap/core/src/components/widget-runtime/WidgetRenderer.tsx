import { Typography } from 'antd';
import { widgetRegistry } from '../../registry/widgetRegistry';
import WidgetCardShell from '../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../types/widget';

export default function WidgetRenderer(props: WidgetComponentProps) {
    const widgetDefinitionId = String(
        props.widgetInstance?.composedWidgetId ??
            props.widgetInstance?.widgetDefinitionId ??
            props.widgetDefinition?.id ??
            ''
    );

    const entry = widgetRegistry[widgetDefinitionId];
    if (!entry) {
        return (
            <WidgetCardShell>
                <Typography.Text type="secondary">
                    No registered UI component for widget: {widgetDefinitionId || 'unknown'}
                </Typography.Text>
            </WidgetCardShell>
        );
    }

    const Component = entry.component;
    return <Component {...props} />;
}
