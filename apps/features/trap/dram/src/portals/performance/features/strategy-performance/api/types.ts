import { FlatPerformanceRecord } from "../model/mappers";

export type KpiTone = "success" | "error" | "default";

export type KpiCardItem = {
 key: string;
 title: string;
 value: number;
 tone: KpiTone;
 helper: string;
};

export type Highlights = {
 best?: SnapshotHorizon;
 worst?: SnapshotHorizon;
 largestSpread?: SnapshotHorizon;
};

export type MatrixRow = {
  key: "NET" | "BENCH" | "SPREAD";
  metric: string;
  values: Record<string, number>;
};
export type SnapshotHorizon = {
  key: string;
  label: string;
  netReturn: number | null;
  benchReturn: number | null;
};


export type PerformanceSnapshotItem = {
  shareClassKey: string;
  asOfDate: string;
  portfolioName: string;
  horizons: SnapshotHorizon[];
};

export type PerformanceSnapshotApiResponse = PerformanceSnapshotItem[];


export type DRAMApiResponse = {
  readonly message: string;
  readonly data: {
    readonly metadata: {
      readonly page_title: string;
      readonly value_date: string;
      readonly grid_count: number;
      readonly request_id: string | null;
      readonly timestamp: string;
    };
    readonly grids: ReadonlyArray<{
      readonly title: string;
      readonly rows: ReadonlyArray<FlatPerformanceRecord>;
    }>;
  };
};
