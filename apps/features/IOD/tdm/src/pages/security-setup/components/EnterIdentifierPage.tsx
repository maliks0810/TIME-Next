import React from 'react';
import { FormControl, TextField, RadioGroup, FormControlLabel, Radio, Link } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { IEnterIdentifierFormValues } from '../lib/types/securitySetupTypes';
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';
import { SelectFormField } from '../../../common/components/SelectFormField';

interface EnterIdentifierPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly?: boolean;
  referenceData: INormalizedReferenceData | null;
}

export const EnterIdentifierPage: React.FC<EnterIdentifierPageProps> = ({
  formValues,
  onFormChange,
  isReadOnly = false,
  referenceData
}) => {
  const getDefaultNewIssue = (ssapIdPassword?: string) => {
    return ssapIdPassword?.trim() ? 'yes' : 'no';
  }

  const effectiveNewIssue = getDefaultNewIssue(formValues.ssapIdPassword);

  const isYellowKeyVisable = false;
  const handleTextChange = (field: keyof IEnterIdentifierFormValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFormChange({
      [field]: event.target.value,
      isSsapReleaseRequestSentToDm: !!formValues.ssapIdPassword,
      isPrivateDeal: !!formValues.ssapIdPassword,
    });
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

        <div className="form-row two-column">
          <div>
            <label className="field-label">Intex Deal Name</label>
            <TextField
              value={formValues.intexDealName || ''}
              onChange={handleTextChange('intexDealName')}
              variant="outlined"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="field-label">Intex Password</label>
            <TextField
              value={formValues.intexPassword || ''}
              onChange={handleTextChange('intexPassword')}
              variant="outlined"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Deal Name */}
        <div className="form-row single-column">
          <div>
            <label className="field-label">Deal Name</label>
            <TextField
              value={formValues.dealName || ''}
              onChange={handleTextChange('dealName')}
              variant="outlined"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Private Deal SSAP ID/Password */}
        <div className="form-row-group">
          <label className="field-label">Private Deal SSAP ID/Password</label>
          <TextField
            fullWidth
            value={formValues.ssapIdPassword || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const ssapIdPassword = e.target.value;
              const newIssue = getDefaultNewIssue(ssapIdPassword);

              onFormChange({
                ssapIdPassword,
                newIssue,
                ...(newIssue === 'no' ? { aladdinCDIId: undefined } : {})
              })
            }}
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
              value={effectiveNewIssue}
              onChange={(e) => {
                const newIssue = e.target.value;
                onFormChange({
                  newIssue,
                  ...(newIssue === 'no' ? { aladdinCDIId: undefined } : {})
                })
              }}
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
            disabled={isReadOnly || effectiveNewIssue.toLowerCase() === 'no'}
          />
        </div>

        {/* Bloomberg Identifier */}
        <div className="form-row-group">
          <label className="field-label">Identifier</label>
          <div className="field-inputs-row">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Identifier}
              value={formValues.identifierType}
              onChange={(value) => onFormChange({ identifierType: value })}
              referenceData={referenceData}
              disabled={isReadOnly}
              fullWidth={false}
              className='field-input-half'
            />
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
          <label className="field-label">Market Sector/Yellow Key</label>
          <div className="field-inputs-row">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MarketSector}
              value={formValues.marketSector}
              onChange={(value) => onFormChange({ marketSector: value })}
              referenceData={referenceData}
              disabled={isReadOnly}
              fullWidth={false}
              className='field-input-half'
            />
            {isYellowKeyVisable && (
              <TextField
                className="field-input-half"
                label="Yellow Key"
                value={formValues.yellowKey || ''}
                onChange={handleTextChange('yellowKey')}
                placeholder="MTGE"
                variant="outlined"
                disabled={isReadOnly}
              />
            )}
          </div>
        </div>

        {/* EU Security Verification */}
        <div className="form-row-group">
          <label className="field-label">EU Security Verification Required *</label>
          <FormControl fullWidth>
            <RadioGroup
              value={String(formValues.isEuSecuritizationRequired) || ''}
              onChange={(e) => {
                const value = e.target.value === "true" ? true : false;
                onFormChange({
                  isEuSecuritizationRequired: value,
                  ...(value === false ? { euSecuritizationTipEuId: undefined } : {})
                })
              }}
              row
            >
              <FormControlLabel
                value="true"
                control={<Radio disabled={isReadOnly} />}
                label="Yes"
              />
              <FormControlLabel
                value="false"
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
            disabled={isReadOnly || formValues.isEuSecuritizationRequired === false}
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
