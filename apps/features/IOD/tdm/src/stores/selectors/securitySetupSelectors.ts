import { useShallow } from 'zustand/react/shallow';
import { useSecuritySetupStore } from '../useSecuritySetupStore';
import { IdentityStore, SecuritySetupStore } from '../types';
import { useIdentityStore } from '../useIdentityStore';

/** SELECTORS
 *
 *
 */

// Step 1 - Identifier fields
export const useIdentifierFields = () =>
  useSecuritySetupStore(
    useShallow((s: SecuritySetupStore) => ({
      dealName: s.dealName,
      euSecuritizationStatus: s.euSecuritizationStatus,
      euSecuritizationTipEuId: s.euSecuritizationTipEuId,
      erisaStatus: s.erisaStatus,
      newIssue: s.newIssue,
      aladdinCdiId: s.aladdinCdiId,
      intexDealName: s.intexDealName,
      intexPassword: s.intexPassword,
      ssapIdPassword: s.ssapIdPassword,
      identifierType: s.identifierType,
      identifierValue: s.identifierValue,
      marketSector: s.marketSector,
      yellowKey: s.yellowKey,
      isPrivateDeal: s.isPrivateDeal,
      isSsapReleaseRequestSentToDm: s.isSsapReleaseRequestSentToDm,
      isSsapReleasedByDm: s.isSsapReleasedByDm,
      isEuSecuritizationRequired: s.isEuSecuritizationRequired,
      isReadOnly: s.isReadOnly,
      isUserReadOnly: s.isUserReadOnly,
      pendingUploadFiles: s.pendingUploadFiles,
      isUploadingFile: s.isUploadingFile,
      fileUploadError: s.fileUploadError,
      attachments: s.attachments
    }))
  );

// SSAP Fields
export const useSsapFields = () =>
  useSecuritySetupStore(
    useShallow((s: SecuritySetupStore) => ({
      isSsapReleasedByDm: s.isSsapReleasedByDm,
      isReadOnly: s.isReadOnly,
      isUserReadOnly: s.isUserReadOnly
    }))
  )

// Review Details
export const useReviewDetailsFields = () =>
  useSecuritySetupStore(
    useShallow((s: SecuritySetupStore) => ({
      aladdinCdiId: s.aladdinCdiId,
      euSecuritizationStatus: s.euSecuritizationStatus,
      euSecuritizationTipEuId: s.euSecuritizationTipEuId,
      isEuSecuritizationRequired: s.isEuSecuritizationRequired,
      erisaStatus: s.erisaStatus,
      securityDetails: s.securityDetails,
      esgFields: s.esgFields,
      tradeFields: s.tradeFields,
      speedOverrides: s.speedOverrides,
      notesInstructions: s.notesInstructions,
      attachments: s.attachments,
      isReadOnly: s.isReadOnly,
      isUserReadOnly: s.isUserReadOnly
    }))
  )

// Confirm Details
export const useConfirmDetailsData = () =>
  useSecuritySetupStore(
    useShallow((s: SecuritySetupStore) => ({
      aladdinCdiId: s.aladdinCdiId,
      identifierValue: s.identifierValue,
      euSecuritizationStatus: s.euSecuritizationStatus,
      euSecuritizationTipEuId: s.euSecuritizationTipEuId,
      erisaStatus: s.erisaStatus,
      ssapIdPassword: s.ssapIdPassword,
      securityDetails: s.securityDetails,
      esgFields: s.esgFields,
      tradeFields: s.tradeFields,
      speedOverrides: s.speedOverrides,
      notesInstructions: s.notesInstructions,
      attachments: s.attachments,
      uploadedFile: s.uploadedFile
    }))
  )

// wizard navigation state
export const useWizardNavigation = () =>
  useSecuritySetupStore(
    useShallow((s: SecuritySetupStore) => ({
      currentStep: s.currentStep,
      completedSteps: s.completedSteps,
      isReadOnly: s.isReadOnly,
      isUserReadOnly: s.isUserReadOnly,
      showConfirmModal: s.showConfirmModal
    }))
  )

  // file upload state
export const useFileUploadState = () =>
  useSecuritySetupStore(
    useShallow((s: SecuritySetupStore) => ({
      pendingUploadFiles: s.pendingUploadFiles,
      isUploadingFile: s.isUploadingFile,
      fileUploadError: s.fileUploadError
    }))
  )

export const useHasPasswordFlow = () =>
  useSecuritySetupStore((s: SecuritySetupStore) => !!(s.ssapIdPassword?.trim() ?? ''));

export const useHasDmRole = () => {
  const userIdentity = useIdentityStore((s: IdentityStore) => s.userIdentity);

  return userIdentity?.permissionsAllowed?.ssap_release || false;
};

// canProceed validation
export const useValidationFields = () =>
  useSecuritySetupStore(
    useShallow((s: SecuritySetupStore) => ({
      identifierType: s.identifierType,
      identifierValue: s.identifierValue,
      marketSector: s.marketSector,
      euSecuritizationStatus: s.euSecuritizationStatus,
      erisaStatus: s.erisaStatus,
      newIssue: s.newIssue,
      aladdinCdiId: s.aladdinCdiId,
      sectorValue: s.securityDetails.sectorValue,
      callableValue: s.securityDetails.callableValue,
      callDate: s.securityDetails.callDate,
      price: s.securityDetails.price,
      prepaymentTypeValue: s.speedOverrides.prepaymentTypeValue,
      defaultTypeValue: s.speedOverrides.defaultTypeValue,
      prepaymentSpeed: s.speedOverrides.prepaymentSpeed,
      defaultSpeed: s.speedOverrides.defaultSpeed,
      severity: s.speedOverrides.severity,
      delinquency: s.speedOverrides.delinquency,
      notes: s.notesInstructions,
      loanCategoryValue: s.tradeFields.loanCategoryValue
    }))
  )

// Success messages (step1 summary)
export const useSummary = () =>
  useSecuritySetupStore(
    useShallow((s: SecuritySetupStore) => ({
      newIssue: s.newIssue,
      aladdinCdiId: s.aladdinCdiId,
      ssapIdPassword: s.ssapIdPassword,
      identifierType: s.identifierType,
      identifierValue: s.identifierValue,
      marketSector: s.marketSector,
      isEuSecuritizationRequired: s.isEuSecuritizationRequired,
      euSecuritizationTipEuId: s.euSecuritizationTipEuId
    }))
  )
