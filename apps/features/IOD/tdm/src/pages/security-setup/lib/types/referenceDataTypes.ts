export interface IUserRole {
    userRoleId: number;
    userEmail: string;
    userName: string;
    roleDescription: string;
    roleIds: string[];
}

export interface IReferenceDataKeyValue {
    fieldDropdownValueId: number;
    fieldDropdownValue: string;
    fieldDropdownDescription?: string;
}

export interface IReferenceData {
    fieldDropdownKey: string;
    fieldDropdownValues: IReferenceDataKeyValue[];
}

export type ReferenceDataCollection = Record<string, IReferenceData>;

export interface IGetReferenceDataResponse {
    referenceData: IReferenceData[];
    totalCount: number;
}

export interface INormalizedReferenceData {
    byKey: ReferenceDataCollection;
    all: IReferenceData[];
    fetchedAt: string;
}

export interface IDropdownOption {
    value: string;
    label: string;
    description?: string;
    id?: number;
}

export enum ReferenceDataFieldKey {
    // Enter Identifier fields
    Identifier = 'Identifier',
    MarketSector = 'Market Sector',

    // Review Details - ESG fields
    IsTotalESGTCW = 'IsTotalESGTCW',
    TcwEsgType = 'TCW ESG Type',

    // Review Details - Trade fields
    Slicer = 'Slicer',
    MBS = 'MBS',
    LoanCreditType = 'LoanCreditType',
    MBSCollateral = 'MBS Collateral',
    MBSCollateralSub = 'MBS Collateral Sub',
    SrMostCashFlow = 'SrMostCashFlow',
    Tranche = 'TRANCHE',
    SMSLoanCategory = 'SMSLoanCategory',
    Collateral = 'COLLATERAL',

    // Review Details - Security Details fields
    Callable = 'Callable',
    Sector = 'Sector',

    // Review Details - Speed Overrides fields
    PrepaymentType = 'Prepayment Type',
    DefaultType = 'Default Type',
    EuSecuritizationStatus = 'EU Securitization Status',
    ErisaStatus = 'ERISA Status'
}
