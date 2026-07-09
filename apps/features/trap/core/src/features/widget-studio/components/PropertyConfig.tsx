import { useCallback, useMemo } from 'react';
import { Typography, Select, Checkbox, Input, ColorPicker, InputNumber } from 'antd';
import styles from './PropertyConfig.module.scss';
import { DefaultOptionType } from 'antd/es/select';
import TextEditor from '../../../components/tiptap/TextEditor';
import { WidgetValueType } from '../../../state/Widgets/types';
type PropertyValue = string | number | boolean;
type Option = { label: string; options?: Option[] };
export type WidgetConfigProperty = {
    default: PropertyValue;
    withColorPicker?: boolean;
    title: string;
    enum?: string[] | number[];
    editor?: boolean;
    context?: Record<string, WidgetValueType>;
    multiselect?: boolean;
    type: 'string' | 'boolean' | 'number';
    category?: 'string';
    options?: Option[];
};
export const PropertyConfig = ({
    property,
    setField,
    propertyKey,
    required,
    currentValue,
    context,
    options,
}: {
    currentValue: PropertyValue;
    required: boolean;
    propertyKey: string;
    property: WidgetConfigProperty;
    context?: Record<string, WidgetValueType>;
    options?: DefaultOptionType[];
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
    const renderMultiselect = useCallback((selectOptions: DefaultOptionType[]) => {
        return (
            <>
                <Typography.Text strong>
                    {property.title}
                    {required && '*'}
                </Typography.Text>
                <Select
                    mode="multiple"
                    allowClear
                    className={styles.select}
                    options={selectOptions}
                    defaultValue={currentValue || property.default}
                    onChange={(e) => setField(propertyKey, e)}
                />
            </>
        );
    }, []);
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
    const renderEditor = useCallback(
        () => (
            <>
                <Typography.Text strong>
                    {property.title}
                    {required && '*'}
                </Typography.Text>
                <TextEditor
                    mentionEnabled
                    mentionOptions={Object.keys(context || {})}
                    initial={(currentValue as string) || property.default?.toString()}
                    onChange={(e) => setField(propertyKey, e)}
                    minHeight={200}
                />
            </>
        ),
        [context]
    );
    const renderNumberInput = useCallback(
        () => (
            <>
                <Typography.Text strong>
                    {property.title}
                    {required && '*'}
                </Typography.Text>
                <InputNumber
                    className={styles.select}
                    defaultValue={(currentValue as number) || Number(property.default.toString())}
                    onChange={(e: number | null) => setField(propertyKey, e as number)}
                />
            </>
        ),
        []
    );
    const renderDropdown = useCallback(
        () => (
            <>
                <Typography.Text strong>
                    {property.title}
                    {required && '*'}
                </Typography.Text>
                <Select
                    className={styles.select}
                    options={options}
                    defaultValue={currentValue || property.default}
                    onChange={(e) => setField(propertyKey, e)}
                />
            </>
        ),
        [options]
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
    const field = useMemo(() => {
        switch (property.type) {
            case 'string': {
                if (property.editor) return renderEditor();

                if (property.withColorPicker) return renderColorPicker();
                if (!property.enum) return renderInput();

                if (property.options) {
                    return renderDropdown();
                }
                const selectOptions = property.enum.map((el) => ({ label: el, value: el }));
                if (property.multiselect) return renderMultiselect(selectOptions);
                return renderSelect(selectOptions);
            }

            case 'number':
                return <>{renderNumberInput()}</>;
            case 'boolean':
                const defaultChecked =
                    currentValue !== undefined ? (currentValue as boolean) : !!property.default;
                return (
                    <Checkbox
                        defaultChecked={defaultChecked}
                        onChange={(e) => setField(propertyKey, e.target.checked)}
                    >
                        {required && '*'}
                        {property.title}
                    </Checkbox>
                );
            default:
                return null;
        }
    }, [currentValue, setField, property, options]);
    return <div className={styles.container}>{field}</div>;
};
