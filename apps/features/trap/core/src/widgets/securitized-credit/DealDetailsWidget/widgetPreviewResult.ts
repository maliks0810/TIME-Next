// Static preview sample (ARMT 2005-8) for widget-gallery render.
// Field names mirror the live.ts executor contract exactly.
// (Consolidating this with mock.ts is backlog #12.)
export const widgetPreviewResult = {
    // Identity
    intexDealName: 'ARMT 2005-8',
    bloombergDealName: 'ARMT 2005-8',
    dealType: 'RMBS',
    collateralType: 'ALT_A',
    collateralDetail: 'Loan Level',
    country: 'USA',
    currency: 'USD',

    // Balances
    origDealBalance: '1,200,000,000.00',
    currDealBalance: '43,727,992.99',
    dealBalanceFactor: '0.03644',
    origCollatBalance: '1,200,000,000.00',
    currCollatBalance: '43,727,992.99',
    collatFactor: '0.03644',
    dealAge: 222,
    numBonds: 27,
    numLoans: 1247,

    // WA metrics
    currWAC: '5.6745%',
    currNetWAC: '5.4195%',
    currWAS: '2.6745%',
    currWAM: '234',
    currWALA: '222',

    // Dates
    settleDate: '2005-10-28',
    closingDate: '2005-10-28',
    firstPayDate: '2005-12-25',
    latestUpdate: '2024-01-25',
    modelTimestamp: '2024-01-25 12:00 UTC',
    nextPayDay: '2024-02-25',

    // Relevant parties
    issuerName: 'Adjustable Rate Mortgage Trust',
    dealerName: 'Countrywide Securities',
    trustee: 'U.S. Bank National Association',
    masterServicer: 'Countrywide Home Loans',

    // Structure (asset-class-neutral; replaces Deal Traits)
    structure: {
        nClasses: 27,
        classes: '1A1, 1A2, 2A1, 3A1, 4A1, B1, B2, B3, B4, R',
        nTriggers: 3,
        triggerNames: 'PRORATA_TRIGGER, CS_DELINQTEST, CS_STEPDOWNTEST',
        nCalls: 1,
        callNames: 'CLEANUP',
        nCreditEnhancements: 2,
        creditEnhancementNames: 'SUBORDINATION, OC',
        nExpenses: 4,
        expenseNames: 'SERVFEE, TRUSTEE, MASTERSERV, ADMIN',
        settlementType: 'NORMAL',
        hasPayruleScript: 'Yes',
    },
};