import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { Checkbox as AntCheckbox, CheckboxChangeEvent } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { returnConfigOrDefaultByKey } from '../../../utils/returnWidgetValue';
import { useSetWidgetValue, useGetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';

type CheckboxContent = {
    label: string;
    defaultChecked: boolean;
    key: string;
};
export const CheckboxWidget = ({ widgetInstance, widgetDefinition }: WidgetComponentProps) => {
    const { config } = widgetInstance;

    const activeTab = useGetActiveTab();

    const content = useMemo(() => {
        const fields: Array<keyof CheckboxContent> = ['label', 'key', 'defaultChecked'];

        return fields.reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: returnConfigOrDefaultByKey(config, widgetDefinition, cur, acc[cur]),
            }),
            {
                defaultChecked: false,
                label: '',
                key: '',
            }
        );
    }, [widgetDefinition, config]);

    const [checked, setChecked] = useState(content.defaultChecked);

    const setWidgetValueToChannel = useSetWidgetValue();
    const storeChecked = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: content.key,
    });

    useEffect(() => {
        if (storeChecked) {
            setChecked(storeChecked as boolean);
        }
    }, [storeChecked]);

    const handleChange = (value: CheckboxChangeEvent) => {
        setWidgetValueToChannel({
            key: content.key,
            channelId: widgetInstance?.config?.params?.channel,
            value: value.target.checked,
            activeTab,
        });
        setChecked(value.target.checked);
    };

    return (
        <WidgetCardShell>
            <AntCheckbox checked={checked} value={content.key} onChange={handleChange}>
                {content.label}
            </AntCheckbox>
        </WidgetCardShell>
    );
};
