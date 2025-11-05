import { useState } from 'react';
import {
    Button,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
} from '@mui/material';
import { ModelCategorization, ModelCategorizationMap } from '../../../types/model-catalog-types';
import './selects.scss';

export const EnumSelect = (props: {
    values: string[];
    defaultSelected?: string;
    onSelected: (value: string) => void;
    disabled?: boolean;
}) => {
    const { values, defaultSelected, onSelected, disabled } = props;
    const [selectedValue, setSelectedValue] = useState<string>(defaultSelected ?? '');
    const handleChange = (event: SelectChangeEvent) => {
        setSelectedValue(event.target.value);
        onSelected(event.target.value);
    };

    return (
        <FormControl disabled={disabled}>
            <Select onChange={handleChange} value={selectedValue}>
                {values.map((v, i) => (
                    <MenuItem value={v} key={i}>
                        {v}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export const CategorizationSelect = (props: {
    map: ModelCategorizationMap;
    defaultSelected?: ModelCategorization;
    onSelected: (value: ModelCategorization) => void;
}) => {
    const { map, defaultSelected, onSelected } = props;
    const [selectedValue, setSelectedValue] = useState<ModelCategorization>(
        defaultSelected ?? { kind: '', purpose: '' }
    );
    const [isOpen, setIsOpen] = useState(false);
    const selectText = `${selectedValue.kind}: ${selectedValue.purpose}`;
    const handleSelected = (value: ModelCategorization) => {
        setSelectedValue(value);
        onSelected(value);
        setIsOpen(false);
    };

    return (
        <FormControl>
            <Select
                value={selectText}
                renderValue={() => <Typography>{selectText}</Typography>}
                open={isOpen}
                onClose={() => setIsOpen(false)}
                onOpen={() => setIsOpen(true)}
            >
                {Object.keys(map).map((k, i) => (
                    <div key={i} className='model-catalog-select-options-container'>
                        <Typography>{k}</Typography>
                        {map[k].map((p, pi) => (
                            <Button
                                key={pi}
                                aria-selected={
                                    selectedValue.kind == k && selectedValue.purpose == p
                                }
                                onClick={() => handleSelected({ kind: k, purpose: p })}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                ))}
            </Select>
        </FormControl>

    );
};
