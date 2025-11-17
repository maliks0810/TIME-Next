import { ChangeEvent, useState } from 'react';
import { CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { ModelCategorization, ModelCategorizationMap } from '../../../types/model-catalog-types';
import './selects.scss';

export const EnumSelect = (props: {
    values: string[];
    defaultSelected?: string;
    onSelected: (value: string) => void;
    label?: string;
    disabled?: boolean;
    fillWidth?: boolean;
}) => {
    const { values, defaultSelected, onSelected, label, disabled, fillWidth } = props;
    const [selectedValue, setSelectedValue] = useState<string>(defaultSelected ?? '');
    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSelectedValue(event.target.value);
        onSelected(event.target.value);
    };

    return (
        <TextField
            fullWidth={fillWidth}
            select
            label={label}
            value={selectedValue}
            disabled={disabled}
            onChange={handleChange}
            size="small"
            color="primary"
        >
            {values.map((v, i) => (
                <MenuItem value={v} key={i}>
                    {v}
                </MenuItem>
            ))}
        </TextField>
    );
};

export const CategorizationSelect = (props: {
    map: ModelCategorizationMap;
    label?: string;
    defaultSelected?: ModelCategorization;
    onSelected: (value: ModelCategorization) => void;
}) => {
    const { map, label, defaultSelected, onSelected } = props;
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
        <TextField
            select
            fullWidth
            value={selectedValue}
            slotProps={{
                select: {
                    open: isOpen,
                    onClose: () => setIsOpen(false),
                    onOpen: () => setIsOpen(true),
                    renderValue: () => <Typography noWrap>{selectText}</Typography>,
                },
            }}
            size="small"
            label={label}
        >
            <CardContent>
                {Object.keys(map).map((k, i) => (
                    <Stack key={i} direction="column">
                        <Typography color="primary" variant="button">
                            {k}
                        </Typography>
                        {map[k].map((p, pi) => (
                            <MenuItem
                                key={pi}
                                selected={k == selectedValue.kind && p == selectedValue.purpose}
                                onClick={() => handleSelected({ kind: k, purpose: p })}
                                color="primary"
                            >
                                {p}
                            </MenuItem>

                            // <FormControlLabel
                            //     control={
                            //         <Checkbox
                            //             onChange={() => handleSelected({ kind: k, purpose: p })}
                            //             color="primary"
                            //             size="medium"
                            //         />
                            //     }
                            //     label={<Typography color="primary">{p}</Typography>}
                            //     labelPlacement="end"
                            //     title="Show only the models that I own"
                            //     checked={k == selectedValue.kind && p == selectedValue.purpose}

                            // />
                        ))}
                    </Stack>
                ))}
            </CardContent>
        </TextField>
    );
};
