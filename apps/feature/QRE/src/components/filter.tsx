import { useEffect, useState } from 'react';
import './filter.scss';
import { IconButton, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

export const FilterInput = (props: {
    filter: string | undefined;
    onFilterChanged: (value: string) => void;
    placeholder: string;
    label: string;
    disabled?: boolean;
}) => {
    const { filter, onFilterChanged, placeholder, label, disabled } = props;
    const [val, setVal] = useState<string>(filter ?? '');
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVal(e.target.value);
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == 'Escape') {
            setVal('');
        }
    };

    const handleClearClick = () => {
        setVal('');
    };

    useEffect(() => {
        onFilterChanged(val);
    }, [val]);

    return (
        <TextField
            id="filter-input"
            type="text"
            placeholder={placeholder}
            value={val}
            onChange={handleOnChange}
            onKeyDown={handleOnKeyDown}
            data-form-type="other"
            disabled={disabled}
            variant='outlined'
            size='small'
            label={label}
            slotProps={{
                input: {
                    endAdornment: (
                        <IconButton onClick={handleClearClick} disabled={disabled} color="secondary">
                            <ClearIcon fontSize="small"  />
                        </IconButton>
                    ),
                    
                },
                inputLabel: {
                    shrink: true
                }
            }}
        />
    );
};
