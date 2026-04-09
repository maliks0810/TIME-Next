import React from 'react';
import { Divider, Link, TextField } from '@mui/material';
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
  const attachments = data.attachments ?? [];

  return (
    <div className="confirm-details-page">
      {/* Offering Memorandum Uploaded File */}
      {attachments.length > 0 &&
        (<div className="file-uploaded-indicator">
          <h3 className="section-title">Offering Memorandum Upload</h3>
          <div className="file-indicator-item">
            <AttachFileIcon className="file-paperclip-icon" />
            <div className="upload-text-wrapper">
              {attachments.map((doc) => (
                <div className="file-name-text" key={doc.attachmentId}>
                  <Link
                    href={doc.sharepointWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="upload-link"
                  >
                    {doc.fileName}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>)}

      {/* Security Details Section */}
      <div className="form-section">
        <h3 className="section-title">Security Details</h3>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Aladdin CDI ID</label>
            <TextField
              fullWidth
              value={data.securityDetails?.aladdinCDIId || ''}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Identifier</label>
            <TextField
              fullWidth
              value={data.securityDetails?.identifier || ''}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Description</label>
            <TextField
              fullWidth
              value={data.securityDetails?.description || ''}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Tranche</label>
            <TextField
              fullWidth
              value={data.securityDetails?.tranche || ''}
              disabled
              variant="outlined"
            />
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
      </div>

      <Divider flexItem style={{ marginBottom: '18px' }} />

      <div className="form-section">
        <h3 className="section-title">Risk Details</h3>
        <div className="form-row two-column">
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
              value={new Date(data.securityDetails?.callDate || "").toLocaleDateString("en-US")}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Price</label>
            <TextField
              fullWidth
              value={data.securityDetails?.price || ''}
              disabled
              variant="outlined"
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.PrepaymentType}
              value={data.speedOverrides?.prepaymentTypeValue}
              onChange={() => { }}
              referenceData={referenceData}
              label="Prepayment Type"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.DefaultType}
              value={data.speedOverrides?.defaultTypeValue}
              onChange={() => { }}
              referenceData={referenceData}
              label="Default Type"
              disabled
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Prepayment Speed</label>
            <TextField
              fullWidth
              type="number"
              value={data.speedOverrides?.prepaymentSpeed}
              onChange={() => { }}
              variant="outlined"
              disabled
            />
          </div>
          <div className="form-field">
            <label className="field-label">Default Speed</label>
            <TextField
              fullWidth
              type="number"
              value={data.speedOverrides?.defaultSpeed}
              onChange={() => { }}
              variant="outlined"
              disabled
            />
          </div>
        </div>
        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Severity (0-100)</label>
            <TextField
              fullWidth
              type="number"
              value={data.speedOverrides?.severity}
              onChange={() => { }}
              variant="outlined"
              disabled
            />
          </div>
          <div className="form-field">
            <label className="field-label">Delinquency (0-100)</label>
            <TextField
              fullWidth
              type="number"
              value={data.speedOverrides?.delinquency}
              onChange={() => { }}
              variant="outlined"
              disabled
            />
          </div>
        </div>

        {/* Notes / Instructions Section */}
        <div className="form-section">
          <label className="field-label">Notes / Instructions</label>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={data.notesInstructions || ''}
            disabled
            variant="outlined"
          />
        </div>
      </div>

      <Divider flexItem style={{ marginBottom: '18px' }} />

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

      <Divider flexItem style={{ marginBottom: '18px' }} />

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

      <Divider flexItem style={{ marginBottom: '18px' }} />

      {/* Eu Securitization Status */}
      <div className="form-section" >
        <h3 className="section-title">EU Securitization Status & ERISA</h3>
        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">EU Securitization Status</label>
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.EuSecuritizationStatus}
              value={data.securityDetails?.euSecuritizationStatus}
              onChange={() => { }}
              referenceData={referenceData}
              disabled
            />
          </div>
          {/* ERISA Status */}
          <div className="form-field">
            <label className="field-label">ERISA Status</label>
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.ErisaStatus}
              value={data.securityDetails?.erisaStatus}
              onChange={() => { }}
              referenceData={referenceData}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
};
