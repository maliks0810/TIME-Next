import React from 'react';
import { Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useSsapFields, useHasDmRole } from '../../../stores/selectors/securitySetupSelectors';
import { useSecuritySetupStore } from '../../../stores/useSecuritySetupStore';

interface SSAPApprovalPageProps {
  onProceedToReview: () => void;
  onBack: () => void;
  isSaving?: boolean;
  hasSaveError?: boolean;
}

export const SSAPApprovalPage: React.FC<SSAPApprovalPageProps> = ({
  onProceedToReview,
  onBack,
  isSaving,
  hasSaveError
}) => {
  const { isSsapReleasedByDm, isReadOnly } = useSsapFields();
  const { updateIdentifierFields } = useSecuritySetupStore();
  const hasDmRole = useHasDmRole();

  const isSsapApproved = !!isSsapReleasedByDm && !hasSaveError;

  const handleRequestRelease = () => {
    updateIdentifierFields({ isSsapReleasedByDm: true });
    onProceedToReview();
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
              disabled={isSaving || isReadOnly || isSsapApproved || !hasDmRole}
            >
              SSAP Security Released
            </Button>
            {isSsapApproved && !isSaving && (
              <Button
                variant="contained"
                className="button"
                onClick={onProceedToReview}
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
