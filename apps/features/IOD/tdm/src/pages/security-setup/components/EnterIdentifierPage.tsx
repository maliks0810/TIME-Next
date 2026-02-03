import React from 'react';
import { FormControl, MenuItem, Select, SelectChangeEvent, TextField, RadioGroup, FormControlLabel, Radio, Link } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { IEnterIdentifierFormValues } from '../lib/types';

interface EnterIdentifierPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly?: boolean;
}

const identifierTypeOptions = [
  { value: 'FIGI', label: 'FIGI' },
  { value: 'CUSIP', label: 'CUSIP' },
  { value: 'ISIN', label: 'ISIN' },
  { value: 'SEDOL', label: 'SEDOL' },
];

export const EnterIdentifierPage: React.FC<EnterIdentifierPageProps> = ({
  formValues,
  onFormChange,
  isReadOnly = false,
}) => {
  const handleSelectChange = (field: keyof IEnterIdentifierFormValues) => (
    event: SelectChangeEvent<string>
  ) => {
    onFormChange({ [field]: event.target.value });
  };

  const handleTextChange = (field: keyof IEnterIdentifierFormValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFormChange({ [field]: event.target.value });
  };

  return (
    <div className="enter-identifier-page">
      <div className="substep-content">
        {/* Offering Memorandum Upload */}
        <div className="offering-upload-section">
          <h3 className="section-title">Offering Memorandum Upload</h3>
          <div className="single-upload-box">
            <InsertDriveFileIcon className="upload-doc-icon" />
            <div className="upload-text-wrapper">
              <span className="upload-instruction">Click or drag </span>
              <Link href="#" className="upload-link">Offering Memorandum</Link>
              <span className="upload-instruction"> to this area to upload (Optional)</span>
            </div>
            <Link href="#" className="upload-memo-link">Upload Offering Memorandum</Link>
          </div>
        </div>

        {/* Private Deal SSAP ID/Password */}
        <div className="form-row-group">
          <label className="field-label">Private Deal SSAP ID/Password</label>
          <TextField
            fullWidth
            value={formValues.ssapIdPassword || ''}
            onChange={handleTextChange('ssapIdPassword')}
            placeholder="Sample_Code"
            variant="outlined"
            disabled={isReadOnly}
          />
        </div>

        {/* New Issue */}
        <div className="form-row-group">
          <label className="field-label">New Issue *</label>
          <FormControl fullWidth>
            <RadioGroup
              value={formValues.newIssue || ''}
              onChange={(e) => onFormChange({ newIssue: e.target.value })}
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

        {/* Aladdin CDI ID */}
        <div className="form-row-group">
          <label className="field-label">Aladdin CDI ID *</label>
          <TextField
            fullWidth
            value={formValues.aladdinCDIId || ''}
            onChange={handleTextChange('aladdinCDIId')}
            placeholder="BDL123456"
            variant="outlined"
            disabled={isReadOnly}
          />
        </div>

        {/* Bloomberg Identifier */}
        <div className="form-row-group">
          <label className="field-label">Identifier</label>
          <div className="field-inputs-row">
            <FormControl className="field-input-half">
              <Select
                value={formValues.identifierType || 'FIGI'}
                onChange={handleSelectChange('identifierType')}
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
              onChange={handleTextChange('identifierValue')}
              placeholder="BBGZ000BLNNV0"
              variant="outlined"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Market Sector */}
        <div className="form-row-group">
          <label className="field-label">Market Sector</label>
          <div className="field-inputs-row">
            <FormControl className="field-input-half">
              <Select
                value={formValues.marketSector || ''}
                onChange={handleSelectChange('marketSector')}
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
              onChange={handleTextChange('yellowKey')}
              placeholder="MTGE"
              variant="outlined"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* EU Security Verification */}
        <div className="form-row-group">
          <label className="field-label">EU Security Verification Required *</label>
          <FormControl fullWidth>
            <RadioGroup
              value={formValues.euSecurityVerificationRequired || ''}
              onChange={(e) => onFormChange({ euSecurityVerificationRequired: e.target.value })}
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
          <label className="field-label">EU Securitization TIP EU ID *</label>
          <TextField
            fullWidth
            value={formValues.euSecuritizationTipEuId || ''}
            onChange={handleTextChange('euSecuritizationTipEuId')}
            placeholder="Sample_TIP_ID"
            variant="outlined"
            disabled={isReadOnly}
          />
        </div>

        {/* Reminder Box */}
        <div className="reminder-box">
          <div className="reminder-title">Reminder</div>
          <div className="reminder-text">
            Start ERISA Process: Ensure that the ERISA Process has been kicked off if applicable
          </div>
        </div>
      </div>
    </div>
  );
};
