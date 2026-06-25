import type { Dayjs } from 'dayjs';
export type CallableType = "Y" | "N" | "C";

export interface StagingItem {
    label: string;
    ctxKey: string;
    required: boolean;
    isInput?: boolean;
    inputType?: "cusip" | "extId";
}

export interface RequiredAssumptionStatus {
    key: string;
    done: boolean;
    active?: boolean;
}

export interface InputAssumptionsState {
    price: number | null;
    callable: CallableType | null;
    callDate: Dayjs | null;
    callValue: string | undefined;

    collateralType: string |undefined;

    prepaymentType: string | undefined;
    prepaymentValue: number | null;

    defaultType: string | undefined;
    defaultValue: number | null;

    severity: number | null;
    delinquency: number | null;
}

export interface ReadinessResult {
    requiredDone: number;
    requiredTotal: number;
    percent: number;
    canLaunch: boolean;
}