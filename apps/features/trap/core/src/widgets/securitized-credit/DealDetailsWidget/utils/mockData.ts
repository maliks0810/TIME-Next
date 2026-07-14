// ─────────────────────────────────────────────────────────────────────────────
// Shared deal data contract — asset-class-neutral (securitized).
// Used by DealDetails, Tranches, and TrancheDetail widgets.
// Field names match the live.ts executor output (normaliseDeal is a passthrough).
// ─────────────────────────────────────────────────────────────────────────────

export interface DealStructure {
    nClasses: number | null;
    classes: string | null;
    nTriggers: number | null;
    triggerNames: string | null;
    nCalls: number | null;
    callNames: string | null;
    nCreditEnhancements: number | null;
    creditEnhancementNames: string | null;
    nExpenses: number | null;
    expenseNames: string | null;
    settlementType: string | null;
    hasPayruleScript: string | null;
}

export interface DealData {
    // Identity
    intexDealName: string;
    bloombergDealName: string | null;
    dealType: string | null;
    collateralType: string | null;
    collateralDetail: string | null;
    country: string | null;
    currency: string | null;

    // Balances
    origDealBalance: string | null;
    currDealBalance: string | null;
    dealBalanceFactor: string | null;
    origCollatBalance: string | null;
    currCollatBalance: string | null;
    collatFactor: string | null;
    dealAge: number | string | null;
    numBonds: number | null;
    numLoans: number | null;

    // Collateral / rate metrics
    currWAC: string | null;
    currNetWAC: string | null;
    currWAS: string | null;
    currWAM: string | null;
    currWALA: string | null;

    // Dates
    settleDate: string | null;
    closingDate: string | null;
    firstPayDate: string | null;
    latestUpdate: string | null;
    modelTimestamp: string | null;
    nextPayDay: string | null;

    // Relevant parties
    issuerName: string | null;
    dealerName: string | null;
    trustee: string | null;
    masterServicer: string | null;

    // Structure (asset-class-neutral; replaces Deal Traits)
    structure: DealStructure | null;
}