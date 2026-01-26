import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SSAPConfirmationPageProps {
  onSkipToBloomberg?: () => void;
}

export const SSAPConfirmationPage: React.FC<SSAPConfirmationPageProps> = ({
  onSkipToBloomberg
}) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/iod/tdm/');
  };

  return (
    <div className="substep-content">
      <div className="ssap-confirmation-container">
        <div className="ssap-confirmation-box">
          <h3 className="ssap-confirmation-title">SSAP DM Release Request</h3>
          <p className="ssap-confirmation-text">
            DM-Management has been notified of the request to release SSAP. You will be notified
            once Data Management has released the SSAP to continue your request form.
          </p>
          <div className="ssap-confirmation-actions">
            {onSkipToBloomberg && (
              <Button
                variant="outlined"
                className="skip-to-step4-button"
                onClick={onSkipToBloomberg}
              >
                Skip
              </Button>
            )}
            <Button
              variant="contained"
              className="go-to-dashboard-button"
              onClick={handleGoToDashboard}
            >
              Go Back To Dashboard
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};
