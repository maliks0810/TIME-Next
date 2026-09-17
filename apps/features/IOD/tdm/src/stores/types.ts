import { IESGFields, ISecurityAttachmentData, ISecurityDetails, ISpeedOverrides, ITradeFields, SecuritySetupStep } from '../pages/security-setup/lib/types/securitySetupTypes';
import { ISecuritySetupRequestAttachment, ISecuritySetupWizardPayload } from '../services/domain-objects/SecuritySetupRequestPayload';
import { IUserIdentity } from '../services/domain-objects/UserIdentityResponse';

export interface SecuritySetupState {
  // identity / audit fields
  securitySetupRequestId: number | null;
  externalSecuritySetupRequestId: number | null;
  createdBy: string | null;
  createdDate: string | null;
  updatedBy: string | null;
  updatedDate: string | null;
  reviewedBy: string | null;
  reviewedDate: string | null;
  isReviewed: boolean;

  // identifier fields
  identifierType?: string;
  identifierValue?: string;
  marketSector?: string;
  yellowKey?: string;
  newIssue?: string;
  cdiFileUploadedToAnser?: string;
  aladdinCdiId?: string;
  isPrivateDeal?: boolean;
  ssapIdPassword?: string;
  isSsapReleaseRequestSentToDm?: boolean;
  isSsapReleasedByDm?: boolean;
  isEuSecuritizationRequired?: boolean;
  euSecuritizationTipEuId?: string;
  euSecuritizationStatus?: string;
  erisaStatus?: string;
  intexDealName?: string;
  intexPassword?: string;
  dealName?: string;

  // review detail subgroups
  securityDetails: ISecurityDetails;
  esgFields: IESGFields;
  tradeFields: ITradeFields;
  speedOverrides: ISpeedOverrides;
  notesInstructions?: string;
  attachments: ISecurityAttachmentData[];

  // confirm-details
  uploadedFile?: string;

  // wizard navigation
  currentStep: SecuritySetupStep;
  completedSteps: SecuritySetupStep[];
  isReadOnly: boolean;
  isUserReadOnly: boolean;
  showConfirmModal: boolean;

  // file upload
  pendingUploadFiles: File[];
  isUploadingFile: boolean;
  fileUploadError: string | null;

  dmAnalystName: string | null;
  dmAnalystEmail: string | null;
  securitySetupStatusId: number | null;
}

export type IdentifierFieldsPatch = Partial<Pick<SecuritySetupState,
  | 'dealName' | 'euSecuritizationStatus' | 'euSecuritizationTipEuId' | 'erisaStatus'
  | 'newIssue' | 'cdiFileUploadedToAnser' | 'aladdinCdiId'
  | 'intexDealName' | 'intexPassword'
  | 'ssapIdPassword' | 'isPrivateDeal' | 'isSsapReleaseRequestSentToDm' | 'isSsapReleasedByDm'
  | 'identifierValue' | 'identifierType' | 'marketSector' | 'yellowKey'
  | 'isEuSecuritizationRequired'
  >>;

export type SecuritySetupStore = SecuritySetupState & SecuritySetupActions

export interface SecuritySetupActions {
  updateIdentifierFields: (patch: Partial<SecuritySetupState>) => void;
  updateSecurityDetails: (patch: Partial<ISecurityDetails>) => void;
  updateEsgFields: (patch: Partial<IESGFields>) => void;
  updateTradeFields: (patch: Partial<ITradeFields>) => void;
  updateSpeedOverrides: (patch: Partial<ITradeFields>) => void;
  setNotesInstructions: (value: string) => void;
  setAttachments: (list: ISecuritySetupRequestAttachment[]) => void;
  hydrateFromPayload: (initialData: Partial<ISecuritySetupWizardPayload>) => void;
  mergeSavedResponse: (savedData: Partial<ISecuritySetupWizardPayload>) => void;
  goToStep: (step: SecuritySetupStep) => void;
  markStepComplete: (step: SecuritySetupStep) => void;
  setReadOnly: (flag: boolean) => void;
  setUserReadOnly: (flag: boolean) => void;
  setPendingFiles: (file: File[] | undefined) => void;
  removePendingFile: (index: number) => void;
  setUploadingFile: (flag: boolean) => void;
  setFileUploadError: (msg: string | null) => void;
  openConfirmModal: () => void;
  closeConfirmModal: () => void;
  resetWizard: () => void;
  setSecuritySetupStatusId: (id: number | null) => void;
}

export interface IdentityState {
  userIdentity: IUserIdentity | null;
  isIdentityLoaded: boolean;
}

export interface IdentityActions {
  setUserIdentity: (identity: IUserIdentity) => void;
  setIdentityLoaded: (loaded: boolean) => void;
}

export type IdentityStore = IdentityState & IdentityActions