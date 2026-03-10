import React from 'react';
import { TextField } from '@mui/material';
import { IConfirmDetailsData, SecuritySetupFlowType } from '../lib/types/securitySetupTypes';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { SelectFormField } from '../../../common/components/SelectFormField';
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';

interface ConfirmDetailsPageProps {
  data: IConfirmDetailsData;
  flowType?: SecuritySetupFlowType;
  referenceData: INormalizedReferenceData | null;
}

export const ConfirmDetailsPage: React.FC<ConfirmDetailsPageProps> = ({ data, referenceData }) => {
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
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Sector}
              value={data.securityDetails?.sectorValue}
              onChange={() => { }}
              referenceData={referenceData}
              label="Sector"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Callable}
              value={data.securityDetails?.callableValue}
              onChange={() => { }}
              referenceData={referenceData}
              label="Callable"
              disabled
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
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.IsTotalESGTCW}
              value={data.esgFields?.tcwEsgValue}
              referenceData={referenceData}
              label="TCW ESG"
              disabled
            />
          </div>
          <div className="form-field">
            <label className="field-label">
              ESG Collateral Type <span className="klo-only-text-red">(CLO Only)</span>
            </label>
            <TextField
              fullWidth
              value={data.esgFields?.esgCollateralType || ''}
              disabled
              variant="outlined"
            />
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.TcwEsgType}
              value={data.esgFields?.tcwEsgTypeValue}
              referenceData={referenceData}
              label="TCW ESG Type"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Trader Fields Section */}
      <div className="form-section">
        <h3 className="section-title">Trader Fields</h3>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Slicer}
              value={data.tradeFields?.slicerTypeValue}
              referenceData={referenceData}
              label="Slicer Type"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBS}
              value={data.tradeFields?.mbsTypeValue}
              referenceData={referenceData}
              label="MBS Type"
              disabled
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.LoanCreditType}
              value={data.tradeFields?.loanCreditValue}
              referenceData={referenceData}
              label="Loan Credit"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBSCollateral}
              value={data.tradeFields?.mbsCollateralValue}
              referenceData={referenceData}
              label="MBS Collateral"
              disabled
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBSCollateralSub}
              value={data.tradeFields?.mbsCollateralSubValue}
              referenceData={referenceData}
              label="MBS Collateral Sub"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SrMostCashFlow}
              value={data.tradeFields?.seniorMostCashFlowValue}
              referenceData={referenceData}
              label="Sr. Most Cash Flow"
              disabled
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Tranche}
              value={data.tradeFields?.trancheTypeValue}
              referenceData={referenceData}
              label="Tranche Type"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SMSLoanCategory}
              value={data.tradeFields?.loanCategoryValue}
              referenceData={referenceData}
              label="Loan Category"
              disabled
            />
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Collateral}
              value={data.tradeFields?.collateralValue}
              referenceData={referenceData}
              label="Collateral"
              disabled
            />
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
