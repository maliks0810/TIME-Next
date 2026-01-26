import React from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { IEnterIdentifierFormValues } from '../lib/types';

interface UploadCDIPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly: boolean;
}

export const UploadCDIPage: React.FC<UploadCDIPageProps> = ({
  formValues,
  onFormChange,
  isReadOnly,
}) => {
  const handleCDIFileChange = (event: SelectChangeEvent<string>) => {
    onFormChange({ cdiFileUploadedToAnser: event.target.value });
  };

  const handleAladdinIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange({ aladdinCDIId: event.target.value });
  };

  return (
    <div className="substep-content">
      <div className="form-row-group">
        <label className="field-label">CDI File Uploaded to Anser</label>
        <FormControl fullWidth>
          <Select
            value={formValues.cdiFileUploadedToAnser || ''}
            onChange={handleCDIFileChange}
            displayEmpty
            disabled={isReadOnly}
          >
            <MenuItem value="">Select...</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="form-row-group">
        <label className="field-label">Aladdin CDI ID</label>
        <TextField
          fullWidth
          value={formValues.aladdinCDIId || ''}
          onChange={handleAladdinIDChange}
          placeholder="BDL123456"
          variant="outlined"
          disabled={isReadOnly}
        />
      </div>
    </div>
  );
};
