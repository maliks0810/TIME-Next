import React from 'react';
import { Divider, Link, TextField } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ISecurityAttachmentData, SecuritySetupFlowType } from '../lib/types/securitySetupTypes';
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';
import { SelectFormField } from '../../../common/components/SelectFormField';
import { useReviewDetailsFields } from '../../../stores/selectors/securitySetupSelectors';
import { useSecuritySetupStore } from '../../../stores/useSecuritySetupStore';

interface ReviewDetailsPageProps {
  flowType?: SecuritySetupFlowType;
  referenceData: INormalizedReferenceData | null;
}

export const ReviewDetailsPage: React.FC<ReviewDetailsPageProps> = ({
  referenceData,
}) => {
  const {
    aladdinCdiId,
    euSecuritizationStatus,
    erisaStatus,
    securityDetails,
    esgFields,
    tradeFields,
    speedOverrides,
    notesInstructions,
    attachments,
    isReadOnly,
  } = useReviewDetailsFields();

  let { euSecuritizationTipEuId } = useReviewDetailsFields();

  const {
    updateIdentifierFields,
    updateSecurityDetails,
    updateEsgFields,
    updateTradeFields,
    updateSpeedOverrides,
    setNotesInstructions,
  } = useSecuritySetupStore();
  const isEuSecuritizationTipDisabled = euSecuritizationStatus?.toLowerCase() === 'not required' || euSecuritizationStatus?.toLowerCase() === '';

  const handleEuSecuritizationStatusChange = (value: string) => {
    if (value === 'Not Required') {
      updateIdentifierFields({
        euSecuritizationStatus: value,
        euSecuritizationTipEuId: undefined
      });
    } else {
      handleIdentifierFieldChange("euSecuritizationStatus", value);
    }
  }

  const setEuSecuritizationTipEuId = (euSecuritizationStatusValue?: string) => {
    if (euSecuritizationStatusValue === 'Not Required') {
      euSecuritizationTipEuId = undefined;
    }
    return euSecuritizationTipEuId || '';
  }

  const formatDateForInput = (isoDate?: string): string => {
    if (!isoDate) {
      return '';
    }

    return isoDate.split('T')[0];
  }

  const handleSecurityDetailsChange = (field: string, value: string | null) => {
    updateSecurityDetails({ [field]: value })
  }

  const handleIdentifierFieldChange = (field: string, value: string) => {
    updateIdentifierFields({ [field]: value })
  }

  const handleESGChange = (field: string, value: string) => {
    updateEsgFields({ [field]: value })
  };

  const handleTradeFieldsChange = (field: string, value: string) => {
    updateTradeFields({ [field]: value, })
  };


  const handleSpeedOverridesChange = (field: string, value: string | number | null) => {
    updateSpeedOverrides({ [field]: value, })
  };

  function roundToTwo(num: number): number {
    return +(Math.round(Number(num + "e+2")) + "e-2");
  }

  const setCallDateRequiredField = (callableValue: string | null | undefined): string => {
    if (callableValue === 'Y') return ' *';
    return '';
  }

  const setRPLRequiredField = (sectorValue: string | null | undefined): string => {
    if (sectorValue === 'RPL') return ' *';
    return '';
  }

  const toTwoDecimalValue = (userInput: string): number | null => {
    if (userInput === '') return null;
    const num = parseFloat(userInput);
    return isNaN(num) ? null : roundToTwo(num);
  }

  // programmatically clamp field within [min, max]
  const clampField = (field: string, min: number, max: number) => {
    const current = (speedOverrides as Record<string, unknown>)?.[field];

    if (typeof current !== 'number' || isNaN(current)) {
      return;
    }

    const clamped = Math.min(max, Math.max(min, current));
    if (clamped !== current) {
      handleSpeedOverridesChange(field, clamped);
    }
  }

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesInstructions(event.target.value)
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
              {attachments.map((doc: ISecurityAttachmentData) => (
                <div className="file-name-text" key={doc.attachmentId}>
                  <Link href={doc.sharepointWebUrl} target="_blank" rel="noopener noreferrer" className="upload-link">
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
              value={aladdinCdiId || ''}
              onChange={(e) => handleIdentifierFieldChange('aladdinCdiId', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Identifier</label>
            <TextField
              fullWidth
              value={securityDetails?.identifier || ''}
              onChange={(e) => handleSecurityDetailsChange('identifier', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Description</label>
            <TextField
              fullWidth
              value={securityDetails?.description || ''}
              onChange={(e) => handleSecurityDetailsChange('description', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Tranche</label>
            <TextField
              fullWidth
              value={securityDetails?.tranche || ''}
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
              value={securityDetails?.sectorValue}
              onChange={(value) => handleSecurityDetailsChange('sectorValue', value)}
              referenceData={referenceData}
              label="Sector *"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Callable}
              value={securityDetails?.callableValue}
              onChange={(value) => handleSecurityDetailsChange('callableValue', value)}
              referenceData={referenceData}
              label="Callable *"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <label className="field-label">{'Call Date' + setCallDateRequiredField(securityDetails?.callableValue)}</label>
            <TextField
              fullWidth
              type="date"
              value={formatDateForInput(securityDetails?.callDate)}
              onChange={(e) => handleSecurityDetailsChange('callDate', e.target.value)}
              disabled={isReadOnly}
              variant="outlined"
            />
          </div>
          <div className="form-field">
            <label className="field-label">Price *</label>
            <TextField
              fullWidth
              value={securityDetails?.price || ''}
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
              value={speedOverrides?.prepaymentTypeValue ?? undefined}
              onChange={(value) => handleSpeedOverridesChange('prepaymentTypeValue', value)}
              referenceData={referenceData}
              label={'Prepayment Type' + setRPLRequiredField(securityDetails?.sectorValue)}
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.DefaultType}
              value={speedOverrides?.defaultTypeValue ?? undefined}
              onChange={(value) => handleSpeedOverridesChange('defaultTypeValue', value)}
              referenceData={referenceData}
              label={'Default Type' + setRPLRequiredField(securityDetails?.sectorValue)}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">{'Prepayment Speed' + setRPLRequiredField(securityDetails?.sectorValue)}</label>
            <TextField
              fullWidth
              type="number"
              value={speedOverrides?.prepaymentSpeed ?? ''}
              onChange={(e) => handleSpeedOverridesChange('prepaymentSpeed', toTwoDecimalValue(e.target.value))}
              disabled={isReadOnly}
              variant="outlined"
              {...({ slotProps: { htmlInput: { inputMode: 'decimal' } } })}
            />
          </div>
          <div className="form-field">
            <label className="field-label">{'Default Speed' + setRPLRequiredField(securityDetails?.sectorValue)}</label>
            <TextField
              fullWidth
              type="number"
              value={speedOverrides?.defaultSpeed ?? ''}
              onChange={(e) => handleSpeedOverridesChange('defaultSpeed', toTwoDecimalValue(e.target.value))}
              disabled={isReadOnly}
              variant="outlined"
              {...({ slotProps: { htmlInput: { inputMode: 'decimal' } } })}
            />
          </div>
        </div>

        <div className="form-row two-column">
          <div className="form-field">
            <label className="field-label">{'Severity (0-100)' + setRPLRequiredField(securityDetails?.sectorValue)}</label>
            <TextField
              fullWidth
              type="number"
              value={speedOverrides?.severity ?? ''}
              onChange={(e) => handleSpeedOverridesChange('severity', toTwoDecimalValue(e.target.value))}
              onBlur={() => clampField('severity', 0, 100)}
              disabled={isReadOnly}
              variant="outlined"
              // TODO: investigate why min/max attributes are not enforced
              {...({ slotProps: { htmlInput: { min: 0, max: 100, inputMode: 'decimal' } } })}
            />
          </div>
          <div className="form-field">
            <label className="field-label">{'Delinquency (0-100)' + setRPLRequiredField(securityDetails?.sectorValue)}</label>
            <TextField
              fullWidth
              type="number"
              value={speedOverrides?.delinquency ?? ''}
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
          <label className="field-label">Notes / Instructions *</label>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={notesInstructions || ''}
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
              value={esgFields?.tcwEsgValue}
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
              value={esgFields?.esgCollateralType || ''}
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
              value={esgFields?.tcwEsgTypeValue}
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
              value={tradeFields?.slicerTypeValue}
              onChange={(value) => handleTradeFieldsChange('slicerTypeValue', value)}
              referenceData={referenceData}
              label="Slicer Type"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBS}
              value={tradeFields?.mbsTypeValue}
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
              value={tradeFields?.loanCreditValue}
              onChange={(value) => handleTradeFieldsChange('loanCreditValue', value)}
              referenceData={referenceData}
              label="Loan Credit"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBSCollateral}
              value={tradeFields?.mbsCollateralValue}
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
              value={tradeFields?.mbsCollateralSubValue}
              onChange={(value) => handleTradeFieldsChange('mbsCollateralSubValue', value)}
              referenceData={referenceData}
              label="MBS Collateral Sub"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SrMostCashFlow}
              value={tradeFields?.seniorMostCashFlowValue}
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
              value={tradeFields?.trancheTypeValue}
              onChange={(value) => handleTradeFieldsChange('trancheTypeValue', value)}
              referenceData={referenceData}
              label="Tranche Type"
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SMSLoanCategory}
              value={tradeFields?.loanCategoryValue}
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
              value={tradeFields?.collateralValue}
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
              value={euSecuritizationStatus}
              onChange={handleEuSecuritizationStatusChange}
              referenceData={referenceData}
              fullWidth={false}
              disabled={isReadOnly}
            />
          </div>
          <div className="form-field">
            <label className="field-label">EU Securitization TIP EU ID</label>
            <TextField
              fullWidth
              value={setEuSecuritizationTipEuId(euSecuritizationStatus)}
              onChange={(e) => handleIdentifierFieldChange('euSecuritizationTipEuId', e.target.value)}
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
                value={erisaStatus}
                onChange={(value) => handleIdentifierFieldChange('erisaStatus', value)}
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
