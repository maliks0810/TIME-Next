import React from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent, Skeleton } from '@mui/material';
import { getFieldOptions } from '../../pages/security-setup/utils/referenceDataHelpers';
import { INormalizedReferenceData } from '../../pages/security-setup/lib/types/referenceDataTypes';

interface SelectFormFieldProps {
  fieldKey: string;
  value: string | undefined;
  onChange?: (value: string) => void;
  referenceData: INormalizedReferenceData | null;
  label?: React.ReactNode;
  displayEmpty?: boolean;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  showDescriptions?: boolean;
}

export const SelectFormField: React.FC<SelectFormFieldProps> = ({
  fieldKey,
  value,
  onChange,
  referenceData,
  label,
  displayEmpty = true,
  placeholder = 'Select...',
  disabled = false,
  fullWidth = true,
  className,
  showDescriptions = true,
}) => {
  const options = getFieldOptions(referenceData, fieldKey);
  const isLoading = !referenceData || options.length === 0;

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  if (isLoading) {
    return <Skeleton variant="rectangular" height={56} />;
  }

  return (
    <FormControl fullWidth={fullWidth} className={className}>
      {label && <label className="field-label">{label}</label>}
      <Select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        displayEmpty={displayEmpty}
      >
        {displayEmpty && (
          <MenuItem value="">
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            title={showDescriptions ? option.description : undefined}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
