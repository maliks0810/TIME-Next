import React from 'react';
import { TextField } from '@mui/material';
import { IEnterIdentifierFormValues } from '../lib/types';

interface SSAPPasswordPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly: boolean;
}

export const SSAPPasswordPage: React.FC<SSAPPasswordPageProps> = ({
  formValues,
  onFormChange,
  isReadOnly,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange({ ssapIdPassword: event.target.value });
  };

  return (
    <div className="substep-content">
      <div className="form-row-group">
        <label className="field-label">SSAP ID/Password *</label>
        <TextField
          fullWidth
          value={formValues.ssapIdPassword || ''}
          onChange={handleChange}
          placeholder="Sample_Code"
          variant="outlined"
          disabled={isReadOnly}
        />
      </div>
    </div>
  );
};
