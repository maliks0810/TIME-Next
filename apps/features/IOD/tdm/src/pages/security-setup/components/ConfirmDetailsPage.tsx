import React from 'react';
import { FormControl, MenuItem, Select, TextField } from '@mui/material';
import { IConfirmDetailsData, SecuritySetupFlowType } from '../lib/types';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface ConfirmDetailsPageProps {
  data: IConfirmDetailsData;
  flowType?: SecuritySetupFlowType;
}

export const ConfirmDetailsPage: React.FC<ConfirmDetailsPageProps> = ({ data }) => {
  return (
    <div className="confirm-details-page">
      {/* File Upload Indicator */}
      <div className="file-uploaded-indicator">
        <h3 className="section-title">Offering Memorandum Upload</h3>
        <div className="file-indicator-item">
          <AttachFileIcon className="file-paperclip-icon" />
          <span className="file-name-text">file.file_extension</span>
        </div>
      </div>


      {/* SSAP ID/Password Section */}
      {data.ssapIdPassword && (
        <div className="form-section">
          <h3 className='section-title'>SSAP Credentials</h3>
          <div className='form-row single-column'>
            <div className='form-field'>
              <label className="field-label">SSAP ID/Password</label>
              <TextField
                fullWidth
                value={data.ssapIdPassword}
                disabled
                variant='outlined'
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Details Section */}
      <div className="form-section">
        <h3 className="section-title">Security Details</h3>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Aladdin CDI ID</label>
            <TextField
              fullWidth
              value={data.securityDetails?.aladdinCDIId || 'BDL123456'}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Identifier</label>
            <TextField
              fullWidth
              value={data.securityDetails?.identifier || '61779KAA4'}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Description</label>
            <TextField
              fullWidth
              value={data.securityDetails?.description || 'MSBM 2025-NQM7 A1'}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Tranche</label>
            <TextField
              fullWidth
              value={data.securityDetails?.tranche || 'A'}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Sector</label>
            <TextField
              fullWidth
              value={data.securityDetails?.sector || 'Non-QM'}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Callable</label>
            <TextField
              fullWidth
              value={data.securityDetails?.callable || 'Y'}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Call Date</label>
            <TextField
              fullWidth
              value={data.securityDetails?.callDate || '9/25/2029'}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Price</label>
            <TextField
              fullWidth
              value={data.securityDetails?.price || '99.30'}
              disabled
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
            <FormControl fullWidth disabled>
              <Select
                value={data.esgFields?.tcwEsgValue || ''}
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
              ESG Collateral Type <span className="klo-only-text-red">(CLO Only)</span>
            </label>
            <TextField
              fullWidth
              value={data.esgFields?.esgCollateralType || 'x'}
              disabled
              variant="outlined"
            />
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <label className="field-label">TCW ESG Type</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.esgFields?.tcwEsgTypeValue || ''}
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
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.slicerTypeValue || ''}
                displayEmpty
              >
                <MenuItem value="">MBS</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">MBS Type</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.mbsTypeValue || ''}
                displayEmpty
              >
                <MenuItem value="">Non-Agency</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Loan Credit</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.loanCreditValue || ''}
                displayEmpty
              >
                <MenuItem value="">Non-QM</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">MBS Collateral</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.mbsCollateralValue || ''}
                displayEmpty
              >
                <MenuItem value="">Fixed</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">MBS Collateral Sub</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.mbsCollateralSubValue || ''}
                displayEmpty
              >
                <MenuItem value="">Other</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">Sr. Most Cash Flow</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.seniorMostCashFlowValue || ''}
                displayEmpty
              >
                <MenuItem value="">Non-Qualifying Mortgage</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Tranche Type</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.trancheTypeValue || ''}
                displayEmpty
              >
                <MenuItem value="">SEQ</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">Loan Category</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.loanCategoryValue || ''}
                displayEmpty
              >
                <MenuItem value="">Non-QM</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <label className="field-label">Collateral</label>
            <FormControl fullWidth disabled>
              <Select
                value={data.tradeFields?.collateralValue || ''}
                displayEmpty
              >
                <MenuItem value="">Non-Agency</MenuItem>
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
          value={data.notesInstructions || ''}
          disabled
          variant="outlined"
        />
      </div>
    </div>
  );
};
