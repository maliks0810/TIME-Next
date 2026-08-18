import { WidgetComponentProps } from '../../../types/widget';
import { useEffect, useMemo, useState } from 'react';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { CheckboxGroupBase } from '../checkbox-group/CheckboxGroup';
import { schemaToStateKeyMap } from '../../constants';
import { useGetActiveTab } from '../../../state/Tabs/hooks';

export const MultiSelectWidget = ({ widgetInstance, result }: WidgetComponentProps) => {
    const schemaKey = widgetInstance?.config?.params?.schemaKey as string;

    const [checked, setChecked] = useState<string[]>([]);
    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();
    const storeChecked = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: schemaToStateKeyMap[schemaKey],
    });

    useEffect(() => {
        if (storeChecked) {
            setChecked(storeChecked as string[]);
        }
    }, [storeChecked]);

    const items = useMemo(() => {
        if (!result) return [];
        if (!result.items) return [];

        return (result.items as { key: string; label: string }[]).map((el) => ({
            label: el.label,
            key: el.key,
            defaultChecked: checked.includes(el.key),
        }));
    }, [result, checked]);

    const handleChange = (values: string[]) => {
        setWidgetValueToChannel({
            key: schemaToStateKeyMap[schemaKey],
            channelId: widgetInstance?.config?.params?.channel,
            value: values,
            activeTab,
        });
        setChecked(values);
    };

    return <CheckboxGroupBase items={items} onChange={handleChange} withCheckAll />;
};
