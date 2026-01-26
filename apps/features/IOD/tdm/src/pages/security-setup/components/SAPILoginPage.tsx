import React from 'react';
import { Button } from '@mui/material';
import { IEnterIdentifierFormValues } from '../lib/types';

interface SAPILoginPageProps {
  formValues: IEnterIdentifierFormValues;
  onFormChange: (values: Partial<IEnterIdentifierFormValues>) => void;
  isReadOnly: boolean;
}

export const SAPILoginPage: React.FC<SAPILoginPageProps> = ({
  formValues,
  onFormChange,
  isReadOnly,
}) => {
  const handleRequestRelease = () => {
    onFormChange({ ssapApproved: true });
  };

  const isApproved = formValues.ssapApproved === true;

  return (
    <div className="substep-content">
      <div className="ssap-request-container">
        <p className="ssap-confirmation-instruction">
          Please confirm that the SSAP Security has been released.
        </p>
        <Button
          variant="contained"
          className="ssap-request-button"
          onClick={handleRequestRelease}
          disabled={isReadOnly || isApproved}
        >
          SSAP Request DM Release →
        </Button>
      </div>
    </div>
  );
};
