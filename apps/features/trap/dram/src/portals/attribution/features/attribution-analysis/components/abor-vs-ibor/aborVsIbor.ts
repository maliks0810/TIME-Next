export interface AborVsIborMtdRow {
  portfolioId: string;
  portfolioName: string;
  mtdAbor: number;
  mtdAborCfAdj: number;
  mtdIbor: number;
  bomNav: number;
  mtdCf: number;
  mtdCfBomNavPct: number;
  mtdAborMinusMtdAborCfAdj: number;
  mtdAborCfAdjMinusMtdIbor: number;
  tolerance: number;
  flag: number;
  gridTitle: string;
  isTotalRow?: boolean;
}

export interface AborVsIborDailyRow {
  portfolioId: string;
  asOfDate: string;
  mv: number;
  mtdIbor: number;
  dayIbor: number;
  bodNav: number;
  eodNav: number;
  eodTotCf: number;
  eodNavCfAdj: number;
  mtdAbor: number;
  dayAbor: number;
  mtdAborMinusIborBp: number;
  dayAborMinusIborBp: number;
  gridTitle: string;
  isTotalRow?: boolean;
}