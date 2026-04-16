import React from 'react';
import { Divider, Link, TextField } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { SecuritySetupFlowType, IReviewDetailsFormValues, ISecurityAttachmentData } from '../lib/types/securitySetupTypes';
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';
import { SelectFormField } from '../../../common/components/SelectFormField';

interface ReviewDetailsPageProps {
  formValues: IReviewDetailsFormValues;
  onFormChange: (values: Partial<IReviewDetailsFormValues>) => void;
  flowType?: SecuritySetupFlowType;
  referenceData: INormalizedReferenceData | null;
  attachments?: ISecurityAttachmentData[];
  isReadOnly?: boolean;
}

export const ReviewDetailsPage: React.FC<ReviewDetailsPageProps> = ({
  formValues,
  onFormChange,
  referenceData,
  attachments = [],
  isReadOnly = false,
}) => {
  const isEuSecuritizationTipDisabled = formValues.securityDetails?.euSecuritizationStatus?.toLowerCase() === 'not required' || formValues.securityDetails?.euSecuritizationStatus?.toLowerCase() === '';

  const setEuSecuritizationTipEuId = (euSecuritizationStatusValue?: string) => {
    if (euSecuritizationStatusValue === 'Not Required') {
      formValues.securityDetails.euSecuritizationTipEuId = undefined;
    }
    return formValues.securityDetails.euSecuritizationTipEuId || '';
  }

  const formatDateForInput = (isoDate?: string): string => {
    if (!isoDate) {
      return '';
    }

    return isoDate.split('T')[0];
  }

  const handleSecurityDetailsChange = (field: string, value: string | boolean | null) => {
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


  const handleSpeedOverridesChange = (field: string, value: string | number | null) => {
    const updated = {
      ...formValues.speedOverrides,
      [field]: value,
    };

    onFormChange({
      speedOverrides: updated
    });
  };


  function roundToTwo(num: number): number {
    return +(Math.round(Number(num + "e+2")) + "e-2");
  }

  const toTwoDecimalValue = (userInput: string): number | null => {
    if (userInput === '') return null;
    const num = parseFloat(userInput);
    return isNaN(num) ? null : roundToTwo(num);
  }

  // programmatically clamp field within [min, max]
  const clampField = (field: string, min: number, max: number) => {
    const current = (formValues.speedOverrides as Record<string, unknown>)?.[field];

    if (typeof current !== 'number' || isNaN(current)) {
      return;
    }

    const clamped = Math.min(max, Math.max(min, current));
    if (clamped !== current) {
      handleSpeedOverridesChange(field, clamped);
    }
  }

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormChange({
      notesInstructions: event.target.value,
    });
  };

  return (
    <div className="review-details-page">
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
              value={formValues.securityDetails?.aladdinCDIId || ''}
              onChange={(e) => handleSecurityDetailsChange('aladdinCDIId', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Identifier</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.identifier || ''}
              onChange={(e) => handleSecurityDetailsChange('identifier', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Description</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.description || ''}
              onChange={(e) => handleSecurityDetailsChange('description', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Tranche</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.tranche || ''}
              onChange={(e) => handleSecurityDetailsChange('tranche', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
        </div>
      </div>

      <Divider flexItem style={{ marginBottom: '18px' }} />

      {/* Risk Details Section */}
      <div className="form-section">
        <h3 className="section-title">Risk Details</h3>
        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Sector}
              value={formValues.securityDetails?.sectorValue}
              onChange={(value) => handleSecurityDetailsChange('sectorValue', value)}
              referenceData={referenceData}
              label="Sector"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Callable}
              value={formValues.securityDetails?.callableValue}
              onChange={(value) => handleSecurityDetailsChange('callableValue', value)}
              referenceData={referenceData}
              label="Callable"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <label className="field-label">Call Date</label>
            <TextField
              fullWidth
              type="date"
              value={formatDateForInput(formValues.securityDetails?.callDate)}
              onChange={(e) => handleSecurityDetailsChange('callDate', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Price</label>
            <TextField
              fullWidth
              value={formValues.securityDetails?.price || ''}
              onChange={(e) => handleSecurityDetailsChange('price', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.PrepaymentType}
              value={formValues.speedOverrides?.prepaymentTypeValue ?? undefined}
              onChange={(value) => handleSpeedOverridesChange('prepaymentTypeValue', value)}
              referenceData={referenceData}
              label="Prepayment Type"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.DefaultType}
              value={formValues.speedOverrides?.defaultTypeValue ?? undefined}
              onChange={(value) => handleSpeedOverridesChange('defaultTypeValue', value)}
              referenceData={referenceData}
              label="Default Type"
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Prepayment Speed</label>
            <TextField
              fullWidth
              type="number"
              value={formValues.speedOverrides?.prepaymentSpeed ?? ''}
              onChange={(e) => handleSpeedOverridesChange('prepaymentSpeed', toTwoDecimalValue(e.target.value))}
              disabled={isReadOnly}
              variant="outlined"
              {...({ slotProps: { htmlInput: { inputMode: 'decimal' } } })}
            />
          </div>
          <div className="form-field">
            <label className="field-label">Default Speed</label>
            <TextField
              fullWidth
              type="number"
              value={formValues.speedOverrides?.defaultSpeed ?? ''}
              onChange={(e) => handleSpeedOverridesChange('defaultSpeed', toTwoDecimalValue(e.target.value))}
              disabled={isReadOnly}
              variant="outlined"
              {...({ slotProps: { htmlInput: { inputMode: 'decimal' } } })}
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">Severity (0-100)</label>
            <TextField
              fullWidth
              type="number"
              value={formValues.speedOverrides?.severity ?? ''}
              onChange={(e) => handleSpeedOverridesChange('severity', toTwoDecimalValue(e.target.value))}
              onBlur={() => clampField('severity', 0, 100)}
              disabled={isReadOnly}
              variant="outlined"
              // TODO: investigate why min/max attributes are not enforced
              {...({ slotProps: { htmlInput: { min: 0, max: 100, inputMode: 'decimal' } } })}
            />
          </div>
          <div className="form-field">
            <label className="field-label">Delinquency (0-100)</label>
            <TextField
              fullWidth
              type="number"
              value={formValues.speedOverrides?.delinquency ?? ''}
              onChange={(e) => handleSpeedOverridesChange('delinquency', toTwoDecimalValue(e.target.value))}
              onBlur={() => clampField('delinquency', 0, 100)}
              disabled={isReadOnly}
              variant="outlined"
              // TODO: investigate why min/max attributes are not enforced
              {...({ slotProps: { htmlInput: { min: 0, max: 100, inputMode: 'decimal' } } })}
            />
          </div>
        </div>

        {/* Notes / Instructions Section */}
        <div className="form-field" >
          <label className="field-label">Notes / Instructions</label>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={formValues.notesInstructions || ''}
            onChange={handleNotesChange}
            disabled={isReadOnly}
            variant="outlined"
            placeholder=""
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
              value={formValues.esgFields?.tcwEsgValue}
              onChange={(value) => handleESGChange('tcwEsgValue', value)}
              referenceData={referenceData}
              label="TCW ESG"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <label className="field-label">
              ESG Collateral Type <span className="klo-only-text">(CLO Only)</span>
            </label>
            <TextField
              fullWidth
              value={formValues.esgFields?.esgCollateralType || ''}
              onChange={(e) => handleESGChange('esgCollateralType', e.target.value)}
              // temp disabled for IOD-8453
              disabled
              variant="outlined"
              className="esg-collateral-field"
            />
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.TcwEsgType}
              value={formValues.esgFields?.tcwEsgTypeValue}
              onChange={(value) => handleESGChange('tcwEsgTypeValue', value)}
              referenceData={referenceData}
              label="TCW ESG Type"
              disabled={isReadOnly}
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
              value={formValues.tradeFields?.slicerTypeValue}
              onChange={(value) => handleTradeFieldsChange('slicerTypeValue', value)}
              referenceData={referenceData}
              label="Slicer Type"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBS}
              value={formValues.tradeFields?.mbsTypeValue}
              onChange={(value) => handleTradeFieldsChange('mbsTypeValue', value)}
              referenceData={referenceData}
              label="MBS Type"
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.LoanCreditType}
              value={formValues.tradeFields?.loanCreditValue}
              onChange={(value) => handleTradeFieldsChange('loanCreditValue', value)}
              referenceData={referenceData}
              label="Loan Credit"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBSCollateral}
              value={formValues.tradeFields?.mbsCollateralValue}
              onChange={(value) => handleTradeFieldsChange('mbsCollateralValue', value)}
              referenceData={referenceData}
              label="MBS Collateral"
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBSCollateralSub}
              value={formValues.tradeFields?.mbsCollateralSubValue}
              onChange={(value) => handleTradeFieldsChange('mbsCollateralSubValue', value)}
              referenceData={referenceData}
              label="MBS Collateral Sub"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SrMostCashFlow}
              value={formValues.tradeFields?.seniorMostCashFlowValue}
              onChange={(value) => handleTradeFieldsChange('seniorMostCashFlowValue', value)}
              referenceData={referenceData}
              label="Sr. Most Cash Flow"
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Tranche}
              value={formValues.tradeFields?.trancheTypeValue}
              onChange={(value) => handleTradeFieldsChange('trancheTypeValue', value)}
              referenceData={referenceData}
              label="Tranche Type"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SMSLoanCategory}
              value={formValues.tradeFields?.loanCategoryValue}
              onChange={(value) => handleTradeFieldsChange('loanCategoryValue', value)}
              referenceData={referenceData}
              label="Loan Category"
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="form-row single-column">
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Collateral}
              value={formValues.tradeFields?.collateralValue}
              onChange={(value) => handleTradeFieldsChange('collateralValue', value)}
              referenceData={referenceData}
              label="Collateral"
              disabled={isReadOnly}
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
              value={formValues.securityDetails?.euSecuritizationStatus}
              onChange={(value) => handleSecurityDetailsChange('euSecuritizationStatus', value)}
              referenceData={referenceData}
              fullWidth={false}
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <label className="field-label">EU Securitization TIP EU ID</label>
            <TextField
              fullWidth
              value={setEuSecuritizationTipEuId(formValues.securityDetails?.euSecuritizationStatus)}
              onChange={(e) => handleSecurityDetailsChange('euSecuritizationTipEuId', e.target.value)}
              disabled={isReadOnly || isEuSecuritizationTipDisabled}
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
                value={formValues.securityDetails?.erisaStatus}
                onChange={(value) => handleSecurityDetailsChange('erisaStatus', value)}
                referenceData={referenceData}
                fullWidth={false}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};
