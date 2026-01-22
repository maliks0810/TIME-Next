import React from 'react';
import { SecuritySetupContainer } from './components/SecuritySetupContainer'
import { ISecuritySetupWizardData } from './lib/types';
import './lib/styles.scss'

export const PrivateSecuritySetup: React.FC = () => {
  const handleComplete = (data: ISecuritySetupWizardData) => {
    console.log('private security data setup complete', data)
  }

  const handleCancel = () => {
    console.log('private security setup cancelled')
  }

  return (
    <div>
      <SecuritySetupContainer
        flowType='private'
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  )
}

