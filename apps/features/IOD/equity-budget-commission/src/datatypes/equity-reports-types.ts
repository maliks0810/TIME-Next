export const ReportsList = [
  { value: 'R1',  name: 'COB - Commission Trades Report' },
  { value: 'R2',  name: 'COB - Commission Usage Brokers X Divisions' },
  { value: 'R3',  name: 'COB - Commission Usage by Division' },
  { value: 'R4',  name: 'COB - Commission Usage by Account' },
  { value: 'R5',  name: 'COB - Commission Usage by Broker' },
  { value: 'R6',  name: 'COB - Commission Usage by Department' },
  { value: 'R7',  name: 'COB - Commission Summary by Account Group' },
  { value: 'R8',  name: 'COB - Commission Summary by Broker Group' },
  { value: 'R9',  name: 'COB - Commission Trades Report By Account' },
  { value: 'R10', name: 'COB - Commission Trades Report by Broker' },
  { value: 'R11', name: 'COB - Soft Dollar Commission Analysis by Account' },
  { value: 'R12', name: 'COB - Soft Dollar Commission Analysis by Division' },
  { value: 'R13', name: 'COB - Proprietery Research Budget by Division' },
  { value: 'R14', name: 'COB - Directed By Strategy' },
  { value: 'R15', name: 'COB - Derivatives and Options Commission' },
  { value: 'R16', name: 'COB - CSA Credit Reconciliation Detail' },
  { value: 'R17', name: 'COB - CSA Credit Reconciliation Summary' },
  { value: 'R18', name: 'COB - CSA Full BreakDown' },
  { value: 'R19', name: 'COB - Relative Value Trades Report' },
  
];

export type Report = {
  rptCode: string,
  rptName: string,
  rptHeight: string
}

export const Reports: Report[] = [
  { rptCode: 'R1',  rptName: 'COB - Commission Trades Report', rptHeight: '950'},
  { rptCode: 'R2',  rptName: 'COB - Commission Usage Brokers X Divisions', rptHeight: '950' },
  { rptCode: 'R3',  rptName: 'COB - Commission Usage by Division', rptHeight: '950' },
  { rptCode: 'R4',  rptName: 'COB - Commission Usage by Account', rptHeight: '950' },
  { rptCode: 'R5',  rptName: 'COB - Commission Usage by Broker', rptHeight: '950' },
  { rptCode: 'R6',  rptName: 'COB - Commission Usage by Department', rptHeight: '950' },
  { rptCode: 'R7',  rptName: 'COB - Commission Summary by Account Group', rptHeight: '950' },
  { rptCode: 'R8',  rptName: 'COB - Commission Summary by Broker Group', rptHeight: '950' },
  { rptCode: 'R9',  rptName: 'COB - Commission Trades Report By Account', rptHeight: '950' },
  { rptCode: 'R10', rptName: 'COB - Commission Trades Report by Broker', rptHeight: '950' },
  { rptCode: 'R11', rptName: 'COB - Soft Dollar Commission Analysis by Account', rptHeight: '950' },
  { rptCode: 'R12', rptName: 'COB - Soft Dollar Commission Analysis by Division', rptHeight: '950' },
  { rptCode: 'R13', rptName: 'COB - Proprietery Research Budget by Division', rptHeight: '950' },
  { rptCode: 'R14', rptName: 'COB - Directed By Strategy', rptHeight: '950' },
  { rptCode: 'R15', rptName: 'COB - Derivatives and Options Commission', rptHeight: '950' },
  { rptCode: 'R16', rptName: 'COB - CSA Credit Reconciliation Detail', rptHeight: '950' },
  { rptCode: 'R17', rptName: 'COB - CSA Credit Reconciliation Summary', rptHeight: '950' },
  { rptCode: 'R18', rptName: 'COB - CSA Full BreakDown', rptHeight: '950' },
  { rptCode: 'R19', rptName: 'COB - Relative Value Trades Report', rptHeight: '950' },
]