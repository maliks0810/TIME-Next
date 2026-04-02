import React, { useState, useCallback, useEffect } from 'react';
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
import { EnterIdentifierPage } from './EnterIdentifierPage';
import { SSAPApprovalPage, UserInput } from './SSAPApprovalPage';
import { ReviewDetailsPage } from './ReviewDetailsPage';
import { ConfirmDetailsPage } from './ConfirmDetailsPage';
import { SubmitConfirmationModal } from './SubmitConfirmationModal';
import {
  SecuritySetupFlowType,
  SecuritySetupStatus,
  ISecuritySetupWizardData,
  IEnterIdentifierFormValues,
  IReviewDetailsFormValues,
} from '../lib/types/securitySetupTypes';
import '../lib/styles.scss';
import { useSecuritySetupSave } from '../hooks/useSecuritySetupSave';
import { ISecuritySetupRequestAttachment, ISecuritySetupWizardPayload } from '../../../services/domain-objects/SecuritySetupRequestPayload';
import { SecuritySetupService } from '../../../services/SecuritySetupService';
import { useReferenceData } from '../hooks/useReferenceData';
import { getStepNumber } from '../utils/securitySetupApiTransformer';
import { ReferenceDataFieldKey } from '../lib/types/referenceDataTypes';

interface SecuritySetupContainerProps {
  flowType: SecuritySetupFlowType;
  onComplete?: (data: ISecuritySetupWizardData) => void;
  onCancel?: () => void;
  initialData?: Partial<ISecuritySetupWizardPayload> | null;
}

type WizardStep = 'enter-identifier' | 'ssap-confirmation' | 'review-details' | 'confirm-details';

const mergeWizardDataWithSaveResponse = (
  prev: ISecuritySetupWizardData,
  savedData: Partial<ISecuritySetupWizardPayload>
): Pick<ISecuritySetupWizardData, 'step1' | 'step2'> => {
  const mergedStep1: IEnterIdentifierFormValues = {
    ...prev.step1,
    newIssue: savedData.newIssue ?? prev.step1.newIssue,
    cdiFileUploadedToAnser: savedData.cdiFileUploadedToAnser ?? prev.step1.cdiFileUploadedToAnser,
    aladdinCDIId: savedData.aladdinCDIId ?? prev.step1.aladdinCDIId,
    isPrivateDeal: savedData.isPrivateDeal ?? prev.step1.isPrivateDeal,
    ssapIdPassword: savedData.ssapIdPassword ?? prev.step1.ssapIdPassword,
    isSsapReleaseRequestSentToDm: savedData.isSsapReleaseRequestSentToDm ?? prev.step1.isSsapReleaseRequestSentToDm,
    isSsapReleasedByDm: savedData.isSsapReleasedByDm ?? prev.step1.isSsapReleasedByDm,
    identifierType: savedData.identifierType ?? prev.step1.identifierType,
    identifierValue: savedData.identifierValue ?? prev.step1.identifierValue,
    marketSector: savedData.marketSector ?? prev.step1.marketSector,
    yellowKey: savedData.yellowKey ?? prev.step1.yellowKey,
    isEuSecuritizationRequired: savedData.isEuSecuritizationRequired ?? undefined,
    euSecuritizationTipEuId: savedData.euSecuritizationTipEuId ?? prev.step1.euSecuritizationTipEuId,
    euSecuritizationStatus: savedData.euSecuritizationStatus ?? prev.step1.euSecuritizationStatus,
    erisaStatus: savedData.erisaStatus ?? prev.step1.erisaStatus,
    intexDealName: savedData.intexDealName ?? undefined,
    intexPassword: savedData.intexPassword ?? undefined,
    dealName: savedData.dealName ?? undefined,
  };

  const mergedStep2: IReviewDetailsFormValues = {
    securityDetails: {
      ...prev.step2.securityDetails,
      aladdinCDIId: savedData.securityDetails?.aladdinCDIId ?? prev.step2.securityDetails?.aladdinCDIId,
      identifier: savedData.securityDetails?.identifier ?? prev.step2.securityDetails?.identifier,
      description: savedData.securityDetails?.description ?? prev.step2.securityDetails?.description,
      tranche: savedData.securityDetails?.tranche ?? prev.step2.securityDetails?.tranche,
      sectorValue: savedData.securityDetails?.sectorValue ?? prev.step2.securityDetails?.sectorValue,
      callDate: savedData.securityDetails?.callDate ?? prev.step2.securityDetails?.callDate,
      price: savedData.securityDetails?.price ?? prev.step2.securityDetails?.price,
      cusip: savedData.securityDetails?.cusip ?? prev.step2.securityDetails?.cusip,
      callableValue: savedData.securityDetails?.callableValue ?? prev.step2.securityDetails?.callableValue,
      euSecuritizationStatus: savedData.securityDetails?.euSecuritizationStatus ?? prev.step2.securityDetails.euSecuritizationStatus,
      erisaStatus: savedData.securityDetails?.erisaStatus ?? prev.step2.securityDetails.erisaStatus,
    },
    esgFields: {
      tcwEsgValue: savedData.esgFields?.tcwEsgValue ?? prev.step2.esgFields?.tcwEsgValue,
      tcwEsgTypeValue: savedData.esgFields?.tcwEsgTypeValue ?? prev.step2.esgFields?.tcwEsgTypeValue,
      esgCollateralType: savedData.esgFields?.esgCollateralType ?? prev.step2.esgFields?.esgCollateralType,
    },
    tradeFields: {
      slicerTypeValue: savedData.tradeFields?.slicerTypeValue ?? prev.step2.tradeFields?.slicerTypeValue,
      mbsTypeValue: savedData.tradeFields?.mbsTypeValue ?? prev.step2.tradeFields?.mbsTypeValue,
      loanCreditValue: savedData.tradeFields?.loanCreditValue ?? prev.step2.tradeFields?.loanCreditValue,
      mbsCollateralValue: savedData.tradeFields?.mbsCollateralValue ?? prev.step2.tradeFields?.mbsCollateralValue,
      mbsCollateralSubValue: savedData.tradeFields?.mbsCollateralSubValue ?? prev.step2.tradeFields?.mbsCollateralSubValue,
      seniorMostCashFlowValue: savedData.tradeFields?.seniorMostCashFlowValue ?? prev.step2.tradeFields?.seniorMostCashFlowValue,
      trancheTypeValue: savedData.tradeFields?.trancheTypeValue ?? prev.step2.tradeFields?.trancheTypeValue,
      loanCategoryValue: savedData.tradeFields?.loanCategoryValue ?? prev.step2.tradeFields?.loanCategoryValue,
      collateralValue: savedData.tradeFields?.collateralValue ?? prev.step2.tradeFields?.collateralValue,
      ffiecQual: savedData.tradeFields?.ffiecQual ?? prev.step2.tradeFields?.ffiecQual,
    },
    speedOverrides: {
      prepaymentTypeValue: savedData.speedOverrides?.prepaymentTypeValue ?? prev.step2.speedOverrides?.prepaymentTypeValue,
      defaultTypeValue: savedData.speedOverrides?.defaultTypeValue ?? prev.step2.speedOverrides?.defaultTypeValue,
      prepaymentSpeed: savedData.speedOverrides?.prepaymentSpeed ?? prev.step2.speedOverrides?.prepaymentSpeed,
      defaultSpeed: savedData.speedOverrides?.defaultSpeed ?? prev.step2.speedOverrides?.defaultSpeed,
      severity: savedData.speedOverrides?.severity ?? prev.step2.speedOverrides?.severity,
      delinquency: savedData.speedOverrides?.delinquency ?? prev.step2.speedOverrides?.delinquency,
    },
    notesInstructions: savedData.notesInstructions ?? prev.step2.notesInstructions,
    attachments: savedData.attachments?.length ? savedData.attachments : prev.step2.attachments
  };

  return { step1: mergedStep1, step2: mergedStep2 }
}

export const SecuritySetupContainer: React.FC<SecuritySetupContainerProps> = ({
  flowType,
  onComplete,
  onCancel,
  initialData,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('enter-identifier');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  const isCancelled = initialData?.securitySetupStatusId === SecuritySetupStatus.Cancelled;

  const { data: referenceData, loading: loadingReferenceData, error: referenceDataError } = useReferenceData();

  const { name: currentUser } = useUserInfo();

  const [wizardData, setWizardData] = useState<ISecuritySetupWizardData>({
    step1: {},
    step2: {
      securityDetails: {},
      esgFields: {},
      tradeFields: {},
      speedOverrides: {}
    },
    updatedBy: currentUser
  });

  useEffect(() => {
    if (initialData) {
      setWizardData({
        step1: {
          newIssue: initialData.newIssue ?? undefined,
          cdiFileUploadedToAnser: initialData.cdiFileUploadedToAnser ?? undefined,
          aladdinCDIId: initialData.aladdinCDIId ?? undefined,
          isPrivateDeal: initialData.isPrivateDeal ?? undefined,
          ssapIdPassword: initialData.ssapIdPassword ?? undefined,
          isSsapReleaseRequestSentToDm: initialData.isSsapReleaseRequestSentToDm ?? false,
          isSsapReleasedByDm: initialData.isSsapReleasedByDm ?? false,
          identifierType: initialData.identifierType ?? undefined,
          identifierValue: initialData.identifierValue ?? undefined,
          marketSector: initialData.marketSector ?? undefined,
          yellowKey: initialData.yellowKey ?? undefined,
          isEuSecuritizationRequired: initialData.isEuSecuritizationRequired ?? undefined,
          euSecuritizationTipEuId: initialData.euSecuritizationTipEuId ?? undefined,
          euSecuritizationStatus: initialData.euSecuritizationStatus ?? undefined,
          erisaStatus: initialData.erisaStatus ?? undefined,
          intexDealName: initialData.intexDealName ?? undefined,
          intexPassword: initialData.intexPassword ?? undefined,
          dealName: initialData.dealName ?? undefined,
        },
        step2: {
          securityDetails: initialData.securityDetails ?? {},
          esgFields: initialData.esgFields ?? {},
          tradeFields: initialData.tradeFields ?? {},
          speedOverrides: initialData.speedOverrides ?? {},
          notesInstructions: initialData.notesInstructions ?? undefined,
          attachments: initialData.attachments ?? []
        },
        updatedBy: currentUser
      });

      if (initialData.currentStep) {
        setCurrentStep(initialData.currentStep as WizardStep);

        const completedStepsList: WizardStep[] = [];
        if (['ssap-confirmation', 'review-details', 'confirm-details'].includes(initialData.currentStep)) {
          completedStepsList.push('enter-identifier');
        }
        if (['review-details', 'confirm-details'].includes(initialData.currentStep)) {
          const hadPassword = !!(initialData.ssapIdPassword?.trim?.() ?? '');
          if (hadPassword) {
            completedStepsList.push('ssap-confirmation');
          }
        }
        if (initialData.currentStep === 'confirm-details') {
          completedStepsList.push('review-details');
        }
        setCompletedSteps(completedStepsList);
      }
    }
  }, [initialData]);

  const {
    saveStatus,
    queueWizardSave,
    clearError,
    lastSavedAt,
    error: saveError,
    securitySetupRequestId,
  } = useSecuritySetupSave({
    onError: (error) => {
      console.error('Save failed:', error);
    },
    initialSecuritySetupRequestId: initialData?.securitySetupRequestId,
  });

  const handleStep1Change = useCallback((values: Partial<IEnterIdentifierFormValues>) => {
    if (saveStatus === 'error') {
      clearError();
    }

    setWizardData((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        ...values,
      },
      step2: {
        ...prev.step2,
        securityDetails: {
          euSecuritizationStatus: values.euSecuritizationStatus,
          erisaStatus: values.erisaStatus
        }
      }
    }));
  }, [clearError, saveStatus]);

  const handleStep2Change = useCallback((values: Partial<IReviewDetailsFormValues>) => {
    setWizardData((prev) => ({
      ...prev,
      step2: {
        ...prev.step2,
        ...values,
      },
    }));
  }, []);

  const saveErrorMessage = saveStatus === 'error' ? (saveError?.message || '') : '';

  const isInvalidMarketSector = !!saveErrorMessage.includes('Invalid Market Sector');
  const isInvalidIdentifier = !!saveErrorMessage.includes('Invalide Identifier');

  const selectFieldErrors: Partial<Record<string, string>> = isInvalidMarketSector
    ? { [ReferenceDataFieldKey.MarketSector]: saveErrorMessage }
    : isInvalidIdentifier
      ? { [ReferenceDataFieldKey.Identifier]: saveErrorMessage }
      : {};

  // Note: No debouncing needed since we're not using FormContainer
  // Each component manages its own state updates directly

  /**
   * Helper to get ALL accumulated wizard data in flat structure for API
   */
  const getAllWizardData = useCallback((): Record<string, unknown> => {
    return {
      // Step 1 data - all fields from enter identifier form
      ...wizardData.step1,
      // Step 2 data - spread nested objects to flat structure
      securityDetails: wizardData.step2.securityDetails,
      esgFields: wizardData.step2.esgFields,
      tradeFields: wizardData.step2.tradeFields,
      speedOverrides: wizardData.step2.speedOverrides,
      notesInstructions: wizardData.step2.notesInstructions,
      // Step 3 data (confirm details) - if exists
      ...(wizardData.step3 && {
        uploadedFile: wizardData.step3.uploadedFile,
        attachments: wizardData.step3.attachments,
        isConfirmed: true,
      }),
    };
  }, [wizardData]);

  const getAuditFields = useCallback(() => {
    if (securitySetupRequestId == null) {
      return { createdBy: currentUser, createdDate: new Date().toISOString() };
    }
    return { updatedBy: currentUser, updatedDate: new Date().toISOString() };
  }, [securitySetupRequestId, currentUser]);

  const handleFileUpload = useCallback(
    (file: File) => {
      setFileUploadError(null);
      setPendingUploadFile(file);
    }, []);

  const uploadPendingFile = useCallback(async (requestId: number): Promise<ISecuritySetupRequestAttachment[] | null> => {

    if (!pendingUploadFile) {
      return [];
    }

    setIsUploadingFile(true);
    setFileUploadError(null);
    try {
      const uploadedAttachments = await SecuritySetupService.uploadAttachment(
        requestId,
        currentUser || '',
        pendingUploadFile
      );
      setPendingUploadFile(null);
      return uploadedAttachments || [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload file.';
      setFileUploadError(msg);
      return null;
    } finally {
      setIsUploadingFile(false);
    }
  }, [pendingUploadFile, currentUser])

  // No form handlers needed since components manage their own state directly

  const markStepComplete = (step: WizardStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
  };

  const hasPasswordFlow = !!(wizardData.step1.ssapIdPassword?.trim?.() ?? '');

  const getNextStep = (current: WizardStep): WizardStep | null => {
    switch (current) {
      case 'enter-identifier':
        return hasPasswordFlow ? 'ssap-confirmation' : 'review-details';
      case 'ssap-confirmation':
        return 'review-details';
      case 'review-details':
        return 'confirm-details';
      case 'confirm-details':
        return null; // Final step
      default:
        return null;
    }
  };

  const getPreviousStep = (current: WizardStep): WizardStep | null => {
    const currentIndex = completedSteps.indexOf(current);

    if (currentIndex > 0) {
      return completedSteps[currentIndex - 1];
    }
    if (currentIndex === 0) {
      return null;
    }

    // Current step not in completed steps, return last completed step
    if (completedSteps.length > 0) {
      return completedSteps[completedSteps.length - 1];
    }

    return null;
  };

  function isValidString(str: string | null | undefined): boolean {
    // Returns false for null, undefined, and ""
    return !!str;
  }

  const canProceed = (): boolean => {
    if (isCancelled) {
      return currentStep !== 'confirm-details';
    }

    if (saveStatus === 'saving' || saveStatus === 'saved') {
      return false;
    }
    if (isReadOnly) {
      return true;
    }

    switch (currentStep) {
      case 'enter-identifier':        
        if (!isValidString(wizardData.step1.identifierValue) ||
          !isValidString(wizardData.step1.marketSector) ||
          !isValidString(wizardData.step1.euSecuritizationStatus) ||
          (wizardData.step1.euSecuritizationStatus != 'Not Required' &&
            !isValidString(wizardData.step1.euSecuritizationTipEuId)) ||
          !isValidString(wizardData.step1.erisaStatus) ||
          (wizardData.step1.newIssue?.toLowerCase() === 'yes' &&
            !isValidString(wizardData.step1.aladdinCDIId))
        ) {
          return false;
        }
        return true;
      case 'ssap-confirmation':
      case 'review-details':
      case 'confirm-details':
        return true;
      default:
        return false;
    }
  };

  // TODO: formValues being passed is a temp fix, need to remove when introducing app level state
  const handleNext = async (userInput?: UserInput | null) => {
    const nextStep = getNextStep(currentStep);

    if (!isReadOnly && !isCancelled) {
      markStepComplete(currentStep);
      clearError();

      // Save with the next step so resuming from ?id= lands on the correct step.
      const stepToSave = nextStep ?? currentStep;
      const stepNumberToSave = nextStep ? getCurrentStepNumber() + 1 : getCurrentStepNumber();

      let allData = getAllWizardData();

      if (userInput) {
        allData = {
          ...allData,
          ...getAuditFields(),
          isSsapReleasedByDm: userInput.isSsapReleasedByDm || false
        }
      }

      const savedData = await queueWizardSave(stepToSave, stepNumberToSave, allData, 'complete');

      if (!savedData) {
        // save failed - stay on current step to display error
        return
      }

      const requestId = savedData.securitySetupRequestId || securitySetupRequestId;
      const freshAttachments = requestId ? await uploadPendingFile(requestId) : [];

      // Merge server response into wizard state.
      setWizardData((prev) => {
        const { step1: mergedStep1, step2: mergedStep2 } = mergeWizardDataWithSaveResponse(prev, savedData);
        const resolvedAttachments = (freshAttachments && freshAttachments.length > 0)
          ? freshAttachments
          : mergedStep2.attachments ?? prev.step2.attachments ?? [];

        return {
          ...prev,
          step1: mergedStep1,
          step2: {
            ...mergedStep2,
            attachments: resolvedAttachments
          },
          ...(currentStep === 'review-details' && {
            ...mergedStep1,
            ssapIdPassword: mergedStep1.ssapIdPassword,
            ...mergedStep2,
            attachments: resolvedAttachments,
          })
        }
      });
    }

    if (isCancelled) {
      markStepComplete(currentStep);
      clearError();
    }

    if (nextStep) {
      setCurrentStep(nextStep);
      setIsReadOnly(false);
    } else if (currentStep === 'confirm-details' && !isCancelled) {
      // Final step - show confirmation modal
      setShowConfirmModal(true);
    }
  };

  // TODO : bypass stupid type-check problem, snowflake function for button - remove later
  const handleButtonNext = async () => {
    const nextStep = getNextStep(currentStep);

    if (!isReadOnly && !isCancelled) {
      markStepComplete(currentStep);
      clearError();

      // Save with the next step so resuming from ?id= lands on the correct step.
      const stepToSave = nextStep ?? currentStep;
      const stepNumberToSave = nextStep ? getCurrentStepNumber() + 1 : getCurrentStepNumber();

      const savedData = await queueWizardSave(stepToSave, stepNumberToSave, { ...getAllWizardData(), ...getAuditFields() }, 'complete');

      if (!savedData) {
        // save failed - stay on current step to display error
        return
      }

      const requestId = savedData.securitySetupRequestId || securitySetupRequestId;
      const freshAttachments = requestId ?
        await uploadPendingFile(requestId) : [];

      // Merge server response into wizard state.
      setWizardData((prev) => {
        const { step1: mergedStep1, step2: mergedStep2 } = mergeWizardDataWithSaveResponse(prev, savedData);
        const resolvedAttachments = (freshAttachments && freshAttachments.length > 0)
          ? freshAttachments
          : mergedStep2.attachments ?? prev.step2.attachments ?? [];

        return {
          ...prev,
          step1: mergedStep1,
          step2: {
            ...mergedStep2,
            attachments: resolvedAttachments
          },
          ...(currentStep === 'review-details' && {
            ...mergedStep1,
            attachments: resolvedAttachments,
            ssapIdPassword: mergedStep1.ssapIdPassword,
            ...mergedStep2
          })
        }
      });
    }

    if (isCancelled) {
      markStepComplete(currentStep);
      clearError();
    }

    if (nextStep) {
      setCurrentStep(nextStep);
      setIsReadOnly(false);
    } else if (currentStep === 'confirm-details' && !isCancelled) {
      // Final step - show confirmation modal
      setShowConfirmModal(true);
    }
  };

  const handleBack = () => {
    const prevStep = getPreviousStep(currentStep);
    if (prevStep) {
      setCurrentStep(prevStep);
      setIsReadOnly(true); // Enable read-only mode when going back
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleSave = async () => {
    // Clear any previous errors before attempting save
    clearError();

    // Save-only POST then redirect to dashboard.
    const savedData = await queueWizardSave(
      currentStep,
      getCurrentStepNumber(),
      {
        ...getAllWizardData(),
        ...getAuditFields()
      },
      'partial',
      {
        isSaveOnly: true
      }
    );

    if (savedData) {
      const requestId = savedData.securitySetupRequestId || securitySetupRequestId;
      if (requestId) {
        const uploadedAttachments = uploadPendingFile(requestId);

        if (!uploadedAttachments) {
          // let user see upload error
          return;
        }
      }
      navigate('/iod/tdm/');
    }
  };

  const handleClose = async () => {
    // Close button always routes to dashboard
    navigate('/iod/tdm/');
  };

  const handleConfirmSubmit = async () => {
    // Ensure final submit gets the correct data for PUT call
    const finalSavedData = await queueWizardSave(
      'confirm-details',
      4,
      {
        ...wizardData,
        ...getAuditFields(),
        isReviewed: true,
        reviewedBy: currentUser,
        reviewedDate: new Date().toISOString()
      },
      'complete'
    )
    setShowConfirmModal(false);

    if (onComplete) {
      if (finalSavedData) {
        const { step1, step2 } = mergeWizardDataWithSaveResponse(wizardData, finalSavedData);
        onComplete({
          ...finalSavedData,
          step1,
          step2,
          securitySetupRequestId,
        })
      } else {
        onComplete({ ...wizardData, securitySetupRequestId });
      }
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };


  const getCurrentStepNumber = (): number => {
    return getStepNumber(currentStep);
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      case 'enter-identifier':
        return 'Step 1 of 4: Enter Identifier';
      case 'ssap-confirmation':
        return 'Step 2 of 4: SSAP Login';
      case 'review-details':
        return 'Step 3 of 4: Security Request Template';
      case 'confirm-details':
        return 'Step 4 of 4: Review Security Data';
      default:
        return '';
    }
  };

  const renderSuccessMessages = () => {
    if (currentStep === 'review-details' || currentStep === 'ssap-confirmation') {
      const messages: { message: string }[] = [];

      if (wizardData.step1.newIssue) {
        messages.push({
          message: `New Issue: ${wizardData.step1.newIssue === 'yes' ? 'Yes' : 'No'}`,
        });
      }
      if (wizardData.step1.aladdinCDIId) {
        messages.push({
          message: `Aladdin CDI ID: ${wizardData.step1.aladdinCDIId}`,
        });
      }
      if (wizardData.step1.ssapIdPassword) {
        messages.push({
          message: `Private Deal SSAP ID/Password: ${wizardData.step1.ssapIdPassword}`,
        });
      }
      if (wizardData.step1.identifierType && wizardData.step1.identifierValue) {
        messages.push({
          message: `Identifier: ${wizardData.step1.identifierType} - ${wizardData.step1.identifierValue}`,
        });
      }
      if (wizardData.step1.marketSector) {
        messages.push({
          message: `Market Sector: ${wizardData.step1.marketSector}`,
        });
      }
      //      if (wizardData.step1.yellowKey) {
      //        messages.push({
      //          message: `Yellow Key: ${wizardData.step1.yellowKey}`,
      //        });
      //      }
      if (wizardData.step1.isEuSecuritizationRequired) {
        messages.push({
          message: `EU Security Verification Required: ${wizardData.step1.isEuSecuritizationRequired === true ? 'Yes' : 'No'}`,
        });
      }
      if (wizardData.step1.euSecuritizationTipEuId) {
        messages.push({
          message: `EU Securitization TIP EU ID: ${wizardData.step1.euSecuritizationTipEuId}`,
        });
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

    if (currentStep === 'confirm-details') {
      const messages: { message: string }[] = [];

      if (wizardData.step1.identifierValue) {
        messages.push({
          message: `Identifier: ${wizardData.step1.identifierType || 'FIGI'} ${wizardData.step1.identifierValue}`,
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
      case 'enter-identifier':
        return (
          <EnterIdentifierPage
            formValues={wizardData.step1}
            onFormChange={handleStep1Change}
            isReadOnly={isReadOnly || isCancelled}
            referenceData={referenceData}
            selectFieldErrors={selectFieldErrors}
            onFileUpload={handleFileUpload}
            selectedFileName={pendingUploadFile?.name || null}
            uploadedFileName={wizardData.step2.attachments?.[0]?.fileName || null}
            isUploadingFile={isUploadingFile}
            fileUploadError={fileUploadError}
          />
        );
      case 'ssap-confirmation':
        return (
          <SSAPApprovalPage
            formValues={wizardData.step1}
            onFormChange={handleStep1Change}
            onProceedToReview={handleNext}
            isReadOnly={isCancelled}
            isSaving={saveStatus === 'saving' || saveStatus === 'saved'}
            onBack={() => {
              setCurrentStep('enter-identifier');
            }}
          />
        );
      case 'review-details':
        return (
          <ReviewDetailsPage
            flowType={flowType}
            formValues={wizardData.step2}
            onFormChange={handleStep2Change}
            referenceData={referenceData}
            attachments={wizardData.step2.attachments ?? []}
            isReadOnly={isCancelled}
          />
        );
      case 'confirm-details':
        return (
          <ConfirmDetailsPage
            flowType={flowType}
            data={{
              ...wizardData.step1,
              ...wizardData.step2,
              uploadedFile: wizardData.step3?.uploadedFile,
              attachments: wizardData.step3?.attachments ?? wizardData.step2.attachments ?? []
            }}
            referenceData={referenceData}
          />
        );
      default:
        return null;
    }
  };

  const getButtonText = (): string => {
    if (currentStep === 'enter-identifier') return 'Next';
    if (currentStep === 'ssap-confirmation') return 'Approve SSAP';
    if (currentStep === 'review-details') return 'Review Request';
    if (currentStep === 'confirm-details') return 'Confirm Request';
    return 'Next';
  };

  const showBackButton = completedSteps.length > 0;
  const showNextButton = true; // Always show next button

  /**
   * Render save status indicator (optional UI feedback)
   */
  const renderSaveStatus = () => {
    return (
      <div className="save-status" style={{
        fontSize: '12px',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {saveStatus === 'saving' && <span>💾 Saving...</span>}
        {saveStatus === 'saved' && lastSavedAt && (
          <span style={{ color: '#4caf50' }}>
            ✓ Saved at {lastSavedAt.toLocaleTimeString()}
          </span>
        )}
        {saveStatus === 'error' && saveError && (
          <span style={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ⚠ Failed to save wizard data
          </span>
        )}
      </div>
    );
  };

  if (loadingReferenceData) {
    return (
      <div className="security-setup-wizard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (referenceDataError) {
    return (
      <div className="security-setup-wizard" style={{ padding: '40px' }}>
        <Alert severity="error">
          Failed to load dropdown options: {referenceDataError.message}
          <Button onClick={() => window.location.reload()} style={{ marginLeft: '16px' }}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="security-setup-wizard">
      <div className="wizard-header">
        <h1 className="wizard-title">Security Setup Wizard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          // Step 1 renders without success messages
          renderStepContent()
        )}
      </div>

      <div className="wizard-actions">
        {showBackButton && currentStep !== 'enter-identifier' && currentStep !== 'ssap-confirmation' && (
          <Button
            variant="outlined"
            className="back-button"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        )}
        {(currentStep === 'enter-identifier' || currentStep === 'review-details') && (
          <Button
            variant="outlined"
            className="save-button"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            disabled={isCancelled}
          >
            Save
          </Button>
        )}
        {showNextButton && currentStep !== 'ssap-confirmation' && (
          <Button
            variant="contained"
            className="next-button"
            onClick={handleButtonNext}
            disabled={!canProceed()}
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
    </div>
  );
};
