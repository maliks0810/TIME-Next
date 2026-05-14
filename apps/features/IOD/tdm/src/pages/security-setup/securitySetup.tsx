import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SecuritySetupContainer } from './components/SecuritySetupContainer';
import './lib/styles.scss';
import { SecuritySetupService } from '../../services/SecuritySetupService';
import { ISecuritySetupWizardPayload } from '../../services/domain-objects/SecuritySetupRequestPayload';
import { useSecuritySetupStore } from '../../stores/useSecuritySetupStore';

const SecuritySetupComponent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetWizard } = useSecuritySetupStore();
  const [initialData, setInitialData] = useState<Partial<ISecuritySetupWizardPayload> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const securitySetupId = searchParams.get('id');
  useEffect(() => {
    if (!securitySetupId) {
      return;
    }

    const fetchWizardData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const savedData = await SecuritySetupService.getWizardData(securitySetupId);
        setInitialData(savedData);
      } catch (error) {
        console.error('Failed to load saved wizard data', error);
        setLoadError('Failed to load saved data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchWizardData();
  }, [securitySetupId]);

  // by the time onComplete fires, SecuritySetupContainer has already persisted the fial save
  const handleComplete = async () => {
    resetWizard();
    navigate('/iod/tdm/')
  };

  const handleCancel = () => {
    navigate('/iod/tdm/')
  };

  const shouldShowLoading = isLoading || (securitySetupId && !initialData && !loadError)
  if (shouldShowLoading) {
    return (
      <div className="security-setup-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading saved wizard data...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="security-setup-page">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          <p>{loadError}</p>
          <button onClick={() => navigate('/iod/tdm/')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="security-setup-page">
      <SecuritySetupContainer
        flowType="non-private" // TODO: determine how to decide flow
        onComplete={handleComplete}
        onCancel={handleCancel}
        initialData={initialData}
      />
    </div>
  );
};

const SecuritySetup: React.FC = () => <SecuritySetupComponent />;

export default SecuritySetup;
