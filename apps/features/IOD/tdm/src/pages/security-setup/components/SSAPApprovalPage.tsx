import React from 'react';
import { Button } from '@mui/material';
import { IEnterIdentifierFormValues } from '../lib/types/securitySetupTypes';

interface SSAPApprovalPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  onProceedToReview: () => void;
  isSaving?: boolean;
}

export const SSAPApprovalPage: React.FC<SSAPApprovalPageProps> = ({
  onFormChange,
  onProceedToReview,
  isSaving
}) => {
  const handleRequestRelease = () => {
    onFormChange({ ssapApproved: true });
    onProceedToReview();
  };

  return (
    <div className="substep-content">
      <div className="ssap-approval-container">
        <div className="ssap-approval-content">
          <p className="ssap-approval-instruction">
            Please confirm that the SSAP Security has been released.
          </p>
          <Button
            variant="contained"
            className="approve-ssap-button"
            onClick={handleRequestRelease}
            disabled={isSaving}
          >
            SSAP Security Released
          </Button>
        </div>
      </div>
    </div>
  );
};
