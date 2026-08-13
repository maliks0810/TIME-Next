import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { WidgetComponentProps } from '../../../types/widget';
import { SimpleGrid } from './variants/simple-table/SimpleGrid';
import DataGridWidget from './DataGridWidget';

export const GridRegistry = ({ widgetInstance, ...props }: WidgetComponentProps) => {
    const { config } = widgetInstance;
    const schemaKey = config?.params?.schemaKey;

    if (!schemaKey) {
        return <WidgetCardShell>Data grid must have a configure schema key</WidgetCardShell>;
    }

    switch (schemaKey) {
        case 'prism.comparables.equity':
        case 'prism.comparables.debt':
        case 'prism.issuer.profile':
        case 'prism.issuer.fundamentals':
        case 'prism.issuer.capital_structure':
            return <SimpleGrid {...props} widgetInstance={widgetInstance} />;
        default:
            return <DataGridWidget {...props} widgetInstance={widgetInstance} />;
    }
};
