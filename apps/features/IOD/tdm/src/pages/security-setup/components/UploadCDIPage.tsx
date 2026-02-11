import React from 'react';
import { FormControl, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material';
import { IEnterIdentifierFormValues } from '../lib/types/securitySetupTypes';

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
  const handleCDIFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          <RadioGroup
            value={formValues.cdiFileUploadedToAnser || ''}
            onChange={handleCDIFileChange}
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
