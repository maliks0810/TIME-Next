// components/DepartmentSelect.tsx

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { useDepartments } from "../hooks/useDepartment";

interface DepartmentOption {
    label: string;
    value: string;
}

interface DepartmentSelectProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
}

export const DepartmentSelect = ({
    value,
    onChange,
    label = "Department",
}: DepartmentSelectProps) => {
    const { data = [], isLoading } = useDepartments();

    return (
        <Autocomplete
            options={data}
            value={
                data.find((item: DepartmentOption) => item.value === value) ?? null
            }
            onChange={(_, option) =>
                onChange(option?.value ?? "")
            }
            loading={isLoading}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) =>
                option.value === value.value
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    size="small"
                    fullWidth
                />
            )}
        />
    );
};