import React from 'react';
import { SecuritySetupContainer } from './components/SecuritySetupContainer';
import { ISecuritySetupWizardData } from './lib/types';
import './lib/styles.scss';

const SecuritySetupComponent: React.FC = () => {
  const handleComplete = (data: ISecuritySetupWizardData) => {
    console.log('Security Setup Complete:', data);
    // TODO: Handle the completed form data (e.g., submit to API)
    alert('Security setup completed successfully!');
  };

  const handleCancel = () => {
    console.log('Security Setup Cancelled');
    // TODO: Handle cancellation (e.g., navigate back)
  };

  return (
    <div className="security-setup-page">
      <SecuritySetupContainer
        flowType="non-private" // TODO: determine how to decide flow
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
};

const SecuritySetup: React.FC = () => <SecuritySetupComponent />;

export default SecuritySetup;
