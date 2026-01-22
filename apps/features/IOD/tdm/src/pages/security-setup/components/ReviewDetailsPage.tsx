import React from 'react';
import { FormControl, MenuItem, Select, TextField, Link } from '@mui/material';
import { SecuritySetupFlowType, IReviewDetailsFormValues } from '../lib/types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface ReviewDetailsPageProps {
  formValues: IReviewDetailsFormValues;
  onFormChange: (values: Partial<IReviewDetailsFormValues>) => void;
  flowType?: SecuritySetupFlowType;
}

export const ReviewDetailsPage: React.FC<ReviewDetailsPageProps> = ({
  formValues,
  onFormChange
}) => {
  const handleESGChange = (field: string, value: string) => {
    onFormChange({
      esgFields: {
        ...formValues.esgFields,
        [field]: value,
      },
    });
  };

  const handleTradeFieldsChange = (field: string, value: string) => {
    onFormChange({
      tradeFields: {
        ...formValues.tradeFields,
        [field]: value,
      },
    });
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormChange({
      notesInstructions: event.target.value,
    });
  };

  return (
    <div className="review-details-page">
      {/* Success Messages */}
      <div className="success-messages-box">
        <div className="success-message-item">
          <CheckCircleIcon className="success-check-icon" />
          <span>Security information retrieved from Bloomberg</span>
        </div>
        <div className="success-message-item">
          <CheckCircleIcon className="success-check-icon" />
          <span>Security Exists in Aladdin <strong>(Aladdin CDI ID = 123ABC46)</strong></span>
        </div>
      </div>

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

      {/* Security Details Section */}
      <div className="form-section">
        <h3 className="section-title">Security Details</h3>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Aladdin CDI ID</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.aladdinCDIId || 'BDL123456'}
              disabled
              variant="outlined"
              className="readonly-field"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Identifier</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.identifier || '61779KAA4'}
              disabled
              variant="outlined"
              className="readonly-field"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Description</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.description || 'MSBM 2025-NQM7 A1'}
              disabled
              variant="outlined"
              className="readonly-field"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Tranche</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.tranche || 'A'}
              disabled
              variant="outlined"
              className="readonly-field"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Sector</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.sector || 'Non-QM'}
              disabled
              variant="outlined"
              className="readonly-field"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Callable</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.callable || 'Y'}
              disabled
              variant="outlined"
              className="readonly-field"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Call Date</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.callDate || '9/25/2029'}
              disabled
              variant="outlined"
              className="readonly-field"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Price</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.price || '99.30'}
              disabled
              variant="outlined"
              className="readonly-field"
            />
          </div>
        </div>
      </div>

      {/* ESG Fields Section */}
      <div className="form-section">
        <h3 className="section-title">ESG Fields</h3>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">TCW ESG</label>
            <FormControl fullWidth className="esg-green-border">
              <Select
                value={formValues.esgFields?.tcwESG || ''}
                onChange={(e) => handleESGChange('tcwESG', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">
              ESG Collateral Type <span className="klo-only-text">(KLO Only)</span>
            </label>
            <TextField
              fullWidth
              value={formValues.esgFields?.esgCollateralType || 'x'}
              onChange={(e) => handleESGChange('esgCollateralType', e.target.value)}
              variant="outlined"
              className="esg-collateral-field"
            />
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <label className="field-label">TCW ESG Type</label>
            <FormControl fullWidth>
              <Select
                value={formValues.esgFields?.tcwESGType || ''}
                onChange={(e) => handleESGChange('tcwESGType', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Select...</MenuItem>
                <MenuItem value="type1">Type 1</MenuItem>
                <MenuItem value="type2">Type 2</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      {/* Trader Fields Section */}
      <div className="form-section">
        <h3 className="section-title">Trader Fields</h3>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Slicer Type</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.sliceType || ''}
                onChange={(e) => handleTradeFieldsChange('sliceType', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">MBS</MenuItem>
                <MenuItem value="mbs">MBS</MenuItem>
                <MenuItem value="abs">ABS</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">MBS Type</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.mbsType || ''}
                onChange={(e) => handleTradeFieldsChange('mbsType', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Non-Agency</MenuItem>
                <MenuItem value="non-agency">Non-Agency</MenuItem>
                <MenuItem value="agency">Agency</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Loan Credit</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.loanCredit || ''}
                onChange={(e) => handleTradeFieldsChange('loanCredit', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Non-QM</MenuItem>
                <MenuItem value="non-qm">Non-QM</MenuItem>
                <MenuItem value="qm">QM</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">MBS Collateral</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.mbsCollateral || ''}
                onChange={(e) => handleTradeFieldsChange('mbsCollateral', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Fixed</MenuItem>
                <MenuItem value="fixed">Fixed</MenuItem>
                <MenuItem value="floating">Floating</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">MBS Collateral Sub</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.mbsCollateralSub || ''}
                onChange={(e) => handleTradeFieldsChange('mbsCollateralSub', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Other</MenuItem>
                <MenuItem value="other">Other</MenuItem>
                <MenuItem value="prime">Prime</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">Sr. Most Cash Flow</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.srMostCashFlow || ''}
                onChange={(e) => handleTradeFieldsChange('srMostCashFlow', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Non-Qualifying Mortgage</MenuItem>
                <MenuItem value="non-qualifying">Non-Qualifying Mortgage</MenuItem>
                <MenuItem value="qualifying">Qualifying Mortgage</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Tranche Type</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.trancheType || ''}
                onChange={(e) => handleTradeFieldsChange('trancheType', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">SEQ</MenuItem>
                <MenuItem value="seq">SEQ</MenuItem>
                <MenuItem value="pro-rata">Pro Rata</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">Loan Category</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.loanCategory || ''}
                onChange={(e) => handleTradeFieldsChange('loanCategory', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Non-QM</MenuItem>
                <MenuItem value="non-qm">Non-QM</MenuItem>
                <MenuItem value="qm">QM</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <label className="field-label">Collateral</label>
            <FormControl fullWidth>
              <Select
                value={formValues.tradeFields?.collateral || ''}
                onChange={(e) => handleTradeFieldsChange('collateral', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Non-Agency</MenuItem>
                <MenuItem value="non-agency">Non-Agency</MenuItem>
                <MenuItem value="agency">Agency</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      {/* Notes / Instructions Section */}
      <div className="form-section">
        <h3 className="section-title">Notes / Instructions</h3>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={formValues.notesInstructions || ''}
          onChange={handleNotesChange}
          variant="outlined"
          placeholder=""
        />
      </div>
    </div>
  );
};
