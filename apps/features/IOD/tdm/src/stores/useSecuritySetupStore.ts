import { create } from 'zustand';
import type { StoreApi } from 'zustand';
import { IdentifierFieldsPatch, SecuritySetupActions, SecuritySetupState, SecuritySetupStore } from './types';
import { ISecuritySetupRequestAttachment, ISecuritySetupWizardPayload } from '../services/domain-objects/SecuritySetupRequestPayload';
import { IESGFields, ISecurityDetails, ISpeedOverrides, ITradeFields, SecuritySetupStep } from '../pages/security-setup/lib/types/securitySetupTypes';

const INITIAL_STATE: SecuritySetupState = {
  securitySetupRequestId: null,
  createdBy: null,
  createdDate: null,
  updatedBy: null,
  updatedDate: null,
  reviewedBy: null,
  reviewedDate: null,
  isReviewed: false,
  // identifier fields
  identifierType: undefined,
  identifierValue: undefined,
  marketSector: undefined,
  yellowKey: undefined,
  newIssue: undefined,
  cdiFileUploadedToAnser: undefined,
  aladdinCdiId: undefined,
  isPrivateDeal: undefined,
  ssapIdPassword: undefined,
  isSsapReleaseRequestSentToDm: undefined,
  isSsapReleasedByDm: undefined,
  isEuSecuritizationRequired: undefined,
  euSecuritizationTipEuId: undefined,
  euSecuritizationStatus: undefined,
  erisaStatus: undefined,
  intexDealName: undefined,
  intexPassword: undefined,
  dealName: undefined,
  // review detail subgroups
  securityDetails: {},
  esgFields: {},
  tradeFields: {},
  speedOverrides: {},
  notesInstructions: undefined,
  attachments: [],
  uploadedFile: undefined,
  // nav
  currentStep: 'enter-identifier',
  completedSteps: [],
  isReadOnly: false,
  showConfirmModal: false,
  // file upload
  pendingUploadFile: null,
  isUploadingFile: false,
  fileUploadError: null
}

const computeCompletedSteps = (
  initialData: Partial<ISecuritySetupWizardPayload>
): SecuritySetupStep[] => {
  if (!initialData.currentStep) {
    return [];
  }

  const steps: SecuritySetupStep[] = []
  if (['ssap-confirmation', 'review-details', 'confirm-details'].includes(initialData.currentStep)) {
    steps.push('enter-identifier');
  }

  if (['review-details', 'confirm-details'].includes(initialData.currentStep)) {
    if (initialData.ssapIdPassword?.trim()) {
      steps.push('ssap-confirmation');
    }
  }

  if (initialData.currentStep === 'confirm-details') {
    steps.push('review-details');
  }

  return steps;
}

export const useSecuritySetupStore = create<SecuritySetupState & SecuritySetupActions>()(
  (set: StoreApi<SecuritySetupStore>['setState']) => ({
    ...INITIAL_STATE,

    updateIdentifierFields: (patch: IdentifierFieldsPatch) => set({...patch}),

    updateSecurityDetails: (patch: Partial<ISecurityDetails>) =>
      set((prev: SecuritySetupStore) => ({
        securityDetails:{ ...prev.securityDetails, ...patch},
      })),

    updateEsgFields: (patch: Partial<IESGFields>) =>
      set((prev: SecuritySetupStore) => ({ esgFields: { ...prev.esgFields, ...patch } })),

    updateTradeFields: (patch: Partial<ITradeFields>) =>
      set((prev: SecuritySetupStore) => ({ tradeFields: { ...prev.tradeFields, ...patch } })),

    updateSpeedOverrides: (patch: Partial<ISpeedOverrides>) =>
      set((prev: SecuritySetupStore) => ({ speedOverrides: { ...prev.speedOverrides, ...patch } })),

    setNotesInstructions: (value: string) => set({ notesInstructions: value }),

    setAttachments: (list: ISecuritySetupRequestAttachment[]) => set({ attachments: list }),

    hydrateFromPayload: (initialData) => {
      const completedSteps = computeCompletedSteps(initialData);
      set({
        ...INITIAL_STATE,
        // identifier fields
        newIssue: initialData.newIssue ?? undefined,
        cdiFileUploadedToAnser: initialData.cdiFileUploadedToAnser ?? undefined,
        aladdinCdiId: initialData.aladdinCdiId ?? undefined,
        isPrivateDeal: initialData.isPrivateDeal ?? undefined,
        ssapIdPassword: initialData.ssapIdPassword ?? undefined,
        isSsapReleaseRequestSentToDm: initialData.isSsapReleaseRequestSentToDm ?? false,
        isSsapReleasedByDm: initialData.isSsapReleasedByDm ?? false,
        identifierType: initialData.identifierType ?? undefined,
        identifierValue: initialData.identifierValue ?? undefined,
        marketSector: initialData.marketSector ?? undefined,
        yellowKey: initialData.yellowKey ?? undefined,
        isEuSecuritizationRequired: initialData.isEuSecuritizationRequired ?? undefined,
        euSecuritizationTipEuId: initialData.euSecuritizationTipEuId ?? undefined,
        euSecuritizationStatus: initialData.euSecuritizationStatus ?? undefined,
        erisaStatus: initialData.erisaStatus ?? undefined,
        intexDealName: initialData.intexDealName ?? undefined,
        intexPassword: initialData.intexPassword ?? undefined,
        dealName: initialData.dealName ?? undefined,
        // review details
        securityDetails: initialData.securityDetails ?? {},
        esgFields: initialData.esgFields ?? {},
        tradeFields: initialData.tradeFields ?? {},
        speedOverrides: initialData.speedOverrides ?? {},
        notesInstructions: initialData.notesInstructions ?? undefined,
        attachments: initialData.attachments ?? [],
        // navigation
        currentStep: (initialData.currentStep) ?? 'enter-identifier',
        completedSteps

      })
     },

    mergeSavedResponse: (savedData: Partial<ISecuritySetupWizardPayload>) => {
      set((prev: SecuritySetupStore) => ({
         newIssue: savedData.newIssue ?? prev.newIssue,
        cdiFileUploadedToAnser: savedData.cdiFileUploadedToAnser ?? prev.cdiFileUploadedToAnser,
        aladdinCdiId: savedData.aladdinCdiId ?? prev.aladdinCdiId,
        isPrivateDeal: savedData.isPrivateDeal ?? prev.isPrivateDeal,
        ssapIdPassword: savedData.ssapIdPassword ?? prev.ssapIdPassword,
        isSsapReleaseRequestSentToDm: savedData.isSsapReleaseRequestSentToDm ?? prev.isSsapReleaseRequestSentToDm,
        isSsapReleasedByDm: savedData.isSsapReleasedByDm ?? prev.isSsapReleasedByDm,
        identifierType: savedData.identifierType ?? prev.identifierType,
        identifierValue: savedData.identifierValue ?? prev.identifierValue,
        marketSector: savedData.marketSector ?? prev.marketSector,
        yellowKey: savedData.yellowKey ?? prev.yellowKey,
        isEuSecuritizationRequired: savedData.isEuSecuritizationRequired ?? prev.isEuSecuritizationRequired,
        euSecuritizationTipEuId: savedData.euSecuritizationTipEuId ?? prev.euSecuritizationTipEuId,
        euSecuritizationStatus: savedData.euSecuritizationStatus ?? prev.euSecuritizationStatus,
        erisaStatus: savedData.erisaStatus ?? prev.erisaStatus,
        intexDealName: savedData.intexDealName ?? prev.intexDealName,
        intexPassword: savedData.intexPassword ?? prev.intexPassword,
        dealName: savedData.dealName ?? prev.dealName,
        securityDetails: {...prev.securityDetails, ...savedData.securityDetails},
        esgFields: {...prev.esgFields, ...savedData.esgFields},
        tradeFields:  {...prev.tradeFields, ...savedData.tradeFields},
        speedOverrides:  {...prev.speedOverrides, ...savedData.speedOverrides},
        notesInstructions: savedData.notesInstructions ?? prev.notesInstructions,
        attachments: savedData.attachments?.length ? savedData.attachments : prev.attachments
      }))
     },

    goToStep: (step: SecuritySetupStep) => set({ currentStep: step }),

    markStepComplete: (step: SecuritySetupStep) =>
      set((prev: SecuritySetupStore)=> prev.completedSteps.includes(step) ? prev : {completedSteps: [...prev.completedSteps, step]}),

    setReadOnly: (flag: boolean) => set({ isReadOnly: flag }),

    setPendingFile: (file: File | null) => set({ pendingUploadFile: file}),

    setUploadingFile: (flag: boolean) => set({ isUploadingFile: flag }),

    setFileUploadError: (msg: string | null) => set({ fileUploadError: msg }),

    openConfirmModal: () => set({ showConfirmModal: true }),

    closeConfirmModal: () => set({ showConfirmModal: false }),

    resetWizard: () => set(INITIAL_STATE)
  })
)

