import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

export const TextWidget = ({ widgetInstance, widgetDefinition }: WidgetComponentProps) => {
    const { config } = widgetInstance;
    const properties = widgetDefinition?.configSchema?.properties || {};
    const content = config?.params?.['content'];
    const fontWeight = config?.params?.['fontWeight'] || properties?.['fontWeight']?.default;
    const textAlign = config?.params?.['textAlign'] || properties?.['textAlign']?.default;

    return (
        <WidgetCardShell>
            <div style={{ fontWeight: fontWeight, textAlign }}>{content}</div>
        </WidgetCardShell>
    );
};
