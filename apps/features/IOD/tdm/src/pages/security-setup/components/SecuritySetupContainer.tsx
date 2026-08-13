import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, IconButton, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import { useUserInfo } from '@platform/utils';
import { HorizontalStepper } from './HorizontalStepper';
import { EnterIdentifierPage, MAX_FILE_SIZE_MB, MAX_FILES } from './EnterIdentifierPage';
import { SSAPApprovalPage } from './SSAPApprovalPage';
import { ReviewDetailsPage } from './ReviewDetailsPage';
import { ConfirmDetailsPage } from './ConfirmDetailsPage';
import { SubmitConfirmationModal } from './SubmitConfirmationModal';
import {
  SecuritySetupFlowType,
  SecuritySetupStatus,
  SecuritySetupStep,
} from '../lib/types/securitySetupTypes';
import '../lib/styles.scss';
import { useSecuritySetupSave } from '../hooks/useSecuritySetupSave';
import { ISecuritySetupRequestAttachment, ISecuritySetupWizardPayload } from '../../../services/domain-objects/SecuritySetupRequestPayload';
import { SecuritySetupService } from '../../../services/SecuritySetupService';
import { useReferenceData } from '../hooks/useReferenceData';
import { useIdentity } from '../../../hooks/useIdentity';
import { getStepNumber } from '../utils/securitySetupApiTransformer';
import {
  isValidString,
  isValidPrice,
  isValidNotes,
  isValidLoanCategory,
  isValidCallDate,
  isRPLStringFieldValid,
  isRPLNumberFieldValid,
  isValidIdentifier
} from '../utils/securitySetupValidation';
import { ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';
import { ApiResponseError } from '../../../common/lib/ApiResponseError';
import { ErrorModal } from '../../../common/components/ErrorModal';
import { useSecuritySetupStore } from '../../../stores/useSecuritySetupStore';
import { useIdentityStore } from '../../../stores/useIdentityStore';
import {
  useWizardNavigation,
  useHasPasswordFlow,
  useValidationFields,
  useSummary,
  useFileUploadState
} from '../../../stores/selectors/securitySetupSelectors';
import { setDmAssignment } from '../../../services/DashboardService';

const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface SecuritySetupContainerProps {
  flowType: SecuritySetupFlowType;
  onComplete?: (data: Partial<ISecuritySetupWizardPayload>) => void;
  onCancel?: () => void;
  initialData?: Partial<ISecuritySetupWizardPayload> | null;
}

export const SecuritySetupContainer: React.FC<SecuritySetupContainerProps> = ({
  flowType,
  onComplete,
  onCancel,
  initialData,
}) => {
  const navigate = useNavigate();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalBody, setErrorModalBody] = useState('');
  const { name: currentUser, email: currentUserEmail } = useUserInfo();

  // Server state hooks — stay as hooks, not in Zustand
  const { data: referenceData, loading: loadingReferenceData, error: referenceDataError } =
    useReferenceData();

  useIdentity();

  const {
    saveStatus,
    queueWizardSave,
    clearError,
    lastSavedAt,
    error: saveError,
    securitySetupRequestId,
  } = useSecuritySetupSave({
    onError: (error) => console.error("Save failed:", error),
    initialSecuritySetupRequestId: initialData?.securitySetupRequestId,
  });

  // Store actions
  const {
    resetWizard,
    hydrateFromPayload,
    mergeSavedResponse,
    markStepComplete,
    goToStep,
    setReadOnly,
    setUserReadOnly,
    openConfirmModal,
    closeConfirmModal,
    setPendingFiles,
    setUploadingFile,
    setFileUploadError,
    setAttachments,
    updateIdentifierFields
  } = useSecuritySetupStore();

  // Store state via selectors
  const { currentStep, completedSteps, isReadOnly, isUserReadOnly, showConfirmModal } = useWizardNavigation();
  const hasPasswordFlow = useHasPasswordFlow();
  const validationFields = useValidationFields();
  const step1Summary = useSummary();
  const { pendingUploadFiles, isUploadingFile } = useFileUploadState();

  const isCancelled =
    initialData?.securitySetupStatusId === SecuritySetupStatus.Cancelled;

  useEffect(() => {
    const cancelled = initialData?.securitySetupStatusId === SecuritySetupStatus.Cancelled;
    setReadOnly(cancelled);
  }, [initialData]);

  const [isDirty, setIsDirty] = useState(false);
  const stepBaseLineRef = useRef(validationFields);

  useEffect(() => {
    setIsDirty(false);
    stepBaseLineRef.current = validationFields;
  }, [currentStep])

  useEffect(() => {
    if (validationFields !== stepBaseLineRef.current) {
      setIsDirty(true);
    }
  }, [validationFields]);

  const initialRequestId = initialData?.securitySetupRequestId ?? null;
  useEffect(() => {
    resetWizard();
    if (initialData) {
      hydrateFromPayload(initialData);
    }
  }, [initialRequestId]);

  const userIdentity = useIdentityStore((s) => s.userIdentity);

  // Set to read only if DM Analyst is assigned to a different user
  useEffect(() => {
    const canEditAnySecuritySetupRequest = userIdentity?.permissionsAllowed?.edit_any_security_setup_request || false;
    // Check if user can edit any request regardless of assignment (DM Admin)
    if (!canEditAnySecuritySetupRequest) {
      const readOnly = (initialData?.dmAnalystName !== undefined && currentUser !== initialData?.dmAnalystName);
      setUserReadOnly(readOnly);
    }
  }, [initialData])

  useEffect(() => {
    setDmAnalyst();
  }, [initialData, referenceData])
  
  const setDmAnalyst = useCallback(async () => {
    if (currentUser && currentUserEmail && initialData) {
      if (initialData.securitySetupRequestId) {
        // if a DM Analyst opens the request and no DM Analyst is assigned, then self-assign
        if (initialData.dmAnalystName === null || initialData.dmAnalystName === undefined) {
          const dmAnalystOptions = referenceData?.byKey[ReferenceDataFieldKey.DmAnalyst]?.fieldDropdownValues ?? [];
          if (dmAnalystOptions.length > 0) {
            const dmAnalystNames = dmAnalystOptions.map(option => option.fieldDropdownDescription ?? '');
            if (dmAnalystNames.includes(currentUser)){
              initialData.dmAnalystName = currentUser;
              await setDmAssignment({
                securitySetupRequestId: initialData.securitySetupRequestId,
                name: currentUser,
                email: currentUserEmail,
                updatedBy: currentUser
              });
            }
          }
        }
      }
    }
  }, [currentUser, currentUserEmail, initialData, referenceData])

  const saveErrorMessage = saveStatus === "error" ? (saveError?.message ?? "") : "";
  const isInvalidMarketSector = !!saveErrorMessage.includes("Invalid Market Sector");
  const isInvalidIdentifier = !!saveErrorMessage.includes("Invalid Identifier");
  const selectFieldErrors: Partial<Record<string, string>> = isInvalidMarketSector
    ? { [ReferenceDataFieldKey.MarketSector]: saveErrorMessage }
    : isInvalidIdentifier
      ? { [ReferenceDataFieldKey.Identifier]: saveErrorMessage }
      : {};

  // ─── Wizard data builder (reads store imperatively — always reads latest state ─

  const getAllWizardData = (): Record<string, unknown> => {
    const s = useSecuritySetupStore.getState();
    return {
      externalSecuritySetupRequestId: s.externalSecuritySetupRequestId,
      identifierType: s.identifierType,
      identifierValue: s.identifierValue,
      marketSector: s.marketSector,
      yellowKey: s.yellowKey,
      newIssue: s.newIssue,
      cdiFileUploadedToAnser: s.cdiFileUploadedToAnser,
      aladdinCdiId: s.aladdinCdiId,
      isPrivateDeal: s.isPrivateDeal,
      ssapIdPassword: s.ssapIdPassword,
      isSsapReleaseRequestSentToDm: s.isSsapReleaseRequestSentToDm,
      isSsapReleasedByDm: s.isSsapReleasedByDm,
      isEuSecuritizationRequired: s.isEuSecuritizationRequired,
      euSecuritizationTipEuId: s.euSecuritizationTipEuId,
      euSecuritizationStatus: s.euSecuritizationStatus,
      erisaStatus: s.erisaStatus,
      intexDealName: s.intexDealName,
      intexPassword: s.intexPassword,
      dealName: s.dealName,
      securityDetails: s.securityDetails,
      esgFields: s.esgFields,
      tradeFields: s.tradeFields,
      speedOverrides: s.speedOverrides,
      notesInstructions: s.notesInstructions,
      attachments: s.attachments,
      ...(s.uploadedFile && { uploadedFile: s.uploadedFile, isConfirmed: true }),
      dmAnalystName: s.dmAnalystName,
      dmAnalystEmail: s.dmAnalystEmail,
    };
  };

  const getAuditFields = useCallback(() => {
    if (securitySetupRequestId == null) {
      return { 
        createdBy: currentUser,
        createdByEmail: currentUserEmail,
        createdDate: new Date().toISOString() 
      };
    }
    return {
      updatedBy: currentUser,
      updatedByEmail: currentUserEmail,
      updatedDate: new Date().toISOString() 
    };
  }, [securitySetupRequestId, currentUser]);

  const getNextStep = (current: SecuritySetupStep): SecuritySetupStep | null => {
    switch (current) {
      case "enter-identifier":
        return hasPasswordFlow ? "ssap-confirmation" : "review-details";
      case "ssap-confirmation":
        return "review-details";
      case "review-details":
        return "confirm-details";
      case "confirm-details":
        return null;
      default:
        return null;
    }
  };

  const getPreviousStep = (current: SecuritySetupStep): SecuritySetupStep | null => {
    const currentIndex = completedSteps.indexOf(current);
    if (currentIndex > 0) return completedSteps[currentIndex - 1];
    if (currentIndex === 0) return null;
    if (completedSteps.length > 0) return completedSteps[completedSteps.length - 1];
    return null;
  };

  const getCurrentStepNumber = (): number => getStepNumber(currentStep);

  const canProceed = (): boolean => {
    if (isCancelled) {
      return currentStep !== 'confirm-details';
    }

    if (isUploadingFile) {
      return false;
    }

    if (saveStatus === 'saving' || saveStatus === 'saved') {
      return false;
    }
    if (isReadOnly) {
      return true;
    }

    switch (currentStep) {
      case 'enter-identifier':
        const { identifierType, identifierValue, marketSector, euSecuritizationStatus, erisaStatus, newIssue } = validationFields;
        if (!isValidString(identifierType) ||
          !isValidString(identifierValue) ||
          !isValidIdentifier(identifierType, identifierValue) ||
          !isValidString(marketSector) ||
          !isValidString(euSecuritizationStatus) ||
          !isValidString(erisaStatus) ||
          !isValidString(newIssue)) {
          return false;
        }
        return true;
      case 'ssap-confirmation':
      case 'review-details':
        const { sectorValue, callableValue, callDate, price, prepaymentTypeValue, defaultTypeValue, prepaymentSpeed, defaultSpeed, severity, delinquency, notes, loanCategoryValue } = validationFields;
        if (!isValidString(sectorValue) ||
          !isValidPrice(price) ||
          !isValidString(callableValue) ||
          !isValidLoanCategory(loanCategoryValue) ||
          !isValidNotes(sectorValue, notes) ||
          !isValidCallDate(sectorValue, callableValue, callDate) ||
          !isRPLStringFieldValid(sectorValue, prepaymentTypeValue) ||
          !isRPLStringFieldValid(sectorValue, defaultTypeValue) ||
          !isRPLNumberFieldValid(sectorValue, prepaymentSpeed) ||
          !isRPLNumberFieldValid(sectorValue, defaultSpeed) ||
          !isRPLNumberFieldValid(sectorValue, severity) ||
          !isRPLNumberFieldValid(sectorValue, delinquency)
        ) {
          return false;
        }
        return true;
      case 'confirm-details':
        return true;
      default:
        return false;
    }
  };

  const getMissingFields = (): Record<string, boolean> => {
    if (!isDirty || isReadOnly || isCancelled) return {};

    if (currentStep === "enter-identifier") {
      const { identifierType, identifierValue, marketSector, euSecuritizationStatus, erisaStatus, newIssue } = validationFields;
      return {
        identifierType: !isValidString(identifierType),
        identifierValue: !isValidString(identifierValue) || !isValidIdentifier(identifierType, identifierValue),
        marketSector: !isValidString(marketSector),
        euSecuritizationStatus: !isValidString(euSecuritizationStatus),
        erisaStatus: !isValidString(erisaStatus),
        newIssue: !isValidString(newIssue)
      };
    }

    if (currentStep === "review-details") {
      const { sectorValue, callableValue, callDate, price, prepaymentTypeValue, defaultTypeValue, prepaymentSpeed, defaultSpeed, severity, delinquency, notes, loanCategoryValue } = validationFields;

      return {
        sectorValue: !isValidString(sectorValue),
        price: !isValidPrice(price),
        callableValue: !isValidString(callableValue),
        callDate: !isValidCallDate(sectorValue, callableValue, callDate),
        notes: !isValidNotes(sectorValue, notes),
        loanCategoryValue: !isValidLoanCategory(loanCategoryValue),
        prepaymentTypeValue: !isRPLStringFieldValid(sectorValue, prepaymentTypeValue),
        defaultTypeValue: !isRPLStringFieldValid(sectorValue, defaultTypeValue),
        prepaymentSpeed: !isRPLNumberFieldValid(sectorValue, prepaymentSpeed),
        defaultSpeed: !isRPLNumberFieldValid(sectorValue, defaultSpeed),
        severity: !isRPLNumberFieldValid(sectorValue, severity),
        delinquency: !isRPLNumberFieldValid(sectorValue, delinquency),
      };
    }

    return {};
  };

  // ─── File upload ───────────────────────────────────────────────────────────

  const handleFileUpload = useCallback((files: File[]) => {
    setFileUploadError(null);
    const stored = useSecuritySetupStore.getState().pendingUploadFiles;
    const current = Array.isArray(stored) ? stored : [];

    if (current?.length + files?.length > MAX_FILES) {
      setFileUploadError(`You can upload a maximum of ${MAX_FILES} files.`);
      return;
    }

    const oversized = files.find((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setFileUploadError(
        `"${oversized.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`
      );
      return;
    }

    setPendingFiles([...current, ...files]);
  }, [setFileUploadError, setPendingFiles]);

  const uploadFiles = useCallback(
    async (requestId: number, files: File[]): Promise<ISecuritySetupRequestAttachment[] | null> => {
      setUploadingFile(true);
      setFileUploadError(null);
      try {
        const results: ISecuritySetupRequestAttachment[] = [];

        for (const file of files) {
          const uploaded = await SecuritySetupService.uploadAttachment(requestId, currentUser || "", file);

          if (uploaded) {
            results.push(...uploaded)
          }
        }

        setPendingFiles([]);
        return results;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to upload file.";
        setFileUploadError(msg);
        return null;
      } finally {
        setUploadingFile(false);
      }
    },
    [currentUser, setUploadingFile, setFileUploadError, setPendingFiles],
  );

  const resetUploadState = () => {
    setPendingFiles(undefined);
    setFileUploadError(null);
  };

  // ─── Next / Save / Back ────────────────────────────────────────────────────

  const handleNext = async () => {
    const nextStep = getNextStep(currentStep);
    const filesToUpload = pendingUploadFiles;
    const shouldPersist =
      !isCancelled && (!isReadOnly || (currentStep === "enter-identifier" && filesToUpload?.length > 0));

    if (shouldPersist) {
      markStepComplete(currentStep);
      clearError();

      const stepToSave = nextStep ?? currentStep;
      const stepNumberToSave = nextStep ? getCurrentStepNumber() + 1 : getCurrentStepNumber();
      let allData = { ...getAllWizardData(), ...getAuditFields() }

      const savedData = await queueWizardSave(stepToSave, stepNumberToSave, allData, "complete");
      if (!savedData) return;

      if (savedData instanceof Error) {
        updateIdentifierFields({ isSsapReleasedByDm: false });
        if (savedData instanceof ApiResponseError) {
          setErrorModalBody(savedData.message);
          setShowErrorModal(true);
        }
        return;
      }

      // Upload any queued attachments now that we have a guaranteed request ID
      const requestId = savedData.securitySetupRequestId ?? securitySetupRequestId;
      let freshAttachments: ISecuritySetupRequestAttachment[] = [];

      if (filesToUpload?.length > 0) {
        if (!requestId) {
          setFileUploadError("Cannot upload file: missing Security Setup Request ID");
          return;
        }
        const uploadResult = await uploadFiles(requestId, filesToUpload);
        if (!uploadResult) return;
        freshAttachments = uploadResult;
      }

      // Merge server response into flat store state
      mergeSavedResponse(savedData);
      if (freshAttachments.length > 0) {
        setAttachments(freshAttachments);
      }
    }

    if (isCancelled) {
      markStepComplete(currentStep);
      clearError();
    }

    if (nextStep) {
      goToStep(nextStep);
      setReadOnly(false);
    } else if (currentStep === "confirm-details" && !isCancelled) {
      openConfirmModal();
    }
  };

  const handleBack = () => {
    const prevStep = getPreviousStep(currentStep);
    if (prevStep) {
      clearError();
      if (prevStep === "enter-identifier") {
        resetUploadState();
        setReadOnly(true);
      } else {
        setReadOnly(false);
      }

      goToStep(prevStep);
    } else if (onCancel) {
      resetWizard();
      onCancel();
    }
  };

  const handleSave = async () => {
    clearError();
    const savedData = await queueWizardSave(
      currentStep,
      getCurrentStepNumber(),
      { ...getAllWizardData(), ...getAuditFields() },
      "partial",
      { isSaveOnly: true },
    );

    if (savedData instanceof Error) {
      if (savedData instanceof ApiResponseError) {
        setErrorModalBody(savedData.message);
        setShowErrorModal(true);
      }
      return;
    }

    if (savedData) {
      if (pendingUploadFiles.length > 0) {
        const requestId = savedData.securitySetupRequestId || securitySetupRequestId;
        if (!requestId) {
          setFileUploadError("Cannot upload file: missing Security Setup Request ID");
          return;
        }
        const uploaded = await uploadFiles(requestId, pendingUploadFiles);
        if (!uploaded) return;
      }
      resetWizard();
      navigate("/iod/tdm/");
    }
  };

  const handleClose = async () => {
    resetWizard();
    navigate("/iod/tdm/");
  }

  const handleConfirmSubmit = async () => {
    const finalSavedData = await queueWizardSave(
      "confirm-details",
      4,
      {
        ...getAllWizardData(),
        ...getAuditFields(),
        isReviewed: true,
        reviewedBy: currentUser,
        reviewedDate: new Date().toISOString(),
      },
      "complete",
    );
    closeConfirmModal();

    if (finalSavedData instanceof Error) {
      if (finalSavedData instanceof ApiResponseError) {
        setErrorModalBody(finalSavedData.message);
        setShowErrorModal(true);
      }
      return;
    }

    if (onComplete) {
      if (finalSavedData) {
        mergeSavedResponse(finalSavedData);
        onComplete({ ...finalSavedData, securitySetupRequestId });
      } else {
        onComplete({ ...useSecuritySetupStore.getState(), securitySetupRequestId });
      }
    }
  };

  const handleCancelSubmit = () => closeConfirmModal();

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  }

  const getStepTitle = (): string => {
    switch (currentStep) {
      case "enter-identifier": return "Step 1 of 4: Enter Identifier";
      case "ssap-confirmation": return "Step 2 of 4: SAPI Login";
      case "review-details": return "Step 3 of 4: Security Request Template";
      case "confirm-details": return "Step 4 of 4: Review Security Data";
      default: return "";
    }
  };

  const renderSuccessMessages = () => {
    if (currentStep === "ssap-confirmation" || currentStep === "review-details") {
      const messages: { message: string }[] = [];
      if (step1Summary.newIssue) {
        messages.push({ message: `New Issue: ${step1Summary.newIssue === "yes" ? "Yes" : "No"}` });
      }
      if (step1Summary.aladdinCdiId) {
        messages.push({ message: `Aladdin CDI ID: ${step1Summary.aladdinCdiId}` });
      }
      if (step1Summary.ssapIdPassword) {
        messages.push({ message: `Private Deal SSAP ID/Password: ${step1Summary.ssapIdPassword}` });
      }
      if (step1Summary.identifierType && step1Summary.identifierValue) {
        messages.push({ message: `Identifier: ${step1Summary.identifierType} - ${step1Summary.identifierValue}` });
      }
      if (step1Summary.marketSector) {
        messages.push({ message: `Market Sector: ${step1Summary.marketSector}` });
      }
      if (step1Summary.isEuSecuritizationRequired) {
        messages.push({ message: `EU Security Verification Required: ${step1Summary.isEuSecuritizationRequired === true ? "Yes" : "No"}` });
      }
      if (step1Summary.euSecuritizationTipEuId) {
        messages.push({ message: `EU Securitization TIP EU ID: ${step1Summary.euSecuritizationTipEuId}` });
      }
      if (messages.length === 0) return null;
      return (
        <div className="success-messages-box">
          <h3 className="summary-title">Step 1 Summary</h3>
          {messages.map((msg, index) => (
            <div key={index} className="success-message-item">
              <CheckCircleIcon className="success-check-icon" />
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
      );
    }

    if (currentStep === "confirm-details") {
      const messages: { message: string }[] = [];
      if (step1Summary.identifierValue) {
        messages.push({
          message: `Identifier: ${step1Summary.identifierType || "FIGI"} ${step1Summary.identifierValue}`,
        });
      }
      if (messages.length === 0) return null;
      return (
        <div className="substep-success-messages">
          {messages.map((msg, index) => (
            <div key={index} className="substep-success-item">
              <CheckCircleIcon className="substep-success-icon" />
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "enter-identifier":
        return (
          <EnterIdentifierPage
            referenceData={referenceData}
            selectFieldErrors={selectFieldErrors}
            onFileUpload={handleFileUpload}
            missingFields={getMissingFields()}
          />
        );
      case "ssap-confirmation":
        return (
          <SSAPApprovalPage
            onProceedToReview={handleNext}
            isSaving={saveStatus === "saving" || saveStatus === "saved"}
            hasSaveError={saveStatus === "error"}
            onBack={() => {
              resetUploadState();
              const released = useSecuritySetupStore?.getState()?.isSsapReleasedByDm;
              if (released && saveStatus !== "error") {
                setReadOnly(true);
              }
              goToStep("enter-identifier");
            }}
          />
        );
      case "review-details":
        return (
          <ReviewDetailsPage
            flowType={flowType}
            referenceData={referenceData}
            missingFields={getMissingFields()}
          />
        );
      case "confirm-details":
        return (
          <ConfirmDetailsPage
            flowType={flowType}
            referenceData={referenceData}
          />
        );
      default:
        return null;
    }
  };

  const getButtonText = (): string => {
    if (currentStep === "enter-identifier") return "Next";
    if (currentStep === "ssap-confirmation") return "Approve SSAP";
    if (currentStep === "review-details") return "Review Request";
    if (currentStep === "confirm-details") return "Confirm Request";
    return "Next";
  };

  const renderSaveStatus = () => (
    <div className="save-status" style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "8px" }}>
      {saveStatus === "saving" && <span>💾 Saving...</span>}
      {saveStatus === "saved" && lastSavedAt && (
        <span style={{ color: "#4caf50" }}>✓ Saved at {lastSavedAt.toLocaleTimeString()}</span>
      )}
      {saveStatus === "error" && saveError && (
        <span style={{ color: "#f44336", display: "flex", alignItems: "center", gap: "4px" }}>
          Failed to save wizard data
        </span>
      )}
    </div>
  );

  // ─── Loading / error gates ─────────────────────────────────────────────────

  if (loadingReferenceData) {
    return (
      <div className="security-setup-wizard" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </div>
    );
  }

  if (referenceDataError) {
    return (
      <div className="security-setup-wizard" style={{ padding: "40px" }}>
        <Alert severity="error">
          Failed to load dropdown options: {referenceDataError.message}
          <Button onClick={() => window.location.reload()} style={{ marginLeft: "16px" }}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  const showBackButton = completedSteps.length > 0;

  return (
    <div className="security-setup-wizard">
      <div className="wizard-header">
        <h1 className="wizard-title">Security Setup Wizard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {renderSaveStatus()}
          <div className="wizard-close-container">
            <IconButton className="wizard-close-button" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <span className="wizard-cancel-text" onClick={handleClose}>Cancel</span>
          </div>
        </div>
      </div>

      <HorizontalStepper
        currentStepNumber={getCurrentStepNumber()}
        totalSteps={4}
        stepTitle={getStepTitle()}
      />

      <div className="wizard-content">
        {currentStep === 'ssap-confirmation' || currentStep === 'review-details' || currentStep === 'confirm-details' ? (
          <>
            {renderSuccessMessages()}
            {renderStepContent()}
          </>
        ) : (
          renderStepContent()
        )}
      </div>

      <div className="wizard-actions">
        {showBackButton &&
          currentStep !== "enter-identifier" &&
          currentStep !== "ssap-confirmation" && (
            <Button
              variant="outlined"
              className="back-button"
              onClick={handleBack}
              disabled={isCancelled || isUserReadOnly}
              startIcon={<ArrowBackIcon />}>
              Back
            </Button>
          )}
        {(currentStep === "enter-identifier" || currentStep === "review-details") && (
          <Button
            variant="outlined"
            className="save-button"
            onClick={handleSave}
            disabled={isCancelled || (currentStep === "enter-identifier" && isReadOnly) || isUserReadOnly}
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        )}
        {currentStep !== "ssap-confirmation" && (
          <Button
            variant="contained"
            className="next-button"
            onClick={handleNext}
            disabled={!canProceed() || isCancelled || isUserReadOnly}
            endIcon={
              currentStep === 'confirm-details' ? (
                <CheckIcon />
              ) : (
                <ArrowForwardIcon />
              )
            }
          >
            {getButtonText()}
          </Button>
        )}
      </div>

      <SubmitConfirmationModal
        open={showConfirmModal}
        onClose={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
      />
      <ErrorModal
        header='Unable to save Security Setup Request'
        body={errorModalBody}
        open={showErrorModal}
        onClose={handleErrorModalClose}
      />
    </div>
  );
};
