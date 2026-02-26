import React, { useState, useCallback, useEffect } from 'react';
import { Button, IconButton, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import { HorizontalStepper } from './HorizontalStepper';
import { EnterIdentifierPage } from './EnterIdentifierPage';
import { ReviewDetailsPage } from './ReviewDetailsPage';
import { ConfirmDetailsPage } from './ConfirmDetailsPage';
import { SubmitConfirmationModal } from './SubmitConfirmationModal';
import {
  SecuritySetupFlowType,
  ISecuritySetupWizardData,
  IEnterIdentifierFormValues,
  IReviewDetailsFormValues,
} from '../lib/types/securitySetupTypes';
import '../lib/styles.scss';
import { useSecuritySetupSave } from '../hooks/useSecuritySetupSave';
import { ISecuritySetupWizardPayload } from '../../../services/domain-objects/SecuritySetupRequestPayload';
import { useReferenceData } from '../hooks/useReferenceData';
import { SSAPApprovalPage } from './SSAPApprovalPage';

interface SecuritySetupContainerProps {
  flowType: SecuritySetupFlowType;
  onComplete?: (data: ISecuritySetupWizardData) => void;
  onCancel?: () => void;
  initialData?: Partial<ISecuritySetupWizardPayload> | null;
  onSecuritySetupIdReady?: (id: number) => void;
}

type WizardStep = 'enter-identifier' | 'ssap-confirmation' | 'review-details' | 'confirm-details';

export const SecuritySetupContainer: React.FC<SecuritySetupContainerProps> = ({
  flowType,
  onComplete,
  onCancel,
  initialData,
  onSecuritySetupIdReady
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('enter-identifier');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const { data: referenceData, loading: loadingReferenceData, error: referenceDataError } = useReferenceData();

  const [wizardData, setWizardData] = useState<ISecuritySetupWizardData>({
    step1: {},
    step2: {
      securityDetails: {},
      esgFields: {},
      tradeFields: {},
    },
  });

  useEffect(() => {
    if (initialData) {
      setWizardData({
        step1: {
          newIssue: initialData.newIssue ?? undefined,
          cdiFileUploadedToAnser: initialData.cdiFileUploadedToAnser ?? undefined,
          aladdinCDIId: initialData.aladdinCDIId ?? undefined,
          privateDeal: initialData.privateDeal ?? undefined,
          ssapIdPassword: initialData.ssapIdPassword ?? undefined,
          ssapApproved: initialData.ssapApproved ?? undefined,
          identifierType: initialData.identifierType ?? undefined,
          identifierValue: initialData.identifierValue ?? undefined,
          marketSector: initialData.marketSector ?? undefined,
          yellowKey: initialData.yellowKey ?? undefined,
          euSecurityVerificationRequired: initialData.euSecurityVerificationRequired ?? undefined,
          euSecuritizationTipEuId: initialData.euSecuritizationTipEuId ?? undefined,
        },
        step2: {
          securityDetails: initialData.securityDetails ?? {},
          esgFields: initialData.esgFields ?? {},
          tradeFields: initialData.tradeFields ?? {},
          notesInstructions: initialData.notesInstructions ?? undefined
        },
      })

      if (initialData.currentStep) {
        setCurrentStep(initialData.currentStep);

        const completedStepsList: WizardStep[] = [];
        if (['ssap-confirmation', 'review-details', 'confirm-details'].includes(initialData.currentStep)) {
          completedStepsList.push('enter-identifier')
        }

        if (['review-details', 'confirm-details'].includes(initialData.currentStep)) {
          const hadPassword = !!(initialData.ssapIdPassword?.trim?.() ?? '');

          if (hadPassword) {
            completedStepsList.push('ssap-confirmation')
          }
        }

        if (initialData.currentStep === 'confirm-details') {
          completedStepsList.push('review-details')
        }

        setCompletedSteps(completedStepsList);
      }
    }
  }, [initialData])

  // Initialize save hook (no session management needed)
  const {
    saveStatus,
    queueWizardSave,
    forceSave,
    clearError,
    lastSavedAt,
    error: saveError,
    securitySetupRequestId
  } = useSecuritySetupSave({
    onError: (error) => {
      console.error('Save failed:', error);
    },
    onSaved: () => {
      console.log('Wizard data saved successfully');
    },
    initialSecuritySetupRequestId: initialData?.securitySetupRequestId
  });

  // TODO: temp fix - remove when figuring out how to use PUT response
  useEffect(() => {
    if (securitySetupRequestId && onSecuritySetupIdReady) {
      onSecuritySetupIdReady(securitySetupRequestId)
    }
  }, [securitySetupRequestId, onSecuritySetupIdReady])


  const handleStep1Change = useCallback((values: Partial<IEnterIdentifierFormValues>) => {
    setWizardData((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        ...values,
      },
    }));
  }, []);

  const handleStep2Change = useCallback((values: Partial<IReviewDetailsFormValues>) => {
    setWizardData((prev) => ({
      ...prev,
      step2: {
        ...prev.step2,
        ...values,
      },
    }));
  }, []);

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
      notesInstructions: wizardData.step2.notesInstructions,
      // Step 3 data (confirm details) - if exists
      ...(wizardData.step3 && {
        uploadedFile: wizardData.step3.uploadedFile,
        isConfirmed: true,
      }),
    };
  }, [wizardData]);

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

  const canProceed = (): boolean => {
    if (isReadOnly) return true;

    switch (currentStep) {
      case 'enter-identifier':
        return !!wizardData.step1.identifierValue && !!wizardData.step1.marketSector;
      case 'ssap-confirmation':
      case 'review-details':
      case 'confirm-details':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextStep = getNextStep(currentStep);
    if (!isReadOnly) {
      markStepComplete(currentStep);
      clearError();

      // we need to navigate the user to where they left off, so the step after the one they completed.
      const stepToSave = nextStep ?? currentStep;
      const stepNumberToSave = nextStep ? getCurrentStepNumber() + 1 : getCurrentStepNumber();
      queueWizardSave(stepToSave, stepNumberToSave, getAllWizardData(), 'complete');
    }


    if (nextStep) {
      if (nextStep === 'review-details') {
        // Pre-populate step2 with data from step1 when moving to review-details
        setWizardData((prev) => ({
          ...prev,
          step2: {
            ...prev.step2,
            securityDetails: {
              ...prev.step2.securityDetails,
              aladdinCDIId: prev.step1.aladdinCDIId || '',
              identifier: prev.step1.identifierValue || '',
            },
          },
        }));
      }
      if (currentStep === 'review-details') {
        // Prepare confirm data before moving to confirm-details
        setWizardData((prev) => ({
          ...prev,
          step3: {
            uploadedFile: 'file.file_extension',
            ssapIdPassword: prev.step1.ssapIdPassword,
            ...prev.step2,
          },
        }));
      }
      setCurrentStep(nextStep);
      setIsReadOnly(false);
    } else if (currentStep === 'confirm-details') {
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

    // Queue save with current data (partial save, not step completion)
    queueWizardSave(
      currentStep,
      getCurrentStepNumber(),
      getAllWizardData(),
      'partial'
    );
  };

  const handleClose = async () => {
    // Force save before closing (bypass debounce)
    await forceSave();
    // Close button always routes to dashboard
    navigate('/iod/tdm/');
  };

  const handleConfirmSubmit = async () => {
    // Force final save before completing wizard
    await forceSave();
    setShowConfirmModal(false);
    if (onComplete) {
      onComplete({ ...wizardData, securitySetupRequestId });
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const getCurrentStepNumber = (): number => {
    switch (currentStep) {
      case 'enter-identifier':
        return 1;
      case 'ssap-confirmation':
        return 2;
      case 'review-details':
        return 3;
      case 'confirm-details':
        return 4;
      default:
        return 1;
    }
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      case 'enter-identifier':
        return 'Step 1 of 4: Enter Identifier';
      case 'ssap-confirmation':
        return 'Step 2 of 4: SSAP Login'
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
      if (wizardData.step1.privateDeal) {
        messages.push({
          message: `Private Deal: ${wizardData.step1.privateDeal === 'yes' ? 'Yes' : 'No'}`,
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
      if (wizardData.step1.yellowKey) {
        messages.push({
          message: `Yellow Key: ${wizardData.step1.yellowKey}`,
        });
      }
      if (wizardData.step1.euSecurityVerificationRequired) {
        messages.push({
          message: `EU Security Verification Required: ${wizardData.step1.euSecurityVerificationRequired === 'yes' ? 'Yes' : 'No'}`,
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
      if (wizardData.step1.privateDeal) {
        messages.push({
          message: `Private Deal: ${wizardData.step1.privateDeal === 'yes' ? 'Yes' : 'No'}`,
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
            isReadOnly={isReadOnly}
            referenceData={referenceData}
          />
        );
      case 'ssap-confirmation':
        return (
          <SSAPApprovalPage
            formValues={wizardData.step1}
            onFormChange={handleStep1Change}
            onProceedToReview={handleNext}
          />
        )
      case 'review-details':
        return (
          <ReviewDetailsPage
            flowType={flowType}
            formValues={wizardData.step2}
            onFormChange={handleStep2Change}
            referenceData={referenceData}
          />
        );
      case 'confirm-details':
        return (
          <ConfirmDetailsPage
            flowType={flowType}
            data={
              wizardData.step3 || {
                uploadedFile: '',
                ...wizardData.step2,
              }
            }
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
            ⚠ {saveError.message}
          </span>
        )}
      </div>
    );
  };

  if (loadingReferenceData) {
    return (
      <div>
        <CircularProgress />
      </div>
    )
  }


  if (referenceDataError) {
    return (
      <div>
        <Alert severity='error'>
          Failed to load dropdown options: {referenceDataError.message}
        </Alert>
      </div>
    )
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
        {currentStep === 'enter-identifier' && (
          <Button
            variant="outlined"
            className="save-button"
            onClick={handleSave}
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        )}
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
        {showNextButton && currentStep !== 'ssap-confirmation' && (
          <Button
            variant="contained"
            className="next-button"
            onClick={handleNext}
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
