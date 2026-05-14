import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { Checkbox, CheckboxChangeEvent } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from './CheckboxGroup.module.scss';
type CheckboxItem = {
    label: string;
    defaultChecked: boolean;
    key: string;
};
type CheckboxGroupBaseProps = {
    items: CheckboxItem[];
    onChange: (checked: string[]) => void;
    withCheckAll?: boolean;
    layout?: 'horizontal' | 'vertical';
};
export const CheckboxGroupBase = (props: CheckboxGroupBaseProps) => {
    const [checked, setChecked] = useState<string[]>(
        props.items.filter((el) => el.defaultChecked).map((el) => el.key)
    );
    const checkAll = props.items.length === checked.length;
    const indeterminate = checked.length > 0 && checked.length < props.items.length;
    const handleChange = (checked: string[]) => {
        setChecked(checked);
        props.onChange(checked);
    };

    const onCheckAllChange = (e: CheckboxChangeEvent) => {
        const newChecked = e.target.checked ? props.items.map((el) => el.key) : [];
        setChecked(newChecked);

        props.onChange(newChecked);
    };

    // Monitor checked from other widgets
    useEffect(() => {
        const checked = props.items.filter((el) => el.defaultChecked).map((el) => el.key);

        setChecked(checked);
    }, [props.items]);

    const items = useMemo(
        () =>
            props.items.map((el) => ({
                label: el.label,
                value: el.key,
            })),
        [props.items]
    );
    return (
        <WidgetCardShell>
            {props.withCheckAll && (
                <Checkbox
                    indeterminate={indeterminate}
                    onChange={onCheckAllChange}
                    checked={checkAll}
                    className={styles.all}
                >
                    Check all
                </Checkbox>
            )}
            <Checkbox.Group
                onChange={handleChange}
                className={`${styles.wrapper} ${styles[props.layout || 'vertical']}`}
                options={items}
                value={checked}
            ></Checkbox.Group>
        </WidgetCardShell>
    );
};
