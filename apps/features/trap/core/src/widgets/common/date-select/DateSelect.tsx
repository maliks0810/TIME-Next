import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { WidgetComponentProps } from '../../../types/widget';
import { DatePicker, DatePickerProps } from 'antd';
import styles from './DateSelect.module.scss';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { useSetWidgetValue, useGetWidgetValue } from '../../../state/Widgets/hooks';
import { DATE_SELECT_KEY } from '../../constants';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
type DateType = DatePickerProps['value'];
export const DateSelect = ({ widgetInstance }: WidgetComponentProps) => {
    // Widget config values
    const { config = {} } = widgetInstance;
    const label = config.params?.label;
    const key = config.params?.stateKey || DATE_SELECT_KEY;
    const dateFormat = config.params?.dateFormat || 'YYYY-MM-DD';
    const channelId = config.params?.channel;
    // State communication
    const setWidgetValueToChannel = useSetWidgetValue();
    const dateSelectValue = useGetWidgetValue({
        channelId: channelId,
        key,
    });
    const activeTab = useGetActiveTab();

    // Widget state
    const [date, setDate] = useState<DateType | null>(null);

    const handleDateChange = useCallback(
        (date: DateType) => {
            setDate(date);
            setWidgetValueToChannel({
                channelId,
                key,
                activeTab,
                value: date?.format(dateFormat) || null,
            });
        },
        [key, dateFormat]
    );

    useEffect(() => {
        if (dateSelectValue === undefined) return;
        if (dateSelectValue !== date) {
            if (dateSelectValue === null) setDate(null);
            else setDate(dayjs(dateSelectValue as string));
        }
    }, [dateSelectValue]);

    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                {label}{' '}
                <DatePicker value={date} className={styles.select} onChange={handleDateChange} />
            </div>
        </WidgetCardShell>
    );
};
