import React, { useEffect, useState } from 'react';
import { FormControl, TextField, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { IEnterIdentifierFormValues } from '../lib/types/securitySetupTypes';
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';
import { SelectFormField } from '../../../common/components/SelectFormField';
import { isNullOrEmpty } from '../../../utils/StringHelper';

interface EnterIdentifierPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly?: boolean;
  referenceData: INormalizedReferenceData | null;
  selectFieldErrors?: Partial<Record<string, string>>;
  onFileUpload?: (file: File) => void;
  selectedFileName?: string | null;
  uploadedFileName?: string | null;
  isUploadingFile?: boolean;
  fileUploadError?: string | null;
}

export const EnterIdentifierPage: React.FC<EnterIdentifierPageProps> = ({
  formValues,
  onFormChange,
  isReadOnly = false,
  referenceData,
  selectFieldErrors = {},
  onFileUpload,
  selectedFileName,
  uploadedFileName,
  isUploadingFile = false,
  fileUploadError
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    // if a request was duplicated, calculate these fields on load
    const ssapIdPassword = formValues.ssapIdPassword;
    const newIssue = formValues.newIssue
    const isPrivateDeal = !isNullOrEmpty(ssapIdPassword);
    const isSsapReleaseRequestSentToDm = isPrivateDeal;

    onFormChange({
      newIssue,
      isPrivateDeal,
      isSsapReleaseRequestSentToDm,
      ...(newIssue === 'no' ? { aladdinCDIId: undefined } : {})
    });
  }, []);

  const normalizeYesNo = (value: unknown): string => {
    if (value === 'yes' || value === true) {
      return 'yes'
    }

    if (value === 'no' || value === false) {
      return 'no'
    }

    return ''
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      await onFileUpload(file);
    }

    // reset input so same file can be re-selected if needed
    e.target.value = '';
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    if (!isUploadingFile) {
      setIsDragOver(true);
    }
  }

  const handleDragLeave = () => {
    setIsDragOver(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    setIsDragOver(false);
    if (isUploadingFile) {
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  }

  const setEuSecuritizationTipEuId = (euSecuritizationStatusValue?: string) => {
    if (euSecuritizationStatusValue === 'Not Required') {
      { formValues.euSecuritizationTipEuId = undefined };
    }
    return formValues.euSecuritizationTipEuId || '';
  }

  const effectiveNewIssue = normalizeYesNo(formValues.newIssue);

  const isYellowKeyVisable = false;
  const handleTextChange = (field: keyof IEnterIdentifierFormValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field == "ssapIdPassword") {
      const ssapIdPassword = event.target.value;
      const isPrivateDeal = !isNullOrEmpty(ssapIdPassword);
      const isSsapReleaseRequestSentToDm = isPrivateDeal;

      const updates: Partial<IEnterIdentifierFormValues> = {
        ssapIdPassword,
        isPrivateDeal,
        isSsapReleaseRequestSentToDm,
      }

      // only auto-select "yes" when user enters a ssap value.
      // do not auto push "no" on clear - silently overwrites radio selection and wipes aladdinCdiId
      if (ssapIdPassword.trim()) {
        updates.newIssue = 'yes';
      }

      onFormChange(updates);

      return;
    }

    onFormChange({
      [field]: event.target.value,
    });
  };

  return (
    <div className="enter-identifier-page">
      <div className="substep-content">
        {/* Offering Memorandum Upload */}
        <div className="offering-upload-section">
          <h3 className="section-title">Offering Memorandum Upload</h3>
          <div className='single-upload-box'>
            <input
              id='memorandum-upload-input'
              type='file'
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              disabled={isUploadingFile}
            />
            <label
              htmlFor='memorandum-upload-input'
              className={`memorandum-upload-box${isUploadingFile ? '' : ' memorandum-upload-box--clickable'}
                ${isDragOver ? ' memorandum-upload-box--drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploadingFile ? (
                <CircularProgress size={24} className='upload-progress-icon' />
              ) : uploadedFileName ? (
                <CheckCircleIcon className='upload-success-icon' />
              ) : (
                <InsertDriveFileIcon className='upload-doc-icon' />
              )}
              <div className="upload-text-wrapper">
                {isUploadingFile ? (
                  <span className='upload-instruction'> Uploading file...</span>
                ) : uploadedFileName ? (
                  <span className='upload-instruction'>{uploadedFileName}</span>
                ) : selectedFileName ? (
                  <>
                    <span className='upload-instruction'>
                      {selectedFileName}
                    </span>
                    <br />
                    <span>
                      will upload when you save or proceed to the next step.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="upload-instruction">
                      Click or drag Offering Memorandum to this area to upload (Optional)
                    </span>
                    <br />
                    <span className="upload-instruction">
                      Upload Offering Memorandum
                    </span>
                  </>
                )}
              </div>
            </label>
            {fileUploadError && (
              <span className='upload-error-text'>
                {fileUploadError}
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          {/* Deal Name */}
          <div className="form-row-group">
            <label className="field-label">Deal Name</label>
            <TextField
              fullWidth
              value={formValues.dealName || ''}
              onChange={handleTextChange('dealName')}
              variant="outlined"
              disabled={isReadOnly}
              placeholder="Sample Deal Name"
            />
          </div>

          <div className="form-row two-column">
            {/* EU Securitization Status */}
            <div className="form-row-group">
              <label className="field-label">EU Securitization Status *</label>
              <SelectFormField
                fieldKey={ReferenceDataFieldKey.EuSecuritizationStatus}
                value={formValues.euSecuritizationStatus}
                onChange={(value) => onFormChange({ euSecuritizationStatus: value })}
                referenceData={referenceData}
                disabled={isReadOnly || formValues.isEuSecuritizationRequired === false}
                fullWidth={false}
                className='field-input-half'
              />
            </div>

            <div className="form-row-group">
              <label className="field-label">EU Securitization TIP EU ID</label>
              <TextField
                fullWidth
                value={setEuSecuritizationTipEuId(formValues.euSecuritizationStatus)}
                onChange={handleTextChange('euSecuritizationTipEuId')}
                placeholder="Sample_TIP_ID"
                variant="outlined"
                disabled={isReadOnly || formValues.isEuSecuritizationRequired === false || formValues.euSecuritizationStatus === 'Not Required'}
              />
            </div>

            {/* Erisa Status */}
            <div className="form-row-group">
              <label className="field-label">Erisa Status *</label>
              <SelectFormField
                fieldKey={ReferenceDataFieldKey.ErisaStatus}
                value={formValues.erisaStatus}
                onChange={(value) => onFormChange({ erisaStatus: value })}
                referenceData={referenceData}
                disabled={isReadOnly}
                fullWidth={false}
                className='field-input-half'
              />
            </div>
          </div>


        </div>

        {/* New Issue */}
        <div className="form-row-group">
          <label className="field-label">New Issue *</label>
          <FormControl fullWidth>
            <RadioGroup
              value={effectiveNewIssue}
              defaultValue={'yes'}
              onChange={(e) => {
                const newIssue = e.target.value;
                onFormChange({
                  newIssue,
                  ...(newIssue === 'no' ? { aladdinCDIId: undefined, ssapIdPassword: undefined } : {})
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
          <label className="field-label">Aladdin CDI ID</label>
          <TextField
            fullWidth
            value={formValues.aladdinCDIId || ''}
            onChange={handleTextChange('aladdinCDIId')}
            placeholder="BDL123456"
            variant="outlined"
            disabled={isReadOnly || effectiveNewIssue.toLowerCase() === 'no'}
          />
        </div>

        {/* Intex Fields */}
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

        {/* BBG SSAP / Password */}
        <div className="form-row-group">
          <label className="field-label">BBG SSAP / Password</label>
          <TextField
            fullWidth
            value={formValues.ssapIdPassword || ''}
            onChange={handleTextChange('ssapIdPassword')}
            placeholder="Sample_Code"
            variant="outlined"
            disabled={isReadOnly || effectiveNewIssue.toLowerCase() === 'no'}
          />
        </div>

        {/* Bloomberg Identifier */}
        <div className="form-row two-column">
          <div>
            <label className="field-label">Identifier Type *</label>
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Identifier}
              value={formValues.identifierType}
              onChange={(value) => onFormChange({ identifierType: value })}
              referenceData={referenceData}
              disabled={isReadOnly}
              fullWidth={false}
              className='field-input-half'
              errorText={selectFieldErrors[ReferenceDataFieldKey.Identifier] ?? null}
            />
          </div>
          <div>
            <label className="field-label">Identifier</label>
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
          <label className="field-label">Market Sector/Yellow Key *</label>
          <div className="field-inputs-row">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MarketSector}
              value={formValues.marketSector}
              onChange={(value) => onFormChange({ marketSector: value })}
              referenceData={referenceData}
              disabled={isReadOnly}
              fullWidth={false}
              className='field-input-half'
              errorText={selectFieldErrors[ReferenceDataFieldKey.MarketSector] ?? null}
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



      </div>
    </div >
  );
};
