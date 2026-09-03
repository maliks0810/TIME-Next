import { useEffect, useMemo, useState } from 'react';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { Radio, RadioChangeEvent } from 'antd';
import { WidgetComponentProps } from '../../../types/widget';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import styles from './PeriodRadioGroup.module.scss';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { PERIOD_RADIO_STORE_KEY } from '../../constants';
const OPTIONS = ['MTD', 'QTD', 'YTD', '1Y', '3Y', '5Y', 'MAX'];

export const PeriodRadioGroup = ({ widgetInstance }: WidgetComponentProps) => {
    const [selectedValue, setSelectedValue] = useState<string>();

    const activeTab = useGetActiveTab();
    const wrapperStyle = useMemo(() => {
        const layout = widgetInstance.config?.params?.layout;
        switch (layout) {
            case 'vertical':
                return styles.vertical;
            case 'horizontal':
            default:
                return styles.horizontal;
        }
    }, [widgetInstance.config]);

    const setWidgetValueToChannel = useSetWidgetValue();
    const radioGroupStoreValue = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: PERIOD_RADIO_STORE_KEY,
    });

    useEffect(() => {
        if (radioGroupStoreValue) {
            setSelectedValue(radioGroupStoreValue as string);
        }
    }, [radioGroupStoreValue]);

    const handleChange = (value: RadioChangeEvent) => {
        setWidgetValueToChannel({
            key: PERIOD_RADIO_STORE_KEY,
            channelId: widgetInstance?.config?.params?.channel,
            value: value.target.value,
            activeTab,
            widgetId: widgetInstance.id,
        });
        setSelectedValue(value.target.value);
    };

    return (
        <WidgetCardShell>
            <Radio.Group
                size="middle"
                onChange={handleChange}
                value={selectedValue}
                className={wrapperStyle}
            >
                {OPTIONS.map((el) => (
                    <Radio.Button value={el} key={el}>
                        {el}
                    </Radio.Button>
                ))}
            </Radio.Group>
        </WidgetCardShell>
    );
};
