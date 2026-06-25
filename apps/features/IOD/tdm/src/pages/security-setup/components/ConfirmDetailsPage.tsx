import React from 'react';
import { Divider, Link, TextField } from '@mui/material';
import { ISecurityAttachmentData, SecuritySetupFlowType } from '../lib/types/securitySetupTypes';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { SelectFormField } from '../../../common/components/SelectFormField';
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';
import { useConfirmDetailsData } from '../../../stores/selectors/securitySetupSelectors';

interface ConfirmDetailsPageProps {
  flowType?: SecuritySetupFlowType;
  referenceData: INormalizedReferenceData | null;
}

export const ConfirmDetailsPage: React.FC<ConfirmDetailsPageProps> = ({ referenceData }) => {
  const {
    aladdinCdiId,
    identifierValue,
    euSecuritizationStatus,
    euSecuritizationTipEuId,
    erisaStatus,
    securityDetails,
    esgFields,
    tradeFields,
    speedOverrides,
    notesInstructions,
    attachments
  } = useConfirmDetailsData();

  const attachmentList = attachments ?? [];

  return (
    <div className="confirm-details-page">
      {/* Offering Memorandum Uploaded File */}
      {attachmentList.length > 0 &&
        (<div className="file-uploaded-indicator">
          <h3 className="section-title">Offering Memorandum Upload</h3>
          <div className="file-indicator-item">
            <AttachFileIcon className="file-paperclip-icon" />
            <div className="upload-text-wrapper">
              {attachmentList.map((doc: ISecurityAttachmentData) => (
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
              value={aladdinCdiId || ''}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Identifier</label>
            <TextField
              fullWidth
              value={identifierValue || ''}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Description</label>
            <TextField
              fullWidth
              value={securityDetails?.description || ''}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Tranche</label>
            <TextField
              fullWidth
              value={securityDetails?.tranche || ''}
              disabled
              variant="outlined"
            />
          </div>
        </div>
      </div>

      <Divider flexItem style={{ marginBottom: '18px' }} />

      <div className="form-section">
        <h3 className="section-title">Risk Details</h3>
        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Sector}
              value={securityDetails?.sectorValue}
              referenceData={referenceData}
              label="Sector"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Callable}
              value={securityDetails?.callableValue}
              referenceData={referenceData}
              label="Callable"
              disabled
            />
          </div>
          <div className="form-field">
            <label className="field-label">Call Date</label>
            <TextField
              fullWidth
              value={securityDetails?.callDate
                ? new Date(securityDetails?.callDate).toLocaleDateString("en-US", { timeZone: "UTC" })
                : ""}
              disabled
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Price</label>
            <TextField
              fullWidth
              value={securityDetails?.price || ''}
              disabled
              variant="outlined"
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.PrepaymentType}
              value={speedOverrides?.prepaymentTypeValue}
              referenceData={referenceData}
              label="Prepayment Type"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.DefaultType}
              value={speedOverrides?.defaultTypeValue}
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
              value={speedOverrides?.prepaymentSpeed}
              variant="outlined"
              disabled
            />
          </div>
          <div className="form-field">
            <label className="field-label">Default Speed</label>
            <TextField
              fullWidth
              type="number"
              value={speedOverrides?.defaultSpeed}
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
              value={speedOverrides?.severity}
              variant="outlined"
              disabled
            />
          </div>
          <div className="form-field">
            <label className="field-label">Delinquency (0-100)</label>
            <TextField
              fullWidth
              type="number"
              value={speedOverrides?.delinquency}
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
            value={notesInstructions || ''}
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
              value={esgFields?.tcwEsgValue}
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
              value={esgFields?.esgCollateralType || ''}
              disabled
              variant="outlined"
            />
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.TcwEsgType}
              value={esgFields?.tcwEsgTypeValue}
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
              value={tradeFields?.slicerTypeValue}
              referenceData={referenceData}
              label="Slicer Type"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBS}
              value={tradeFields?.mbsTypeValue}
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
              value={tradeFields?.loanCreditValue}
              referenceData={referenceData}
              label="Loan Credit"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBSCollateral}
              value={tradeFields?.mbsCollateralValue}
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
              value={tradeFields?.mbsCollateralSubValue}
              referenceData={referenceData}
              label="MBS Collateral Sub"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SrMostCashFlow}
              value={tradeFields?.seniorMostCashFlowValue}
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
              value={tradeFields?.trancheTypeValue}
              referenceData={referenceData}
              label="Tranche Type"
              disabled
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SMSLoanCategory}
              value={tradeFields?.loanCategoryValue}
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
              value={tradeFields?.collateralValue}
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
              value={euSecuritizationStatus}
              referenceData={referenceData}
              disabled
            />
          </div>
          <div className="form-field">
            <label className="field-label">EU Securitization TIP EU ID</label>
            <TextField
              fullWidth
              value={euSecuritizationTipEuId || ''}
              disabled
              variant="outlined"
            />
          </div>
        </div>
        <div className="form-row two-column">
          <div className="form-field">
            {/* ERISA Status */}
            <div className="form-field">
              <label className="field-label">ERISA Status</label>
              <SelectFormField
                fieldKey={ReferenceDataFieldKey.ErisaStatus}
                value={erisaStatus}
                onChange={() => { }}
                referenceData={referenceData}
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
