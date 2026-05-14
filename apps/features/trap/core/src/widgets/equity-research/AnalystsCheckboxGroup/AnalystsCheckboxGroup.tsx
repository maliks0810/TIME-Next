import { WidgetComponentProps } from '../../../types/widget';
import { useEffect, useMemo, useState } from 'react';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { CheckboxGroupBase } from '../../common/checkbox-group/CheckboxGroup';
import { ANALYSTS_KEY } from '../../constants';
import { useGetActiveTab } from '../../../state/Tabs/hooks';

export const AnalystsCheckboxGroupWidget = ({ widgetInstance, result }: WidgetComponentProps) => {
    const [checked, setChecked] = useState<string[]>([]);
    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();
    const storeChecked = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: ANALYSTS_KEY,
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
            key: ANALYSTS_KEY,
            channelId: widgetInstance?.config?.params?.channel,
            value: values,
            activeTab,
        });
        setChecked(values);
    };

    return <CheckboxGroupBase items={items} onChange={handleChange} withCheckAll />;
};
