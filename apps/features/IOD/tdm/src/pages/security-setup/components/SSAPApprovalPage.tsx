import React from 'react';
import { Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { IEnterIdentifierFormValues } from '../lib/types/securitySetupTypes';

export type UserInput = { isSsapReleasedByDm: boolean }

interface SSAPApprovalPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  onProceedToReview: (userInput?: UserInput) => void;
  onBack: () => void;
  isReadOnly: boolean;
  isSaving?: boolean;
}

export const SSAPApprovalPage: React.FC<SSAPApprovalPageProps> = ({
  formValues,
  onFormChange,
  onProceedToReview,
  onBack,
  isReadOnly,
  isSaving
}) => {
  const isSsapApproved = !!formValues.isSsapReleasedByDm;

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
              disabled={isSaving || isReadOnly || isSsapApproved}
            >
              SSAP Security Released
            </Button>
            {isSsapApproved && !isSaving && (
              <Button
                variant="contained"
                className="button"
                onClick={() => onProceedToReview()}
                disabled={isSaving}
                endIcon={<ArrowForward />}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
