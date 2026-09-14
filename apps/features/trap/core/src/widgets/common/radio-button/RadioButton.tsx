import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

import { CheckboxChangeEvent, Radio } from 'antd';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { useSetWidgetValue, useGetWidgetValue } from '../../../state/Widgets/hooks';
import { returnConfigOrDefaultByKey } from '../../../utils/returnWidgetValue';
import styles from './RadioButton.module.scss';
import { useMemo, useState, useEffect } from 'react';
type RadioContent = {
    label: string;
    emitsKey: string;
    defaultChecked: boolean;
};
export const RadioButton = ({ widgetInstance, widgetDefinition }: WidgetComponentProps) => {
    const { config } = widgetInstance;

    const activeTab = useGetActiveTab();

    const content = useMemo(() => {
        const fields: Array<keyof RadioContent> = ['label', 'emitsKey', 'defaultChecked'];

        return fields.reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: returnConfigOrDefaultByKey(config, widgetDefinition, cur, acc[cur]),
            }),
            {
                defaultChecked: false,
                label: '',
                emitsKey: '',
            }
        );
    }, [widgetDefinition, config]);

    const [checked, setChecked] = useState(content.defaultChecked);

    const setWidgetValueToChannel = useSetWidgetValue();
    const storeChecked = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: content.emitsKey,
    });

    useEffect(() => {
        if (storeChecked) {
            setChecked(storeChecked as boolean);
        }
    }, [storeChecked]);

    const handleChange = (value: CheckboxChangeEvent) => {
        setWidgetValueToChannel({
            key: content.emitsKey,
            channelId: widgetInstance?.config?.params?.channel,
            value: value.target.checked,
            activeTab,
            widgetId: widgetInstance.id,
        });
        setChecked(value.target.checked);
    };
    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                <Radio onChange={handleChange} checked={checked}>
                    {content.label}
                </Radio>
            </div>
        </WidgetCardShell>
    );
};
