import React from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { IEnterIdentifierFormValues } from '../../lib/types';

interface PrivateDealPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly: boolean;
}

export const PrivateDealPage: React.FC<PrivateDealPageProps> = ({
  formValues,
  onFormChange,
  isReadOnly,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onFormChange({ privateDeal: event.target.value });
  };

  return (
    <div className="substep-content">
      <div className="form-row-group">
        <label className="field-label">Private Deal</label>
        <FormControl fullWidth>
          <Select
            value={formValues.privateDeal || ''}
            onChange={handleChange}
            displayEmpty
            disabled={isReadOnly}
          >
            <MenuItem value="">Select...</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>
      </div>
    </div>
  );
};
