import React from 'react';

interface StepperProps {
  currentStepNumber: number; // 1-4
  totalSteps: number; // 4
  stepTitle: string;
}

export const HorizontalStepper: React.FC<StepperProps> = ({
  currentStepNumber,
  totalSteps,
  stepTitle
}) => {
  return (
    <div className="progress-stepper">
      <div className="progress-stepper-header">
        <span className="progress-stepper-title">{stepTitle}</span>
      </div>
      <div className="progress-segments-container">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`progress-segment ${index < currentStepNumber ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};
