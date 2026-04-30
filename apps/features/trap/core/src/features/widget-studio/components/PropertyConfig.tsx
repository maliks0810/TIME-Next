import { useCallback, useMemo } from 'react';
import { Typography, Select, Checkbox, Input, ColorPicker } from 'antd';
import styles from './PropertyConfig.module.scss';
import { DefaultOptionType } from 'antd/es/select';
type PropertyValue = string | number | boolean;
export type WidgetConfigProperty = {
    default: PropertyValue;
    withColorPicker?: boolean;
    title: string;
    enum?: string[] | number[];
    type: 'string' | 'boolean' | 'number';
};
export const PropertyConfig = ({
    property,
    setField,
    propertyKey,
    required,
    currentValue,
}: {
    currentValue: PropertyValue;
    required: boolean;
    propertyKey: string;
    property: WidgetConfigProperty;
    setField: (key: string, value: PropertyValue) => void;
}) => {
    const renderColorPicker = useCallback(
        () => (
            <div className={styles.color}>
                <Typography.Text strong>
                    {property.title}
                    {required && '*'}
                </Typography.Text>
                <ColorPicker
                    showText={(color) => <span>{color.toHexString()}</span>}
                    defaultValue={(currentValue as string) || (property.default as string)}
                    onChangeComplete={(e) => setField(propertyKey, `#${e.toHex()}`)}
                />
            </div>
        ),
        []
    );
    const renderSelect = useCallback(
        (selectOptions: DefaultOptionType[]) => (
            <>
                <Typography.Text strong>
                    {property.title}
                    {required && '*'}
                </Typography.Text>
                <Select
                    className={styles.select}
                    options={selectOptions}
                    defaultValue={currentValue || property.default}
                    onChange={(e) => setField(propertyKey, e)}
                />
            </>
        ),
        []
    );

    const renderInput = useCallback(
        () => (
            <>
                <Typography.Text strong>
                    {property.title}
                    {required && '*'}
                </Typography.Text>
                <Input
                    className={styles.select}
                    defaultValue={(currentValue as string) || property.default.toString()}
                    onChange={(e) => setField(propertyKey, e.target.value)}
                />
            </>
        ),
        []
    );
    const options = useMemo(() => {
        switch (property.type) {
            case 'string': {
                if (property.withColorPicker) return renderColorPicker();
                if (!property.enum) return renderInput();

                const selectOptions = property.enum.map((el) => ({ label: el, value: el }));
                return renderSelect(selectOptions);
            }

            case 'number':
                return (
                    <>
                        <Typography.Text strong>
                            {property.title}
                            {required && '*'}
                        </Typography.Text>
                        <Input
                            type="number"
                            className={styles.select}
                            defaultValue={(currentValue as number) || property.default.toString()}
                            onChange={(e) => setField(propertyKey, e.target.value)}
                        />
                    </>
                );
            case 'boolean':
                return (
                    <Checkbox
                        defaultChecked={(currentValue as boolean) || !!property.default}
                        onChange={(e) => setField(propertyKey, e.target.checked)}
                    >
                        {required && '*'}
                        {property.title}
                    </Checkbox>
                );
            default:
                return null;
        }
    }, [currentValue, setField, property]);
    return <div className={styles.container}>{options}</div>;
};
