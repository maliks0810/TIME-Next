export type ResearchBudget = {
    composite_Id: string,
    budgetYear: number,
    divisionId: number,
    division?: string,
    masterBrokerId: string,
    masterBroker?: string,
    mBkrCode?: string,
    quarterOne: number,
    quarterTwo: number,
    quarterThree: number,
    quarterFour: number,
    total?: number,
    quarter_One_Id?: number,
    quarter_Two_Id?: number,
    quarter_Three_Id?: number,
    quarter_Four_Id?: number,
};

export type RequestResearchBudget = {
    composite_Id?: string,
    budgetYear: number,
    divisionId: number,
    division?: string,
    masterBrokerId: string,
    masterBroker?: string,
    mBkrCode?: string,
    quarterOne: number,
    quarterTwo: number,
    quarterThree: number,
    quarterFour: number,
    total?: number,
    quarter_One_Id?: number,
    quarter_Two_Id?: number,
    quarter_Three_Id?: number,
    quarter_Four_Id?: number,
    lastUpdateBy?: string
};

export type BudgetService = {
    serviceId: number,
    serviceName: string,
    accountId: number,
    vendorId: number,
    brokerId: number,
    status: string,
    vendorName: string,
    startDate: Date,
    categoryId: number,
    categoryCode: string,
    categoryName: string,
    renewalDescription: string,
    cancelDescription: string,
    documentation: string,
    lastUpdateBy: string
    lastUpdateDate: Date
}

export type SoftDollarBudget = {
    softDollarBudgetId: number,
    budgetTypeId: number,
    serviceId: number,
    serviceName: string,
    divisionId: number,
    divisionName: string,
    departmentId: number,
    departmentName: string,
    brokerId: number,
    brokerName: string,
    brokerCode: string,
    masterBrokerId: number,
    masterBrokerName: string,
    masterBrokerCode: string,
    startDate: Date,
    endDate: Date,
    budgetState: number,
    status: boolean,
    year: number,
    totalCost: number,
    totalNonResearchCost: number,
    totalCommissionBudget: number,
    calculatedHardDollar: number,
    calculatedSoftDollar: number,
    ratio: number,
    lastUpdateBy: string,
  }

  export type RequestSoftDollarBudget = {
    softDollarBudgetId?: number,
    budgetTypeId: number,
    serviceId: number,
    serviceName?: string,
    departmentId: number,
    departmentName?: string,
    brokerId: number,
    brokerName?: string,
    brokerCode?: string,
    year: number,
    ratio: number,
    lastUpdateBy: string,
  }

  export type SoftDollarBudgetDetail = {
    softDollarBudgetId: number,
    brokerId: number,
    brokerName?: string,
    departmentId?: number,
    divisionId: number,
    divisionName: string,
    serviceDescription: string,
    hardDollar: number,
    softDollar: number,
    ratio: number,
    year?: number,
    serviceName?: string,
    accounts?: SoftDollarBudgetAccount[]
    changeLog?: SoftDollarBudgetChangeLog[]
    comments?: SoftDollarBudgetComment[]
  }

  export type SoftDollarBudgetAccount = {
    softDollarBudgetAccountId: number,
    softDollarBudgetId: number,
    year: number,
    account: string,
    budgetState: number,
    serviceId: number,
    serviceName: string,
    divisionId?: number,
    departmentId: number,
    departmentName: string,
    status: string,
    cost: number,
    softDollar: number,
    startDate: Date,
    endDate: Date,
    userAllocations: [],
  }

  export type RequestSoftDollarBudgetAccount = {
    softDollarBudgetId: number,
    account: string,
    accountDescription?: string,
    cost: number,
    status: string,
    requestDate?: Date,
    startDate: Date,
    endDate: Date,
    year: number,
    coopDealNum?: number,
    divisionId?: number,
    departmentId: number,
    softDollar: number,
    coopServiceCode?: string,
    comments: string,
    lastUpdateBy: string,
  }

  export type BudgetYear = {
      value: number;
      text: string;
  };

  export type SoftDollarBudgetAccountUser = {
    userAllocationId: number,
    softDollarBudgetId: number,
    softDollarBudgetAccountId: number,
    serviceId: number,
    userId: number,
    budgetYear: number,
    userName: string,
    departmentId: number,
    departmentName: string,
    userStatus: string,
    totalCost: number,
    commission: number,
    ratio: number,
    startDate: Date,
    endDate: Date,
    account?: string
  }

  export type RequestSoftDollarBudgetAccountUser = {
    userId: number,
    softDollarBudgetAccountId: number,
    budgetYear: number,
    budgetState: string,
    serviceId: number,
    departmentId: number,
    coopStaffCode: string,
    coopDealNum?: number,
    userStatus: string,
    totalCost: number,
    commission: number,
    startDate: Date,
    endDate: Date,
    lastUpdateBy: string,
  }

  export type SoftDollarBudgetChangeLog = {
    changeLogId: number,
    actionType: string,
    logDescription: string,
    timestamp: Date,
    user: string
  }

  export type SoftDollarBudgetComment = {
    commentId: number,
    softDollarBudgetId: number,
    comment: string,
    timestamp: Date
  }