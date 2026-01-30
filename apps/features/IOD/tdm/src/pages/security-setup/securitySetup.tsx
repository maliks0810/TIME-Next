import React from 'react';
import { useNavigate } from 'react-router-dom'
import { SecuritySetupContainer } from './components/SecuritySetupContainer';
import { ISecuritySetupWizardData } from './lib/types';
import './lib/styles.scss';
import { SecuritySetupService } from '../../services/SecuritySetupService';

const SecuritySetupComponent: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = async (data: ISecuritySetupWizardData) => {
    try {
      const payload = {
        currentStep: 'confirm-details' as const,
        currentStepNumber: 6,
        savedAt: new Date().toISOString(),
        saveType: 'complete' as const,
        ...data.step1,
        securityDetails: data.step2.securityDetails,
        esgFields: data.step2.esgFields,
        tradeFields: data.step2.tradeFields,
        notesInstructions: data.step2.notesInstructions,
        ...(data.step3 && {
          uploadedFiles: data.step3.uploadedFile
        })
      }

      await SecuritySetupService.upsertWizardData(payload)
      navigate('/iod/tdm/')
    } catch (error) {
      console.error('Failed to submit security setup', error);
      alert('Failed to submit security setup. Please try again.')
    }

  };

  const handleCancel = () => {
    navigate('/iod/tdm/')
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
