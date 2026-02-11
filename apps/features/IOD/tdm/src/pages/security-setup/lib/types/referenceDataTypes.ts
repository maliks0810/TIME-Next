export interface IReferenceDataKeyValue {
    FieldDropdownValueId: number;
    FieldDropdownValue: string;
    FieldDropdownDescription?: string;
}

export interface IReferenceData {
    FieldDropdownKey: string;
    FieldDropdownValues: IReferenceDataKeyValue[];
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
}
