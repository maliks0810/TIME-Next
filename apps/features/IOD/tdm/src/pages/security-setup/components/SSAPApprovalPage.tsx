import React from 'react';
import { Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { IEnterIdentifierFormValues } from '../lib/types/securitySetupTypes';

export type UserInput = { isSsapReleasedByDm: boolean }

interface SSAPApprovalPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  onProceedToReview: (userInput?: UserInput) => void;
  onBack: () => void;
  isSaving?: boolean;
}

export const SSAPApprovalPage: React.FC<SSAPApprovalPageProps> = ({
  onFormChange,
  onProceedToReview,
  onBack,
  isSaving
}) => {
  const handleRequestRelease = () => {
    onFormChange({ isSsapReleasedByDm: true });
    onProceedToReview({ isSsapReleasedByDm: true });
  };

  return (
    <div className="substep-content">
      <div className="ssap-approval-container">
        <div className="ssap-approval-content">
          <p className="ssap-approval-instruction">
            Please confirm that the SSAP Security has been released.
          </p>
          <div className="ssap-approval-actions">
            <Button
              variant="contained"
              className="button"
              onClick={onBack}
              startIcon={<ArrowBack />}
              disabled={isSaving}
            >
              Back
            </Button>
            <Button
              variant="contained"
              className="approve-ssap-button button"
              onClick={handleRequestRelease}
              disabled={isSaving}
            >
              SSAP Security Released
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
