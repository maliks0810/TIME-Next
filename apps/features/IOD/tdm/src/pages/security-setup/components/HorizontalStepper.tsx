import React from 'react';
import { SecuritySetupStep } from '../lib/types';

interface StepperProps {
  currentStep: SecuritySetupStep;
  stepTitle: string;
}

const steps: Array<{
  id: SecuritySetupStep;
  stepNumber: number;
}> = [
    { id: 'enter-identifier', stepNumber: 1 },
    { id: 'review-details', stepNumber: 2 },
    { id: 'confirm-details', stepNumber: 3 },
  ];

export const HorizontalStepper: React.FC<StepperProps> = ({ currentStep, stepTitle }) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="progress-stepper">
      <div className="progress-stepper-header">
        <span className="progress-stepper-title">{stepTitle}</span>
      </div>
      <div className="progress-segments-container">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-segment ${index <= currentStepIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};
