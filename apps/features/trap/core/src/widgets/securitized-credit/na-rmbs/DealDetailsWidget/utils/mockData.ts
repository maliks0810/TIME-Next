// ─────────────────────────────────────────────────────────────────────────────
// Shared mock data — ARMT 2005-8 (Adjustable Rate Mortgage Trust 2005-8)
// Matches the real INTEX.
// Used by DealDetails, Tranches, and TrancheDetail widgets.
// ─────────────────────────────────────────────────────────────────────────────

export interface DealData {
    // Identity
    intexDealName: string;
    bloombergDealName: string;
    dealType: string;
    collateralType: string;
    // Balances
    origDealBalance: string;
    currDealBalance: string;
    dealBalanceFactor: string;
    origCollatBalance: string;
    currCollatBalance: string;
    collatFactor: string;
    // Dates
    settleDate: string;
    closingDate: string;
    firstPayDate: string;
    stepdownDateReq: string;
    latestUpdate: string;
    dealModelTimestamp: string;
    dealUpdateTimestamp: string;
    nextPayDay: string;
    // Collateral
    currWAC: string;
    currNetWAC: string;
    currWAS: string;
    currWAM: string;
    collateralDetail: string;
    // Traits
    dealAge: string;
    country: string;
    dealCurrency: string;
    dealBondCurrencies: string;
    businessCenter: string;
    forbearanceTreatment: string;
    forbearanceRecovery: string;
    currForbAdjWAC: string;
    currForbAdjNetWAC: string;
    grp7Structure: string;
    grpCROSSStructure: string;
    grp72PricingSpeed: string;
    grp72PPCCurve: string;
    // Relevant parties
    issuer: string;
    trustee: string;
    dealer: string;
    masterServicer: string;
}
