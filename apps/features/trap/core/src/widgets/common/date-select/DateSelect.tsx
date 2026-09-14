import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { WidgetComponentProps } from '../../../types/widget';
import { DatePicker, DatePickerProps } from 'antd';
import styles from './DateSelect.module.scss';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { useSetWidgetValue, useGetWidgetValue } from '../../../state/Widgets/hooks';
import { DATE_SELECT_KEY } from '../../constants';
import { useCallback, useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { isMonthEnd } from './utils';
type DateType = DatePickerProps['value'];
export const DateSelect = ({ widgetInstance }: WidgetComponentProps) => {
    // Widget config values
    const { config = {} } = widgetInstance;
    const label = config.params?.label;
    const key = config.params?.stateKey || DATE_SELECT_KEY;
    const dateFormat = config.params?.dateFormat || 'YYYY-MM-DD';
    const channelId = config.params?.channel;
    const availableDates = config.params?.availableDates;

    // State communication
    const setWidgetValueToChannel = useSetWidgetValue();
    const dateSelectValue = useGetWidgetValue({
        channelId: channelId,
        key,
    });
    const activeTab = useGetActiveTab();

    const getDefaultDate = () => {
        switch (availableDates) {
            case 'All':
                return dayjs();
            case 'End of Month only':
                return dayjs().subtract(1, 'month').endOf('month');
            //Default - today
            default:
                return dayjs();
        }
    };
    // Widget state
    const [date, setDate] = useState<DateType | null>(getDefaultDate);

    const handleDateChange = useCallback(
        (date: DateType) => {
            setDate(date);
            setWidgetValueToChannel({
                channelId,
                key,
                activeTab,
                value: date?.format(dateFormat) || null,
                widgetId: widgetInstance.id,
            });
        },
        [key, dateFormat]
    );

    useEffect(() => {
        //On mount set today's date to context
        // Possible improvement: add date to definition and set from config
        const dateValue = getDefaultDate();
        setWidgetValueToChannel({
            channelId,
            key,
            activeTab,
            value: dateValue.format(dateFormat),
            widgetId: widgetInstance.id,
        });
    }, []);

    useEffect(() => {
        if (dateSelectValue === undefined) return;
        if (dateSelectValue !== date) {
            if (dateSelectValue === null) setDate(null);
            else setDate(dayjs(dateSelectValue as string));
        }
    }, [dateSelectValue]);

    const isDateDisabled = (date: Dayjs) => {
        switch (availableDates) {
            case 'End of Month only':
                return !isMonthEnd(date.toDate());
            case 'All':
                return false;
            default:
                return false;
        }
    };
    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                {label}{' '}
                <DatePicker
                    value={date}
                    className={styles.select}
                    onChange={handleDateChange}
                    disabledDate={isDateDisabled}
                />
            </div>
        </WidgetCardShell>
    );
};
