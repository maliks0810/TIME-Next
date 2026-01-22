import React from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { IEnterIdentifierFormValues } from '../../lib/types';

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
  const handleChange = (event: SelectChangeEvent<string>) => {
    onFormChange({ newIssue: event.target.value });
  };

  return (
    <div className="substep-content">
      <div className="form-row-group">
        <label className="field-label">New Issue</label>
        <FormControl fullWidth>
          <Select
            value={formValues.newIssue || ''}
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
