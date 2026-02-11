import React from 'react';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { IEnterIdentifierFormValues } from '../lib/types/securitySetupTypes';

interface NewIssuePageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly: boolean;
}

export const NewIssuePage: React.FC<NewIssuePageProps> = ({
  formValues,
  onFormChange,
  isReadOnly,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange({ newIssue: event.target.value });
  };

  return (
    <div className="substep-content">
      <div className="form-row-group">
        <label className="field-label">New Issue</label>
        <FormControl fullWidth>
          <RadioGroup
            value={formValues.newIssue || ''}
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
