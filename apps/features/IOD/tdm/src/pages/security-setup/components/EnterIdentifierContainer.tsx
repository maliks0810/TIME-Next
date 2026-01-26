import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  SecuritySetupFlowType,
  IEnterIdentifierFormValues,
  EnterIdentifierSubStep
} from '../lib/types';
import { NewIssuePage } from './NewIssuePage';
import { UploadCDIPage } from './UploadCDIPage';
import { PrivateDealPage } from './PrivateDealPage';
import { SSAPPasswordPage } from './SSAPPasswordPage';
import { SAPILoginPage } from './SAPILoginPage';
import { BloombergIdentifierPage } from './BloombergIdentifierPage';

interface EnterIdentifierContainerProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  onContinue: () => void;
  flowType?: SecuritySetupFlowType;
}

export const EnterIdentifierContainer: React.FC<EnterIdentifierContainerProps> = ({
  formValues,
  onFormChange,
  onContinue,
}) => {
  const [currentSubStep, setCurrentSubStep] = useState<EnterIdentifierSubStep>(
    formValues.currentSubStep || 'new-issue'
  );
  const [completedSubSteps, setCompletedSubSteps] = useState<EnterIdentifierSubStep[]>(
    formValues.completedSubSteps || []
  );
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Sync state with form values
  useEffect(() => {
    onFormChange({
      currentSubStep,
      completedSubSteps,
    });
  }, [currentSubStep, completedSubSteps]);

  const markSubStepComplete = (subStep: EnterIdentifierSubStep) => {
    if (!completedSubSteps.includes(subStep)) {
      setCompletedSubSteps([...completedSubSteps, subStep]);
    }
  };

  const getNextSubStep = (current: EnterIdentifierSubStep): EnterIdentifierSubStep | null => {
    switch (current) {
      case 'new-issue':
        return formValues.newIssue === 'no' ? 'bloomberg-identifier' : 'upload-cdi';
      case 'upload-cdi':
        return 'private-deal';
      case 'private-deal':
        return formValues.privateDeal === 'no' ? 'bloomberg-identifier' : 'ssap-password';
      case 'ssap-password':
        return 'sapi-login';
      case 'sapi-login':
        return 'bloomberg-identifier';
      case 'bloomberg-identifier':
        return null; // Final sub-step
      default:
        return null;
    }
  };

  const getPreviousSubStep = (): EnterIdentifierSubStep | null => {
    if (completedSubSteps.length > 0) {
      return completedSubSteps[completedSubSteps.length - 1];
    }
    return null;
  };

  const handleNext = () => {
    markSubStepComplete(currentSubStep);
    const nextSubStep = getNextSubStep(currentSubStep);

    if (nextSubStep) {
      setCurrentSubStep(nextSubStep);
      setIsReviewMode(false);
    } else {
      // All sub-steps completed, proceed to main Step 2
      onContinue();
    }
  };

  const handleBack = () => {
    const prevSubStep = getPreviousSubStep();
    if (prevSubStep) {
      setCurrentSubStep(prevSubStep);
      setIsReviewMode(true); // Enable read-only mode
    }
  };

  const isSubStepComplete = (subStep: EnterIdentifierSubStep): boolean => {
    return completedSubSteps.includes(subStep);
  };

  const canProceed = (): boolean => {
    if (isReviewMode) return true;

    switch (currentSubStep) {
      case 'new-issue':
        return !!formValues.newIssue;
      case 'upload-cdi':
        return !!formValues.cdiFileUploadedToAnser && !!formValues.aladdinCDIId;
      case 'private-deal':
        return !!formValues.privateDeal;
      case 'ssap-password':
        return !!formValues.ssapIdPassword;
      case 'sapi-login':
        return true; // Instruction step, always can proceed
      case 'bloomberg-identifier':
        return !!formValues.identifierValue && !!formValues.marketSector;
      default:
        return false;
    }
  };

  const getSubStepTitle = (): string => {
    switch (currentSubStep) {
      case 'new-issue':
        return 'Is this a New Issue?';
      case 'upload-cdi':
        return 'Upload CDI File & Enter Aladdin CDI ID';
      case 'private-deal':
        return 'Is this a Private Deal?';
      case 'ssap-password':
        return 'Enter SSAP ID/Password';
      case 'sapi-login':
        return 'DM Log into SAPI';
      case 'bloomberg-identifier':
        return 'Enter Bloomberg Identifier';
      default:
        return '';
    }
  };

  const renderCompletedMessages = () => {
    const messages: { subStep: EnterIdentifierSubStep; message: string }[] = [];

    if (isSubStepComplete('new-issue')) {
      messages.push({
        subStep: 'new-issue',
        message: `New Issue: ${formValues.newIssue === 'yes' ? 'Yes' : 'No'}`,
      });
    }
    if (isSubStepComplete('upload-cdi')) {
      messages.push({
        subStep: 'upload-cdi',
        message: `CDI File Uploaded & Aladdin CDI ID entered (${formValues.aladdinCDIId})`,
      });
    }
    if (isSubStepComplete('private-deal')) {
      messages.push({
        subStep: 'private-deal',
        message: `Private Deal: ${formValues.privateDeal === 'yes' ? 'Yes' : 'No'}`,
      });
    }
    if (isSubStepComplete('ssap-password')) {
      messages.push({
        subStep: 'ssap-password',
        message: 'SSAP ID/Password entered',
      });
    }
    if (isSubStepComplete('sapi-login')) {
      messages.push({
        subStep: 'sapi-login',
        message: 'SAPI login confirmed',
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
  };

  const renderSubStepContent = () => {
    const commonProps = {
      formValues,
      onFormChange,
      isReadOnly: isReviewMode,
    };

    switch (currentSubStep) {
      case 'new-issue':
        return <NewIssuePage {...commonProps} />;
      case 'upload-cdi':
        return <UploadCDIPage {...commonProps} />;
      case 'private-deal':
        return <PrivateDealPage {...commonProps} />;
      case 'ssap-password':
        return <SSAPPasswordPage {...commonProps} />;
      case 'sapi-login':
        return <SAPILoginPage {...commonProps} />;
      case 'bloomberg-identifier':
        return <BloombergIdentifierPage {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="enter-identifier-page">
      <div className="substep-header">
        <h2 className="substep-title">{getSubStepTitle()}</h2>
      </div>

      {renderCompletedMessages()}

      {renderSubStepContent()}

      <div className="substep-actions">
        {completedSubSteps.length > 0 && (
          <Button
            variant="outlined"
            className="substep-back-button"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        )}
        <Button
          variant="contained"
          className="substep-next-button"
          onClick={handleNext}
          disabled={!canProceed()}
          endIcon={<ArrowForwardIcon />}
        >
          {currentSubStep === 'bloomberg-identifier' ? 'Continue to Request Form' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
