import React from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { SecuritySetupFlowType, IReviewDetailsFormValues } from '../lib/types/securitySetupTypes';
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';
import { SelectFormField } from '../../../common/components/SelectFormField';


interface ReviewDetailsPageProps {
  formValues: IReviewDetailsFormValues;
  onFormChange: (values: Partial<IReviewDetailsFormValues>) => void;
  flowType?: SecuritySetupFlowType;
  referenceData: INormalizedReferenceData | null;
}

export const ReviewDetailsPage: React.FC<ReviewDetailsPageProps> = ({
  formValues,
  onFormChange,
  referenceData
}) => {
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

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormChange({
      notesInstructions: event.target.value,
    });
  };

  return (
    <div className="review-details-page">
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
            <FormControl fullWidth>
              <RadioGroup
                value={formValues.securityDetails?.isCallable === true ? 'yes' : 'no'}
                onChange={(e) => {
                  const boolValue: boolean = e.target.value === 'yes'
                  handleSecurityDetailsChange('isCallable', boolValue)
                }}
                row
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio />}
                  label="Yes"
                />
                <FormControlLabel
                  value="no"
                  control={<Radio />}
                  label="No"
                />
              </RadioGroup>
            </FormControl>
          </div>
          <div className="form-field">
            <label className="field-label">Call Date</label>
            <TextField
              fullWidth
              type="date"
              value={formatDateForInput(formValues.securityDetails?.callDate)}
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
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.IsTotalESGTCW}
              value={formValues.esgFields?.tcwEsgValue}
              onChange={(value) => handleESGChange('tcwEsgValue', value)}
              referenceData={referenceData}
              label="TCW ESG"
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
              value={formValues.tradeFields?.slicerTypeValue}
              onChange={(value) => handleTradeFieldsChange('slicerTypeValue', value)}
              referenceData={referenceData}
              label="Slicer Type"
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBS}
              value={formValues.tradeFields?.mbsTypeValue}
              onChange={(value) => handleTradeFieldsChange('mbsTypeValue', value)}
              referenceData={referenceData}
              label="MBS Type"
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
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MBSCollateral}
              value={formValues.tradeFields?.mbsCollateralValue}
              onChange={(value) => handleTradeFieldsChange('mbsCollateralValue', value)}
              referenceData={referenceData}
              label="MBS Collateral"
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
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SrMostCashFlow}
              value={formValues.tradeFields?.seniorMostCashFlowValue}
              onChange={(value) => handleTradeFieldsChange('seniorMostCashFlowValue', value)}
              referenceData={referenceData}
              label="Sr. Most Cash Flow"
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
            />
          </div>
          <div className="form-field">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.SMSLoanCategory}
              value={formValues.tradeFields?.loanCategoryValue}
              onChange={(value) => handleTradeFieldsChange('loanCategoryValue', value)}
              referenceData={referenceData}
              label="Loan Category"
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
          value={formValues.notesInstructions || ''}
          onChange={handleNotesChange}
          variant="outlined"
          placeholder=""
        />
      </div>
    </div>
  );
};
