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

  const handleSecurityDetailsChange = (field: string, value: string) => {
    onFormChange({
      securityDetails: {
        ...formValues.securityDetails,
        [field]: value,
      },
    });
  }

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
          <span>
            Security Exists in Aladdin {formValues.securityDetails?.aladdinCDIId
              && <strong>
                (Aladdin CDI ID = {formValues.securityDetails.aladdinCDIId})
              </strong>}
          </span>
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
              value={formValues.securityDetails?.aladdinCDIId || ''}
              onChange={(e) => handleSecurityDetailsChange('aladdinCDIId', e.target.value)}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Identifier</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.identifier || ''}
              onChange={(e) => handleSecurityDetailsChange('identifier', e.target.value)}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Description</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.description || ''}
              onChange={(e) => handleSecurityDetailsChange('description', e.target.value)}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Tranche</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.tranche || ''}
              onChange={(e) => handleSecurityDetailsChange('tranche', e.target.value)}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Sector</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.sector || ''}
              onChange={(e) => handleSecurityDetailsChange('sector', e.target.value)}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Callable</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.callable || ''}
              onChange={(e) => handleSecurityDetailsChange('callable', e.target.value)}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Call Date</label>
            <TextField
              fullWidth
              type="date"
              value={formValues.securityDetails?.callDate || ''}
              onChange={(e) => handleSecurityDetailsChange('callDate', e.target.value)}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Price</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.price || ''}
              onChange={(e) => handleSecurityDetailsChange('price', e.target.value)}
              variant="outlined"
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
                value={formValues.esgFields?.tcwEsgValue || ''}
                onChange={(e) => handleESGChange('tcwEsgValue', e.target.value)}
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
              ESG Collateral Type <span className="klo-only-text">(CLO Only)</span>
            </label>
            <TextField
              fullWidth
              value={formValues.esgFields?.esgCollateralType || ''}
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
                value={formValues.esgFields?.tcwEsgTypeValue || ''}
                onChange={(e) => handleESGChange('tcwEsgTypeValue', e.target.value)}
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
                value={formValues.tradeFields?.slicerTypeValue || ''}
                onChange={(e) => handleTradeFieldsChange('slicerTypeValue', e.target.value)}
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
                value={formValues.tradeFields?.mbsTypeValue || ''}
                onChange={(e) => handleTradeFieldsChange('mbsTypeValue', e.target.value)}
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
                value={formValues.tradeFields?.loanCreditValue || ''}
                onChange={(e) => handleTradeFieldsChange('loanCreditValue', e.target.value)}
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
                value={formValues.tradeFields?.mbsCollateralValue || ''}
                onChange={(e) => handleTradeFieldsChange('mbsCollateralValue', e.target.value)}
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
                value={formValues.tradeFields?.mbsCollateralSubValue || ''}
                onChange={(e) => handleTradeFieldsChange('mbsCollateralSubValue', e.target.value)}
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
                value={formValues.tradeFields?.seniorMostCashFlowValue || ''}
                onChange={(e) => handleTradeFieldsChange('seniorMostCashFlowValue', e.target.value)}
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
                value={formValues.tradeFields?.trancheTypeValue || ''}
                onChange={(e) => handleTradeFieldsChange('trancheTypeValue', e.target.value)}
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
                value={formValues.tradeFields?.loanCategoryValue || ''}
                onChange={(e) => handleTradeFieldsChange('loanCategoryValue', e.target.value)}
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
                value={formValues.tradeFields?.collateralValue || ''}
                onChange={(e) => handleTradeFieldsChange('collateralValue', e.target.value)}
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
