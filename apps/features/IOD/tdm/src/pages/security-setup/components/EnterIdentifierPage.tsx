import React, { useEffect, useState } from 'react';
import { FormControl, TextField, RadioGroup, FormControlLabel, Radio, CircularProgress, IconButton, Link } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';
import { SelectFormField } from '../../../common/components/SelectFormField';
import { isNullOrEmpty } from '../../../utils/StringHelper';
import { useIdentifierFields } from '../../../stores/selectors/securitySetupSelectors';
import { useSecuritySetupStore } from '../../../stores/useSecuritySetupStore';
import { ISecurityAttachmentData } from '../lib/types/securitySetupTypes';

export const MAX_FILES = 10;
export const MAX_FILE_SIZE_MB = 30; // matches server limit

interface EnterIdentifierPageProps {
  referenceData: INormalizedReferenceData | null;
  selectFieldErrors?: Partial<Record<string, string>>;
  onFileUpload?: (files: File[]) => void;
  missingFields?: Record<string, boolean>;
}

export const EnterIdentifierPage: React.FC<EnterIdentifierPageProps> = ({
  referenceData,
  selectFieldErrors = {},
  onFileUpload,
  missingFields = {}
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const formValues = useIdentifierFields();
  const { updateIdentifierFields, removePendingFile } = useSecuritySetupStore();

  useEffect(() => {
    // if a request was duplicated, calculate these fields on load
    const ssapIdPassword = formValues.ssapIdPassword;
    const newIssue = formValues.newIssue
    const isPrivateDeal = !isNullOrEmpty(ssapIdPassword);
    const isSsapReleaseRequestSentToDm = isPrivateDeal;

    updateIdentifierFields({
      newIssue,
      isPrivateDeal,
      isSsapReleaseRequestSentToDm,
    });
  }, []);

  const isReadOnly = formValues.isReadOnly;
  const isUserReadOnly = formValues.isUserReadOnly;
  const isUploadingFile = formValues.isUploadingFile;
  const fileUploadError = formValues.fileUploadError;
  const pendingUploadFiles = formValues.pendingUploadFiles;
  const attachments = formValues.attachments ?? [];

  const normalizeYesNo = (value: unknown): string => {
    if (value === 'yes' || value === true) return 'yes'
    if (value === 'no' || value === false) return 'no'
    return ''
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files?.length > 0 && onFileUpload) {
      await onFileUpload(files);
    }

    // reset input so same file can be re-selected if needed
    e.target.value = '';
  }

  const CUSIP_IDENTIFIER_MAX_LENGHT = 9;
  const OTHER_IDENTIFIER_MAX_LENGHT = 12;
  const setIdentityMaxLenght = (value: unknown): number => {
    if (value === 'CUSIP') {
      return CUSIP_IDENTIFIER_MAX_LENGHT
    }
    return OTHER_IDENTIFIER_MAX_LENGHT
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

    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  }

  const handleIdentifierPlaceholder = (identifierType: string | null | undefined) => {
    if (identifierType === 'FIGI') {
      return 'BBGZ000BLNNV0';
    }
    if (identifierType === 'ISIN') {
      return 'US1234567890';
    }
    return '';
  }

  const effectiveNewIssue = normalizeYesNo(formValues.newIssue);
  const identityMaxLenght = setIdentityMaxLenght(formValues.identifierType);

  const isYellowKeyVisible = false;

  const handleTextChange = (field: keyof typeof formValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field === "ssapIdPassword") {
      const ssapIdPassword = event.target.value;
      const isPrivateDeal = !isNullOrEmpty(ssapIdPassword);
      const isSsapReleaseRequestSentToDm = isPrivateDeal;

      const updates: Parameters<typeof updateIdentifierFields>[0] = {
        ssapIdPassword,
        isPrivateDeal,
        isSsapReleaseRequestSentToDm,
      }

      // only auto-select "yes" when user enters a ssap value.
      // do not auto push "no" on clear - silently overwrites radio selection and wipes aladdinCdiId
      if (ssapIdPassword.trim()) {
        updates.newIssue = 'yes';
      }

      updateIdentifierFields(updates);
      return;
    }
    if (field === "identifierValue") {
      const identifierValue = removeNonAlphanumeric(event.target.value);
      event.target.value = identifierValue;
    }

    updateIdentifierFields({ [field]: event.target.value });
  };

  function removeNonAlphanumeric(value: string): string {
    const returnValue = value.replace(/[^a-zA-Z0-9]/g, '');
    return returnValue;
  }

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
              multiple
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              disabled={isUploadingFile || pendingUploadFiles?.length >= MAX_FILES}
            />
            <label
              htmlFor='memorandum-upload-input'
              className={`memorandum-upload-box${(isUploadingFile || pendingUploadFiles?.length >= MAX_FILES) ? '' : ' memorandum-upload-box--clickable'}
                ${isDragOver ? ' memorandum-upload-box--drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploadingFile ? (
                <CircularProgress size={24} className='upload-progress-icon' />
              ) : pendingUploadFiles?.length > 0 ? (
                <CheckCircleIcon className='upload-success-icon' />
              ) : (
                <InsertDriveFileIcon className='upload-doc-icon' />
              )}
              <div className="upload-text-wrapper">
                {isUploadingFile && pendingUploadFiles.length ? (
                  <span className='upload-instruction'> Uploading {pendingUploadFiles.length} file{pendingUploadFiles.length !== 1 ? "s" : ""}...</span>
                ) : pendingUploadFiles?.length >= MAX_FILES ? (
                  <span className='upload-instruction'>
                    Maximum of {MAX_FILES} files reached.
                  </span>
                ) : (
                  <>
                    <span className="upload-instruction">
                      Click or drag Offering Memorandums to this area to upload (Optional)
                    </span>
                    <br />
                    <span className="upload-instruction">
                      Up to {MAX_FILES} files - {MAX_FILE_SIZE_MB}MB each
                    </span>
                  </>
                )}
              </div>
            </label>
            {pendingUploadFiles?.length > 0 && !isUploadingFile && (
              <ul className="upload-file-list">
                {pendingUploadFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="upload-file-list-item">
                    <InsertDriveFileIcon className="upload-file-list-icon" fontSize='small' />
                    <span className="upload-file-list-name">
                      {file.name}
                    </span>
                    <IconButton
                      size="small"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => removePendingFile(index)}
                      className="upload-file-list-remove"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </li>
                ))}
                <li className="upload-file-list-hint">
                  Files will upload when you save or proceed to the next step.
                </li>
              </ul>
            )}
            {fileUploadError && (
              <span className='upload-error-text'>
                {fileUploadError}
              </span>
            )}
          </div>
          {attachments.length > 0 &&
            (<div className="file-uploaded-indicator">
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
            </div>
            )}
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
              disabled={isReadOnly || isUserReadOnly}
              placeholder="Sample Deal Name"
            />
          </div>

          <div className="form-row two-column">
            {/* EU Securitization Status */}
            <div className={`form-row-group${missingFields.euSecuritizationStatus ? ' field-required-missing' : ''}`}>
              <label className="field-label">EU Securitization Status *</label>
              <SelectFormField
                fieldKey={ReferenceDataFieldKey.EuSecuritizationStatus}
                value={formValues.euSecuritizationStatus}
                onChange={(value) => updateIdentifierFields({
                  euSecuritizationStatus: value,
                  ...(value === 'Not Required' ? { euSecuritizationTipEuId: undefined } : {})
                })}
                referenceData={referenceData}
                disabled={isReadOnly || isUserReadOnly || formValues.isEuSecuritizationRequired === false}
                fullWidth={false}
                className='field-input-half'
              />
            </div>

            <div className="form-row-group">
              <label className="field-label">EU Securitization TIP EU ID</label>
              <TextField
                fullWidth
                value={formValues.euSecuritizationTipEuId || ""}
                onChange={handleTextChange('euSecuritizationTipEuId')}
                placeholder="Sample_TIP_ID"
                variant="outlined"
                disabled={isReadOnly || isUserReadOnly || formValues.isEuSecuritizationRequired === false || formValues.euSecuritizationStatus === 'Not Required'}
              />
            </div>

            {/* Erisa Status */}
            <div className={`form-row-group${missingFields.erisaStatus ? ' field-required-missing' : ''}`}>
              <label className="field-label">Erisa Status *</label>
              <SelectFormField
                fieldKey={ReferenceDataFieldKey.ErisaStatus}
                value={formValues.erisaStatus}
                onChange={(value) => updateIdentifierFields({ erisaStatus: value })}
                referenceData={referenceData}
                disabled={isReadOnly || isUserReadOnly}
                fullWidth={false}
                className='field-input-half'
              />
            </div>
          </div>


        </div>

        {/* New Issue */}
        <div className={`form-row-group${missingFields.newIssue ? ' field-required-missing' : ''}`}>
          <label className="field-label">New Issue *</label>
          <FormControl fullWidth>
            <RadioGroup
              value={effectiveNewIssue}
              defaultValue="yes"
              onChange={(e) => {
                const newIssue = e.target.value;
                updateIdentifierFields({
                  newIssue,
                  ...(newIssue === 'no' ? { aladdinCdiId: undefined, ssapIdPassword: undefined } : {})
                })
              }}
              row
            >
              <FormControlLabel
                value="yes"
                control={<Radio disabled={isReadOnly || isUserReadOnly} />}
                label="Yes"
              />
              <FormControlLabel
                value="no"
                control={<Radio disabled={isReadOnly || isUserReadOnly} />}
                label="No"
              />
            </RadioGroup>
          </FormControl>
        </div>

        {/* Aladdin CDI ID */}
        <div className={`form-row-group${missingFields.aladdinCdiId ? ' field-required-missing' : ''}`}>
          <label className="field-label">Aladdin CDI ID</label>
          <TextField
            fullWidth
            value={formValues.aladdinCdiId || ''}
            onChange={handleTextChange('aladdinCdiId')}
            placeholder="BDL123456"
            variant="outlined"
            disabled={isReadOnly || isUserReadOnly || effectiveNewIssue.toLowerCase() === 'no'}
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
              disabled={isReadOnly || isUserReadOnly}
            />
          </div>
          <div>
            <label className="field-label">Intex Password</label>
            <TextField
              value={formValues.intexPassword || ''}
              onChange={handleTextChange('intexPassword')}
              variant="outlined"
              disabled={isReadOnly || isUserReadOnly}
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
            disabled={isReadOnly || isUserReadOnly || effectiveNewIssue.toLowerCase() === 'no'}
          />
        </div>

        {/* Bloomberg Identifier */}
        <div className="form-row two-column">
          <div className={`form-row-group${missingFields.identifierType ? ' field-required-missing' : ''}`}>
            <label className="field-label">Identifier Type *</label>
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.Identifier}
              value={formValues.identifierType}
              onChange={(value) => {
                updateIdentifierFields({
                  identifierType: value,
                  identifierValue: undefined
                })
              }}
              referenceData={referenceData}
              disabled={isReadOnly || isUserReadOnly}
              fullWidth={false}
              className='field-input-half'
              errorText={selectFieldErrors[ReferenceDataFieldKey.Identifier] ?? null}
            />
          </div>
          <div className={`form-row-group${missingFields.identifierValue ? ' field-required-missing' : ''}`}>
            <label className="field-label">Identifier</label>
            <TextField
              className="field-input-half"
              value={formValues.identifierValue || ''}
              onChange={handleTextChange('identifierValue')}
              placeholder={handleIdentifierPlaceholder(formValues.identifierType)}
              variant="outlined"
              disabled={isReadOnly || isUserReadOnly}
              slotProps={{ htmlInput: { maxLength: identityMaxLenght } }}
            />
          </div>
        </div>

        {/* Market Sector */}
        <div className={`form-row-group${missingFields.marketSector ? ' field-required-missing' : ''}`}>
          <label className="field-label">Market Sector/Yellow Key *</label>
          <div className="field-inputs-row">
            <SelectFormField
              fieldKey={ReferenceDataFieldKey.MarketSector}
              value={formValues.marketSector}
              onChange={(value) => updateIdentifierFields({ marketSector: value })}
              referenceData={referenceData}
              disabled={isReadOnly || isUserReadOnly}
              fullWidth={false}
              className='field-input-half'
              errorText={selectFieldErrors[ReferenceDataFieldKey.MarketSector] ?? null}
            />
            {isYellowKeyVisible && (
              <TextField
                className="field-input-half"
                label="Yellow Key"
                value={formValues.yellowKey || ''}
                onChange={handleTextChange('yellowKey')}
                placeholder="MTGE"
                variant="outlined"
                disabled={isReadOnly || isUserReadOnly}
              />
            )}
          </div>
        </div>
      </div>
    </div >
  );
};
