import { useRef, useState } from "react";
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import { Select, SelectRef } from "../../../../components/select";
import { ModelCategorization, ModelCategorizationMap, ModelPermissions } from "../../../../types/model-catalog-types";
import './selects.scss';

export const EnumSelect = (props: {
    values: string[];
    defaultSelected?: string;
    onSelected: (value: string) => void;
    disabled?: boolean;
}) => {
    const { values, defaultSelected, onSelected, disabled } = props;
    const selectRef = useRef<SelectRef>(null);
    const [selectedValue, setSelectedValue] = useState<string>(defaultSelected ?? '');
    const handleSelected = (value: string) => {
        selectRef.current?.hideOptions();
        setSelectedValue(value);
        onSelected(value);
    };

    return (
        <Select
            className="model-catalog-selector-editor"
            selectText={selectedValue}
            ref={selectRef}
            disabled={disabled}
        >
            <div className="model-catalog-select-options-container">
                {values.map((v, i) => (
                    <button
                        key={i}
                        aria-selected={v == selectedValue}
                        onClick={() => handleSelected(v)}
                        className="model-catalog-select-option-button"
                    >
                        {v}
                    </button>
                ))}
            </div>
        </Select>
    );
};

export const PermissionsSelect = (props: {
    current: string[];
    onSelected: (selected: string[]) => void;
}) => {
    const { current, onSelected } = props;
    const selectRef = useRef<SelectRef>(null);
    const [selected, setSelected] = useState<string[]>(current);
    const handleSelected = (key: string) => {
        let newSelected: string[];
        if (selected.includes(key)) {
            newSelected = selected.filter((s) => s != key);
        } else {
            newSelected = [...selected, key];
        }

        setSelected(newSelected);
        onSelected(newSelected);
    };

    const selectedText = selected.join(', ') || 'No Permissions';
            
    return (
        <Select className="model-catalog-selector-editor" selectText={selectedText} ref={selectRef}>
            <div className="model-catalog-select-options-container permissions">
                {ModelPermissions.map((k, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelected(k)}
                        className="model-catalog-permissions-option-button"
                    >
                        <div className="model-catalog-permissions-option" key={i}>
                            {selected.includes(k) ? (
                                <CheckBoxOutlinedIcon className="model-catalog-permissions-check-icon" />
                            ) : (
                                <CheckBoxOutlineBlankOutlinedIcon className="model-catalog-permissions-check-icon" />
                            )}
                            {k}
                        </div>
                    </button>
                ))}
            </div>
        </Select>
    );
};

export const CategorizationSelect = (props: {
    map: ModelCategorizationMap;
    defaultSelected?: ModelCategorization;
    onSelected: (value: ModelCategorization) => void;
}) => {
    const { map, defaultSelected, onSelected } = props;
    const selectRef = useRef<SelectRef>(null);
    const [selectedValue, setSelectedValue] = useState<ModelCategorization>(
        defaultSelected ?? { kind: '', purpose: '' }
    );
    const selectText = `${selectedValue.kind}: ${selectedValue.purpose}`;
    const handleSelected = (value: ModelCategorization) => {
        selectRef.current?.hideOptions();
        setSelectedValue(value);
        onSelected(value);
    };

    return (
        <Select
            className="model-catalog-selector-cat-editor"
            selectText={selectText}
            ref={selectRef}
        >
            <div className="model-catalog-select-cat-options-container">
                {Object.keys(map).map((k, i) => (
                    <div className="model-catalog-select-cat-kind" key={i}>
                        <p>{k}</p>
                        {map[k].map((p, pi) => (
                            <button
                                key={pi}
                                aria-selected={
                                    selectedValue.kind == k && selectedValue.purpose == p
                                }
                                onClick={() => handleSelected({ kind: k, purpose: p })}
                                className="model-catalog-select-cat-option-button"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </Select>
    );
};