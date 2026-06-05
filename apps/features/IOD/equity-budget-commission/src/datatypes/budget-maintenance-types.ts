export type OktaUserInfo = {
    name?: string,
    email?: string,
    idToken?: string,
    group?: string,
    department?: string,
    title?: string,
    team?: string,
};

export type MaintenanceDivision = {
    divisionId: number,
    divisionName: string|undefined,
    status?: string,
    lastUpdateDate: Date,
    lastUpdateBy?:string,
    active?:boolean
}

export type RequestMaintenanceDivision = {
    divisionName: string|undefined,
    status: string,
    lastUpdateBy?:string
}

export type MaintenanceDepartment = {
    departmentId: number,
    departmentName?: string,
    divisionId?: number,
    status?: string,
    lastUpdateDate: Date,
    lastUpdateBy?:string,
    active?:boolean
}

export type RequestMaintenanceDepartment = {
    departmentName?: string,
    divisionId?: number,
    status: string,
    lastUpdateBy?:string
}

export type MaintenanceMasterBroker = {
    ID: number,
    masterBrokerId: string,
    masterBrokerName?: string,
    masterBrokerCode?: string,
    status?: string,
    brokerType?: string,
    lastUpdateDate: Date,
    lastUpdateBy?:string,
    active?:boolean
}

export type RequestMaintenanceMasterBroker = {
    masterBrokerId: string,
    masterBrokerName: string,
    masterBrokerCode: string,
    status: string,
    lastUpdateBy?:string
}

export type MaintenanceBroker = {
    brokerId: number,
    brokerName?: string,
    brokerCode?: string,
    masterBrokerId?: string,
    status?: string,
    aladdinBrokerCode: string,
    lastUpdateDate: Date,
    lastUpdateBy?:string,
    active?:boolean
}

export type RequestMaintenanceBroker = {
    brokerName: string,
    brokerCode: string,
    masterBrokerId: string,
    aladdinBrokerCode: string,
    status: string,
    lastUpdateBy?:string
}

export interface MaintenanceUser {
    userId: number,
	userName: string,
	firstName: string,
	lastName: string,
	departmentId: number,
	divisionId: number,
	coopStaffCode: number,
	coopDptCode: number,
	jobCode: string,
	locationCode: string,
	costCenterCode: string,
	startDate: string,
	endDate: string,
	status: string,
	lastUpdateBy: string,
    active?:boolean
    admin?:boolean
}

export interface RequestMaintenanceUser {
    userId?: number,
	userName?: string,
	firstName: string,
	lastName: string,
	departmentId: number,
	divisionId: number,
	coopStaffCode: number,
	coopDptCode: number,
	jobCode: string,
	locationCode: string,
	costCenterCode: string,
	startDate: string,
	endDate: string,
	status: string,
	lastUpdateDate?: string,
	lastUpdateBy: string
}

export type MaintenancePortfolioGroup = {
    portfolioGroupId: number,
    portfolioGroupName: string,
    portfolioGroupCode: string,
    status: string,
    comment?: string,
    lastUpdateDate: Date,
    lastUpdateBy?:string,
    active?:boolean
}

export type RequestMaintenancePortfolioGroup = {
    portfolioGroupName: string,
    portfolioGroupCode: string,
    status: string,
    comment?: string,
    lastUpdateBy?:string
}

export type MaintenanceLocation = {
    locationId: number,
    locationCode:string,
    locationDescription: string,
    orgCode: string|undefined,
    comments: string|undefined,
    lastUpdateBy: string
}

export type MaintenanceAladBroker = {
    masterBrokerId: string,
    masterBrokerCode: string,
    masterBrokerName: string
}

export type MaintenancePortfolio = {
    portfolioId: number,
    portfolioCode: string,
    portfolioName: string,
    status: string,
    departmentId: number,
    departmentName: string,
    divisionId: number,
    divisionName: string,
    portfolioGroupId: number,
    portfolioNumber: string,
    lastUpdateBy: string
    lastUpdateDate?: Date,
    active?:boolean
}

export type RequestMaintenancePortfolio = {
    portfolioId?: number,
    portfolioCode: string,
    portfolioName: string,
    status: string,
    departmentId: number,
    departmentName: string,
    divisionId: number,
    divisionName: string,
    portfolioGroupId: number,
    portfolioNumber: string,
    lastUpdateBy: string
}

export type MaintenancePortfolioGroupXref = {
    portfolioGroupXrefId: number,
    portfolioGroupId: number,
    portfolioId: number,
    lastUpdateBy: string,
    lastUpdateDate: Date
}

export type RequestMaintenancePortfolioGroupXref = {
    portfolioGroupId: number,
    portfolioId: number,
    lastUpdateBy: string,
    lastUpdateDate?: Date
}

export type MaintenanceBrokerClass = {
    brokerClassId: number,
    brokerClassCode: string,
    brokerClassDescription: string,
    status: string,
    lastUpdateDate: Date,
    lastUpdateBy: string,
    active?:boolean
}

export type RequestMaintenanceBrokerClass = {
    brokerClassId?: number,
    brokerClassCode: string,
    brokerClassDescription: string,
    status: string,
    lastUpdateDate?: Date,
    lastUpdateBy: string,
    active?:boolean
}

export type MaintenanceBrokerGroup = {
    brokerGroupId: number,
    brokerGroupCode?: string,
    brokerGroupName: string,
    status: string,
    comment?: string,
    brokerClassCode?: string,
    lastUpdateDate: Date,
    lastUpdateBy: string,
    active?:boolean
}
export type RequestMaintenanceBrokerGroup = {
    brokerGroupId?: number,
    brokerGroupCode?: string,
    brokerGroupName: string,
    status: string,
    comment?: string,
    brokerClassCode?: string,
    lastUpdateDate?: Date,
    lastUpdateBy: string,
    active?:boolean
}

export type MaintenanceBrokerGroupXref = {
    brokerGroupXrefId: number,
    brokerId: number,
    brokerGroupId: number,
    lastUpdateDate: Date,
    lastUpdateBy: string
}

export type MaintenanceBrokerGroupMember = {
    brokerGroupMemberId: number,
    brokerGroupId: number,
    brokerCode: string,
    JoinedGroupAt: Date,
    lastUpdateBy: string
}
export type RequestMaintenanceBrokerGroupMember = {
    brokerGroupMemberId?: number,
    brokerGroupId: number,
    brokerCode: string,
    JoinedGroupAt?: Date,
    lastUpdateBy: string
}
export type MaintenanceDirectedRules = {
    directedRulesId: number,
    directedRulesCode: string,
    directedRulesName: string,
    comment: string,
    budgetPercent: number,
    lastUpdateDt: Date,
    lastUpdateBy: string
}

export type RequestMaintenanceDirectedRules = {
    directedRulesCode: string,
    directedRulesName: string,
    comment: string,
    budgetPercent: number,
    lastUpdateBy: string
}

export type MaintenanceDirectedRulesXref = {
    directedRulesXRefId: number,
    brokerCode: string,
    accountCode: string,
    directedRulesId: number,
    year: number,
    lastUpdateDt: Date,
    lastUpdateBy: string
}

export type RequestMaintenanceDirectedRulesXref = {
    brokerCode: string,
    accountCode: string,
    directedRulesId: number,
    year: number,
    lastUpdateDt?: Date,
    lastUpdateBy: string
}