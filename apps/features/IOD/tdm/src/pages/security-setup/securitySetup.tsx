import React from 'react';
import { useNavigate } from 'react-router-dom'
import { SecuritySetupContainer } from './components/SecuritySetupContainer';
import { ISecuritySetupWizardData } from './lib/types';
import './lib/styles.scss';
import { SecuritySetupService } from '../../services/SecuritySetupService';
import { ISecuritySetupWizardPayload } from '../../services/domain-objects/SecuritySetupRequestPayload';

const SecuritySetupComponent: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = async (data: ISecuritySetupWizardData) => {
    try {
      const payload: ISecuritySetupWizardPayload = {
        currentStep: 'confirm-details',
        currentStepNumber: 3,
        savedAt: new Date().toISOString(),
        saveType: 'complete' as const,
        newIssue: data.step1.cdiFileUploadedToAnser,
        cdiFileUploadedToAnser: data.step1.cdiFileUploadedToAnser,
        aladdinCDIId: data.step1.aladdinCDIId,
        privateDeal: data.step1.privateDeal,
        ssapIdPassword: data.step1.ssapIdPassword,
        ssapApproved: data.step1.ssapApproved,
        identifierType: data.step1.identifierType,
        identifierValue: data.step1.identifierValue,
        marketSector: data.step1.marketSector,
        yellowKey: data.step1.yellowKey,
        euSecurityVerificationRequired: data.step1.euSecurityVerificationRequired,
        euSecuritizationTipEuId: data.step1.euSecuritizationTipEuId,
        securityDetails: data.step2.securityDetails,
        esgFields: data.step2.esgFields,
        tradeFields: data.step2.tradeFields,
        notesInstructions: data.step2.notesInstructions,
        ...(data.step3 && {
          uploadedFiles: data.step3.uploadedFile,
          isConfirmed: true
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
