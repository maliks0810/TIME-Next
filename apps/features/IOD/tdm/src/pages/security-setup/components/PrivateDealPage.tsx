import React from 'react';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { IEnterIdentifierFormValues } from '../lib/types';

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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange({ privateDeal: event.target.value });
  };

  return (
    <div className="substep-content">
      <div className="form-row-group">
        <label className="field-label">Private Deal</label>
        <FormControl fullWidth>
          <RadioGroup
            value={formValues.privateDeal || ''}
            onChange={handleChange}
            row
          >
            <FormControlLabel
              value="yes"
              control={<Radio disabled={isReadOnly} />}
              label="Yes"
            />
            <FormControlLabel
              value="no"
              control={<Radio disabled={isReadOnly} />}
              label="No"
            />
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  );
};
