import { buildDram2UrlNonAttribution } from "../../lib/services";
import type {
  FinancingBatchApiResponse,
  FinancingBatchDto,
  FinancingErrorDto,
  FinancingIngestResponse,
  FinancingMonthlyApiResponse,
  FinancingMonthlyRow,
  FinancingSourceType,
  FinancingSummaryRow,
} from "./types";

const toQuery = (params: Record<string, string | number | undefined | null>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
};

const assertOk = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
};


export const FinancingIngestionApi = {
  async ingest(sourceType: FinancingSourceType, file: File): Promise<FinancingIngestResponse> {
    const formData = new FormData();
    formData.append("source_type", sourceType);
    formData.append("file", file);

    const response = await fetch(buildDram2UrlNonAttribution("/api/v1/ingestion/financing/upload/"), {
      method: "POST",
      body: formData,
    });
    await assertOk(response);
    return response.json() as Promise<FinancingIngestResponse>;
  },

  async listBatches(limit = 50): Promise<FinancingBatchDto[]> {
    const response = await fetch(
      buildDram2UrlNonAttribution(
        `/api/v1/ingestion/financing/batches/${toQuery({ limit })}`
      )
    );

    await assertOk(response);

    const result = (await response.json()) as FinancingBatchApiResponse;

    if (
      !result.data ||
      !Array.isArray(result.data.grids) ||
      result.data.grids.length === 0 ||
      !Array.isArray(result.data.grids[0].rows)
    ) {
      return [];
    }

    return result.data.grids[0].rows;
  },

  async getErrors(batchId: string, limit = 500): Promise<FinancingErrorDto[]> {
    const response = await fetch(buildDram2UrlNonAttribution(`/api/v1/ingestion//financing/${batchId}/errors/${toQuery({ limit })}`));
    await assertOk(response);

    return response.json() as Promise<FinancingErrorDto[]>;
  },

  async getMonthly(params: {
    sourceType?: FinancingSourceType;
    portfolioKey?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<FinancingMonthlyRow[]> {
    const response = await fetch(
      buildDram2UrlNonAttribution(`/api/performance/financing/monthly/${toQuery({
        source_type: params.sourceType,
        portfolio_key: params.portfolioKey,
        start_date: params.startDate,
        end_date: params.endDate,
        limit: params.limit ?? 500,
      })}`),
    );
    await assertOk(response);

      const result = (await response.json()) as FinancingMonthlyApiResponse;

      if (
        !result.data ||
        !Array.isArray(result.data.grids) ||
        result.data.grids.length === 0 ||
        !Array.isArray(result.data.grids[0].rows)
      ) {
        return [];
      }

      return result.data.grids[0].rows;
  },

  async getSummary(params: {
    sourceType?: FinancingSourceType;
    startDate?: string;
    endDate?: string;
  }): Promise<FinancingSummaryRow[]> {
    const response = await fetch(
      buildDram2UrlNonAttribution(`/api/performance/financing/monthly/summary/${toQuery({
        source_type: params.sourceType,
        start_date: params.startDate,
        end_date: params.endDate,
      })}`),
    );
    await assertOk(response);
    return response.json() as Promise<FinancingSummaryRow[]>;
  },
};
