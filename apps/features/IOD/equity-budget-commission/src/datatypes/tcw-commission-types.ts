export type CommissionResearchVote = {
    dptName: string,
    divName: string,
    intMstBkr: string,
    mBkrName: string,
    mBkrCode: string,
    year: number,
    grossBudget: number,
    priorYrAdj: number,
    totalBudget: number,
    sumOfTotalComm: number,
    remaining: number,
    pctDone: number,
    budget_seq: number,  
    divCode: string  
}

export type CombinedBudget = {
    uniqueId: string,
    year: number,
    division: string,
    masterBrokerName: string,
    intMstBkr: string,
    execComm?: number,
    researchComm?: number,
    totalBudget: number,
    sumOfTotalComm: number,
    remaining: number,
    pctDone: number,
};

export type CommissionTrade = {
    account: number,
    accountName?: string,
    divisionCode: number,
    divisionName: string,
    departmentCode: number,
    department: string,
    reason: string,
    execBroker: string,
    execMBroker: string,
    execMBrokerName?: string,
    creditBroker: string,
    creditMBroker: string,
    creditMBrokerName?: string,
    currency: string,
    ticketNumber: number,
    orderId: string,
    trader: string,
    ticker: string,
    securityName?: string,
    cusip: string,
    securityType?: string,
    tradeType?: string,
    side: string,
    tradeDate: Date,
    settleDate?: Date,
    shares: number,
    price: number,
    totalComm: number,
    execComm: number,
    researchComm: number,
    usdTotalComm: number,
    usdExecComm: number,
    usdResearchComm: number,
    usdPrice: number,
    net?: number,
    usdNet?: number,
    basePrinFxRate?: number,
    prinBaseFxRate?: number
}

export type CommissionTradeDetails = {
    orderId: string,
    division: string,
    reason: string,
    exBroker: string,
    crBroker: string,
    currency: string,
    trader: string,
    ticker: string,
    cusip: string,
    side: string,
    shares: number,
    price: number,
    commission: number,
    strategy: string
}

export type Reason = {
    name: string,
    code: string
}

export type CRBrokerMapping = {
    execBroker: string;
    creditBroker: string;
    creditBrokerName: string;
};

export type CRBrokers = {
    creditBroker: string;
    creditBrokerName: string;
};

export type CommissionTradeBatchRequestDto = {
    orderId: string[];
    creditBroker: string;
    reason: string;
    lastUpdateBy?: string;
}

export type CSAMonthlyCommission = {
    rowNum: number,
    division: string,
    execMBroker: string,
    execMbrokerName: string,
    creditBroker: string,
    creditMBrokerName?: string,
    reason: string,
    commission: number,
    month: number
}

export type CommissionRecon = {
    account: number,
    accountName?: string,
    division_Code: number,
    division_Name: string,
    department_Code: number,
    department: string,
    reason: string,
    exec_Broker: string,
    exec_MBroker: string,
    exec_MBrokerName?: string,
    credit_Broker: string,
    credit_MBroker: string,
    credit_MBrokerName?: string,
    currency: string,
    ticket_Number: number,
    order_ID: string,
    trader: string,
    ticker: string,
    security_Name?: string,
    cusip: string,
    security_Type?: string,
    trade_Type?: string,
    side: string,
    trade_Date: Date,
    settle_Date?: Date,
    shares: number,
    price: number,
    total_Comm: number,
    exec_Comm: number,
    research_Comm: number,
    usD_Total_Comm: number,
    usD_Exec_Comm: number,
    usD_Research_Comm: number,
    usD_Price: number,
    net?: number,
    usD_Net?: number,
    base_Prin_Fx_Rate?: number,
    priN_BASE_Fx_Rate?: number,
    issue: string
}

export type CommissionReconDetail = {
    orderId: string,
    division: string,
    reason: string,
    exBroker: string,
    crBroker: string,
    currency: string,
    trader: string,
    ticker: string,
    cusip: string,
    side: string,
    shares: number,
    price: number,
    commission: number,
    strategy: string
}