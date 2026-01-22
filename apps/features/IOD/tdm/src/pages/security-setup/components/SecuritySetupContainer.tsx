import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { debounce } from 'lodash';
import { FormContainer } from '../../../common/components/FormContainer';
import { HorizontalStepper } from './HorizontalStepper';
import { EnterIdentifierContainer } from './EnterIdentifierContainer';
import { ReviewDetailsPage } from './ReviewDetailsPage';
import { ConfirmDetailsPage } from './ConfirmDetailsPage';
import { SubmitConfirmationModal } from './SubmitConfirmationModal';
import {
  SecuritySetupStep,
  ISecuritySetupWizardData,
  IEnterIdentifierFormValues,
  IReviewDetailsFormValues,
  SecuritySetupFlowType,
} from '../lib/types';
import '../lib/styles.scss';

interface SecuritySetupContainerProps {
  flowType: SecuritySetupFlowType;
  onComplete?: (data: ISecuritySetupWizardData) => void;
  onCancel?: () => void;
}

export const SecuritySetupContainer: React.FC<SecuritySetupContainerProps> = ({
  flowType,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<SecuritySetupStep>('enter-identifier');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [wizardData, setWizardData] = useState<ISecuritySetupWizardData>({
    step1: {},
    step2: {
      securityDetails: {},
      esgFields: {},
      tradeFields: {},
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

  const handleNext = () => {
    switch (currentStep) {
      case 'enter-identifier':
        setCurrentStep('review-details');
        break;
      case 'review-details':
        // Prepare confirm data
        setWizardData((prev) => ({
          ...prev,
          step3: {
            uploadedFile: 'file.file_extension',
            ...prev.step2,
          },
        }));
        setCurrentStep('confirm-details');
        break;
      case 'confirm-details':
        setShowConfirmModal(true);
        break;
    }
  };

  const handleConfirmDetailsSubmit = () => {
    // Console log all form field values
    console.log('All Form Values:', JSON.stringify(wizardData, null, 2));

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);

    // Final submission
    if (onComplete) {
      onComplete(wizardData);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'review-details':
        setCurrentStep('enter-identifier');
        break;
      case 'confirm-details':
        setCurrentStep('review-details');
        break;
      case 'enter-identifier':
        if (onCancel) {
          onCancel();
        }
        break;
    }
  };

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

  const handleFormChange = useCallback((formState: { values: IEnterIdentifierFormValues | IReviewDetailsFormValues }) => {
    if (currentStep === 'enter-identifier') {
      debouncedHandleStep1Change(formState.values as IEnterIdentifierFormValues);
    } else if (currentStep === 'review-details') {
      debouncedHandleStep2Change(formState.values as IReviewDetailsFormValues);
    }
  }, [currentStep, debouncedHandleStep1Change, debouncedHandleStep2Change]);

  const handleFormSubmit = async () => {
    // Form submission is handled by the Next button
    return Promise.resolve();
  };

  useEffect(() => {
    return () => {
      debouncedHandleStep1Change.cancel();
      debouncedHandleStep2Change.cancel();
    };
  }, [debouncedHandleStep1Change, debouncedHandleStep2Change]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'enter-identifier':
        return (
          <EnterIdentifierContainer
            flowType={flowType}
            formValues={wizardData.step1}
            onFormChange={handleStep1Change}
            onContinue={handleNext}
          />
        );
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
            data={wizardData.step3 || {
              uploadedFile: '',
              ...wizardData.step2,
            }}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'enter-identifier':
        return 'Step 1 of 3: Enter Identifier';
      case 'review-details':
        return 'Step 2 of 3: Security Request Template';
      case 'confirm-details':
        return 'Step 3 of 3: Review Security Data';
      default:
        return '';
    }
  };

  const formInitialValues = useMemo(() => {
    return currentStep === 'enter-identifier'
      ? wizardData.step1
      : wizardData.step2;
  }, [currentStep, wizardData.step1, wizardData.step2]);

  return (
    <div className="security-setup-wizard">
      <div className="wizard-header">
        <h1 className="wizard-title">Security Setup Wizard</h1>
        <IconButton
          className="wizard-close-button"
          onClick={onCancel}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </div>

      <HorizontalStepper currentStep={currentStep} stepTitle={getStepTitle()} />

      <div className="wizard-content">
        {currentStep === 'confirm-details' ? (
          renderStepContent()
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
            {renderStepContent()}
          </FormContainer>
        )}
      </div>

      {(currentStep === 'review-details' || currentStep === 'confirm-details') && (
        <div className="wizard-actions">
          <Button
            variant="outlined"
            className="back-button"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          <Button
            variant="contained"
            className="next-button"
            onClick={currentStep === 'review-details' ? handleNext : handleConfirmDetailsSubmit}
            endIcon={currentStep === 'confirm-details' ? <CheckIcon /> : undefined}
          >
            {currentStep === 'review-details' ? 'Review Request' : 'Confirm Request'}
          </Button>
        </div>
      )}

      <SubmitConfirmationModal
        open={showConfirmModal}
        onClose={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
};
