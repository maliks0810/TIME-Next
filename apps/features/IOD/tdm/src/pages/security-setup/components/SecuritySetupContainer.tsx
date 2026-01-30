import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { debounce } from 'lodash';
import { FormContainer } from '../../../common/components/FormContainer';
import { HorizontalStepper } from './HorizontalStepper';
import { NewIssuePage } from './NewIssuePage';
import { UploadCDIPage } from './UploadCDIPage';
import { PrivateDealPage } from './PrivateDealPage';
import { SSAPPasswordPage } from './SSAPPasswordPage';
import { SAPILoginPage } from './SAPILoginPage';
import { SSAPConfirmationPage } from './SSAPConfirmationPage';
import { BloombergIdentifierPage } from './BloombergIdentifierPage';
import { ReviewDetailsPage } from './ReviewDetailsPage';
import { ConfirmDetailsPage } from './ConfirmDetailsPage';
import { SubmitConfirmationModal } from './SubmitConfirmationModal';
import {
  SecuritySetupFlowType,
  ISecuritySetupWizardData,
  IEnterIdentifierFormValues,
  IReviewDetailsFormValues,
  EnterIdentifierStep,
} from '../lib/types';
import '../lib/styles.scss';
import { useSecuritySetupSave } from '../hooks/useSecuritySetupSave';

interface SecuritySetupContainerProps {
  flowType: SecuritySetupFlowType;
  onComplete?: (data: ISecuritySetupWizardData) => void;
  onCancel?: () => void;
}

// Unified step type combining all steps
type WizardStep = EnterIdentifierStep | 'review-details' | 'confirm-details';

export const SecuritySetupContainer: React.FC<SecuritySetupContainerProps> = ({
  flowType,
  onComplete,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('new-issue');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [wizardData, setWizardData] = useState<ISecuritySetupWizardData>({
    step1: {},
    step2: {
      securityDetails: {},
      esgFields: {},
      tradeFields: {},
    },
  });

  const {
    saveStatus,
    queueWizardSave,
    forceSave,
    clearError,
    lastSavedAt,
    error: saveError
  } = useSecuritySetupSave({
    onError: (error) => {
      console.error('Save failed:', error);
    },
    onSaved: () => {
      console.log('Wizard data saved successfully');
    },
  });

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

  const debouncedHandleStep1Change = useMemo(
    () =>
      debounce((values: IEnterIdentifierFormValues) => {
        handleStep1Change(values);
      }, 100),
    [handleStep1Change]
  );

  const debouncedHandleStep2Change = useMemo(
    () =>
      debounce((values: IReviewDetailsFormValues) => {
        handleStep2Change(values);
      }, 100),
    [handleStep2Change]
  );

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

  const handleFormChange = useCallback(
    (formState: { values: IEnterIdentifierFormValues | IReviewDetailsFormValues }) => {
      if (currentStep === 'review-details') {
        debouncedHandleStep2Change(formState.values as IReviewDetailsFormValues);
      }

      if (currentStep !== 'confirm-details' && currentStep !== 'ssap-confirmation') {
        debouncedHandleStep1Change(formState.values as IEnterIdentifierFormValues);
      }
    },
    [
      currentStep,
      debouncedHandleStep1Change,
      debouncedHandleStep2Change,
    ]
  );

  const handleFormSubmit = async (
    values: IEnterIdentifierFormValues | IReviewDetailsFormValues
  ) => {
    console.log('submitted values', values)
    return Promise.resolve();
  };

  // Cleanup debounced handlers on unmount
  useEffect(() => {
    return () => {
      debouncedHandleStep1Change.cancel();
      debouncedHandleStep2Change.cancel();
    };
  }, [debouncedHandleStep1Change, debouncedHandleStep2Change]);

  const markStepComplete = (step: WizardStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
  };

  const getNextStep = (current: WizardStep): WizardStep | null => {
    switch (current) {
      case 'new-issue':
        return wizardData.step1.newIssue === 'no' ? 'bloomberg-identifier' : 'upload-cdi';
      case 'upload-cdi':
        return 'private-deal';
      case 'private-deal':
        return wizardData.step1.privateDeal === 'no' ? 'bloomberg-identifier' : 'ssap-password';
      case 'ssap-password':
        return 'sapi-login';
      case 'sapi-login':
        return 'ssap-confirmation';
      case 'ssap-confirmation':
        // This step doesn't have a "next" - user should be routed to dashboard
        return null;
      case 'bloomberg-identifier':
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
      case 'new-issue':
        return !!wizardData.step1.newIssue;
      case 'upload-cdi':
        return !!wizardData.step1.cdiFileUploadedToAnser && !!wizardData.step1.aladdinCDIId;
      case 'private-deal':
        return !!wizardData.step1.privateDeal;
      case 'ssap-password':
        return !!wizardData.step1.ssapIdPassword;
      case 'sapi-login':
        return !!wizardData.step1.ssapApproved;
      case 'ssap-confirmation':
        return false; // No next button on confirmation page
      case 'bloomberg-identifier':
        return !!wizardData.step1.identifierValue && !!wizardData.step1.marketSector;
      case 'review-details':
      case 'confirm-details':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isReadOnly) {
      markStepComplete(currentStep);
      clearError();

      queueWizardSave(
        currentStep,
        getCurrentStepNumber(),
        getAllWizardData(),
        'complete'
      );
    }

    const nextStep = getNextStep(currentStep);

    if (nextStep) {
      if (currentStep === 'bloomberg-identifier' && nextStep === 'review-details') {
        // pre-populate step 2 with data from step 1 when moving to review details
        setWizardData((prev) => ({
          ...prev,
          step2: {
            ...prev.step2,
            securityDetails: {
              ...prev.step2.securityDetails,
              aladdinCDIId: prev.step1.aladdinCDIId || '',
              identifier: prev.step1.identifierValue || ''
            }
          }
        }))
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

  const handleSkip = () => {
    // Skip to Bloomberg Identifier (Step 4)
    setCurrentStep('bloomberg-identifier');
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

  const handleClose = async () => {
    await forceSave();
    navigate('/iod/tdm/');
  };

  const handleConfirmSubmit = async () => {
    await forceSave();
    setShowConfirmModal(false);
    if (onComplete) {
      onComplete(wizardData);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const getCurrentStepNumber = (): number => {
    switch (currentStep) {
      case 'new-issue':
        return 1;
      case 'upload-cdi':
        return 2;
      case 'private-deal':
      case 'ssap-password':
      case 'sapi-login':
      case 'ssap-confirmation':
        return 3; // All private deal related steps are part of Step 3
      case 'bloomberg-identifier':
        return 4;
      case 'review-details':
        return 5;
      case 'confirm-details':
        return 6;
      default:
        return 1;
    }
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      case 'new-issue':
        return 'Step 1 of 6: New Issue';
      case 'upload-cdi':
        return 'Step 2 of 6: New Issue CDI Anser Upload';
      case 'private-deal':
      case 'ssap-password':
      case 'sapi-login':
      case 'ssap-confirmation':
        return 'Step 3 of 6: Private Deal';
      case 'bloomberg-identifier':
        return 'Step 4 of 6: Trader Details';
      case 'review-details':
        return 'Step 5 of 6: Security Request Template';
      case 'confirm-details':
        return 'Step 6 of 6: Review Security Data';
      default:
        return '';
    }
  };

  const renderSuccessMessages = () => {
    const messages: { step: WizardStep; message: string; isPending?: boolean }[] = [];

    if (completedSteps.includes('new-issue')) {
      messages.push({
        step: 'new-issue',
        message: `New Issue: ${wizardData.step1.newIssue === 'yes' ? 'Yes' : 'No'}`,
      });
    }
    if (completedSteps.includes('upload-cdi')) {
      messages.push({
        step: 'upload-cdi',
        message: `CDI File Uploaded & Aladdin CDI ID entered (${wizardData.step1.aladdinCDIId})`,
      });
    }
    if (completedSteps.includes('private-deal')) {
      messages.push({
        step: 'private-deal',
        message: `Private Deal: ${wizardData.step1.privateDeal === 'yes' ? 'Yes' : 'No'}`,
      });
    }
    if (completedSteps.includes('ssap-password')) {
      messages.push({
        step: 'ssap-password',
        message: `SSAP ID/Password: ${wizardData.step1.ssapIdPassword || ''}`,
      });
    }
    if (currentStep === 'sapi-login' && !wizardData.step1.ssapApproved) {
      messages.push({
        step: 'sapi-login',
        message: 'Pending DM SSAP Review',
        isPending: true,
      });
    }
    if (completedSteps.includes('sapi-login')) {
      messages.push({
        step: 'sapi-login',
        message: 'SAPI login confirmed',
      });
    }

    if (messages.length === 0) return null;

    return (
      <div className="substep-success-messages">
        {messages.map((msg, index) => (
          <div key={index} className="substep-success-item">
            <CheckCircleIcon
              className={`substep-success-icon ${msg.isPending ? 'pending' : ''}`}
            />
            <span className={msg.isPending ? 'pending' : ''}>{msg.message}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    const commonProps = {
      formValues: wizardData.step1,
      onFormChange: handleStep1Change,
      isReadOnly,
    };

    switch (currentStep) {
      case 'new-issue':
        return <NewIssuePage {...commonProps} />;
      case 'upload-cdi':
        return <UploadCDIPage {...commonProps} />;
      case 'private-deal':
        return <PrivateDealPage {...commonProps} />;
      case 'ssap-password':
        return <SSAPPasswordPage {...commonProps} />;
      case 'sapi-login':
        return <SAPILoginPage {...commonProps} isReadOnly={isReadOnly} />;
      case 'ssap-confirmation':
        return <SSAPConfirmationPage {...commonProps} onSkipToBloomberg={handleSkip} />;
      case 'bloomberg-identifier':
        return <BloombergIdentifierPage {...commonProps} />;
      case 'review-details':
        return (
          <ReviewDetailsPage
            flowType={flowType}
            formValues={wizardData.step2}
            onFormChange={handleStep2Change}
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
          />
        );
      default:
        return null;
    }
  };

  const getButtonText = (): string => {
    if (currentStep === 'bloomberg-identifier') return 'Continue to Request Form';
    if (currentStep === 'review-details') return 'Review Request';
    if (currentStep === 'confirm-details') return 'Confirm Request';
    return 'Next';
  };

  const formInitialValues = useMemo(() => {
    return currentStep === 'review-details' ? wizardData.step2 : wizardData.step1;
  }, [currentStep, wizardData.step1, wizardData.step2]);

  const showBackButton = completedSteps.length > 0 && currentStep !== 'ssap-confirmation';
  const showNextButton = currentStep !== 'ssap-confirmation';

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

  return (
    <div className="security-setup-wizard">
      <div className="wizard-header">
        <h1 className="wizard-title">Security Setup Wizard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {renderSaveStatus()}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconButton className="wizard-close-button" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <span style={{ fontSize: '14px', cursor: 'pointer' }} onClick={handleClose}>Cancel</span>
          </div>
        </div>
      </div>

      <HorizontalStepper
        currentStepNumber={getCurrentStepNumber()}
        totalSteps={6}
        stepTitle={getStepTitle()}
      />

      <div className="wizard-content">
        {currentStep === 'confirm-details' || currentStep === 'ssap-confirmation' ? (
          <>
            {renderSuccessMessages()}
            {renderStepContent()}
          </>
        ) : (
          <FormContainer
            key={currentStep}
            initialValues={formInitialValues}
            onSubmit={handleFormSubmit}
            onChange={handleFormChange}
            formProps={{
              subscription: { values: true },
            }}
            containerOnly
          >
            {renderSuccessMessages()}
            {renderStepContent()}
          </FormContainer>
        )}
      </div>

      <div className="wizard-actions">
        {showBackButton && (
          <Button
            variant="outlined"
            className="back-button"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        )}
        {showNextButton && (
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
