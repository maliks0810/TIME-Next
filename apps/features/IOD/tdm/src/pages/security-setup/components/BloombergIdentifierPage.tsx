import React from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { IEnterIdentifierFormValues } from '../lib/types/securitySetupTypes';

interface BloombergIdentifierPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly: boolean;
}

const identifierTypeOptions = [
  { value: 'FIGI', label: 'FIGI' },
  { value: 'CUSIP', label: 'CUSIP' },
  { value: 'ISIN', label: 'ISIN' },
  { value: 'SEDOL', label: 'SEDOL' },
];

export const BloombergIdentifierPage: React.FC<BloombergIdentifierPageProps> = ({
  formValues,
  onFormChange,
  isReadOnly,
}) => {
  const handleChange = (field: keyof IEnterIdentifierFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    onFormChange({ [field]: event.target.value });
  };

  return (
    <div className="substep-content">
      {/* Identifier Row */}
      <div className="form-row-group">
        <label className="field-label">Identifier</label>
        <div className="field-inputs-row">
          <FormControl className="field-input-half">
            <Select
              value={formValues.identifierType || 'FIGI'}
              onChange={handleChange('identifierType')}
              displayEmpty
              disabled={isReadOnly}
            >
              {identifierTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            className="field-input-half"
            value={formValues.identifierValue || ''}
            onChange={handleChange('identifierValue')}
            placeholder="BBGZ000BLNNV0"
            variant="outlined"
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Market Sector Row */}
      <div className="form-row-group">
        <label className="field-label">Market Sector</label>
        <div className="field-inputs-row">
          <FormControl className="field-input-half">
            <Select
              value={formValues.marketSector || ''}
              onChange={handleChange('marketSector')}
              displayEmpty
              disabled={isReadOnly}
            >
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="mortgage">Mortgage</MenuItem>
              <MenuItem value="corporate">Corporate</MenuItem>
            </Select>
          </FormControl>
          <TextField
            className="field-input-half"
            label="Yellow Key"
            value={formValues.yellowKey || ''}
            onChange={handleChange('yellowKey')}
            placeholder="MTGE"
            variant="outlined"
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* EU Security Verification Row */}
      <div className="form-row-group">
        <label className="field-label">EU Security Verification Required</label>
        <div className="field-inputs-row">
          <FormControl className="field-input-half">
            <Select
              value={formValues.euSecurityVerificationRequired || ''}
              onChange={handleChange('euSecurityVerificationRequired')}
              displayEmpty
              disabled={isReadOnly}
            >
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </Select>
          </FormControl>
          <TextField
            className="field-input-half"
            label="EU Securitization TIP EU ID"
            value={formValues.euSecuritizationTipEuId || ''}
            onChange={handleChange('euSecuritizationTipEuId')}
            placeholder="x"
            variant="outlined"
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Reminder Box */}
      <div className="reminder-box">
        <div className="reminder-title">Reminder</div>
        <div className="reminder-text">
          Start ERISA Process: Ensure that the ERISA Process has been kicked off if applicable
        </div>
      </div>
    </div>
  );
};
