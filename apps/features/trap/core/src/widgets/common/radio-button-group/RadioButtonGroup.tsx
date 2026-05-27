import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { Radio, RadioChangeEvent } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from './RadioButtonGroup.module.scss';
import { RadioGroupOptionType } from 'antd/es/radio';
import clsx from 'clsx';
type RadioItem = {
    label: string;
    value: string;
};
type RadioButtonGroupBaseProps = {
    items: RadioItem[];
    onChange: (checked: string) => void;
    optionType?: RadioGroupOptionType;
    className?: string;
    error?: string | null;
    defaultSelected?: string;
};

export const RadioButtonGroupBase = ({
    items,
    optionType = 'button',
    className,
    onChange,
    error,
    defaultSelected,
}: RadioButtonGroupBaseProps) => {
    const [checked, setChecked] = useState<string>(defaultSelected || '');

    const handleChange = (e: RadioChangeEvent) => {
        setChecked(e.target.value);
        onChange(e.target.value);
    };

    const options = useMemo(
        () =>
            items.map((el) => ({
                label: el.label,
                value: el.value,
            })),
        [items]
    );

    useEffect(() => {
        // Reset selected on error
        setChecked(defaultSelected || '');
    }, [error]);

    if (error) {
        return (
            <WidgetCardShell>
                <div className={styles.error}>{error}</div>
            </WidgetCardShell>
        );
    }
    return (
        <WidgetCardShell>
            <Radio.Group
                optionType={optionType}
                onChange={handleChange}
                className={clsx(styles.wrapper, className)}
                options={options}
                value={checked}
            ></Radio.Group>
        </WidgetCardShell>
    );
};
