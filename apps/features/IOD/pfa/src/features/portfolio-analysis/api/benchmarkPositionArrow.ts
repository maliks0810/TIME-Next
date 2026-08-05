import { tableFromIPC, type Table, type Vector } from "apache-arrow";
import type { BenchmarkPositionAnalytics } from "../types";
import { fetchPfaArrowBuffer } from "./pfaFetch";

type ArrowColumn = Vector | null;

type BenchmarkArrowColumns = {
  asOfDate: Vector;
  benchmarkKey: ArrowColumn;
  legacyBenchmarkCode: ArrowColumn;
  universeTypeCode: ArrowColumn;
  securityKey: Vector;
  ticker: ArrowColumn;
  currentFace: Vector;
  marketValuePercentage: Vector;
  usdMarketValue: Vector;
  durationContribution: Vector;
  tcwCoreLevel1: ArrowColumn;
  tcwCoreLevel2: ArrowColumn;
  tcwCoreLevel3: ArrowColumn;
  tcwCoreLevel4: ArrowColumn;
  tcwCoreLevel5: ArrowColumn;
  tcwCoreLevel6: ArrowColumn;
  tcwCoreLevel7: ArrowColumn;
};

type ArrowSchemaField = {
  name: string;
  type: string;
  nullable: boolean;
};

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause ? ` Cause: ${describeError(error.cause)}` : "";
    return `${error.name}: ${error.message}${cause}`;
  }
  return String(error);
}

function schemaFields(table: Table): ArrowSchemaField[] {
  return table.schema.fields.map((field) => ({
    name: field.name,
    type: field.type.toString(),
    nullable: field.nullable,
  }));
}

function schemaSummary(table: Table): string {
  return schemaFields(table)
    .map((field) => `${field.name}:${field.type}${field.nullable ? "?" : ""}`)
    .join(", ");
}

function findColumn(
  table: Table,
  candidateNames: readonly string[],
): ArrowColumn {
  for (const name of candidateNames) {
    const column = table.getChild(name);
    if (column) return column;
  }
  return null;
}

function requireColumn(table: Table, ...candidateNames: string[]): Vector {
  const column = findColumn(table, candidateNames);
  if (column) return column;

  throw new Error(
    `Benchmark Arrow column not found. Expected one of: ${candidateNames.join(", ")}. ` +
      `Available fields: ${schemaSummary(table)}`,
  );
}

function optionalColumn(
  table: Table,
  ...candidateNames: string[]
): ArrowColumn {
  return findColumn(table, candidateNames);
}

function readColumns(table: Table): BenchmarkArrowColumns {
  return {
    asOfDate: requireColumn(table, "AS_OF_DATE", "asOfDate"),
    benchmarkKey: optionalColumn(table, "BENCHMARK_KEY", "benchmarkKey"),
    legacyBenchmarkCode: optionalColumn(
      table,
      "LEGACY_BENCHMARK_CODE",
      "legacyBenchmarkCode",
    ),
    universeTypeCode: optionalColumn(
      table,
      "UNIVERSE_TYPE_CODE",
      "universeTypeCode",
    ),
    securityKey: requireColumn(table, "SECURITY_KEY", "securityKey"),
    ticker: optionalColumn(table, "TICKER", "ticker"),
    currentFace: requireColumn(table, "CURRENT_FACE", "currentFace"),
    marketValuePercentage: requireColumn(
      table,
      "MARKET_VALUE_PERCENTAGE",
      "marketValuePercentage",
    ),
    usdMarketValue: requireColumn(table, "USD_MARKET_VALUE", "usdMarketValue"),
    durationContribution: requireColumn(
      table,
      "DURATION_CONTRIBUTION",
      "durationContribution",
    ),
    tcwCoreLevel1: optionalColumn(table, "TCW_CORE_LEVEL1", "tcwCoreLevel1"),
    tcwCoreLevel2: optionalColumn(table, "TCW_CORE_LEVEL2", "tcwCoreLevel2"),
    tcwCoreLevel3: optionalColumn(table, "TCW_CORE_LEVEL3", "tcwCoreLevel3"),
    tcwCoreLevel4: optionalColumn(table, "TCW_CORE_LEVEL4", "tcwCoreLevel4"),
    tcwCoreLevel5: optionalColumn(table, "TCW_CORE_LEVEL5", "tcwCoreLevel5"),
    tcwCoreLevel6: optionalColumn(table, "TCW_CORE_LEVEL6", "tcwCoreLevel6"),
    tcwCoreLevel7: optionalColumn(table, "TCW_CORE_LEVEL7", "tcwCoreLevel7"),
  };
}

function readArrowValue(
  column: ArrowColumn,
  fieldName: string,
  rowIndex: number,
): unknown {
  if (!column) return null;

  try {
    return column.get(rowIndex);
  } catch (error) {
    throw new Error(
      `Benchmark Arrow field read failed. ` +
        `field=${fieldName}, row=${rowIndex}, type=${column.type.toString()}. ` +
        `${describeError(error)}`,
      { cause: error },
    );
  }
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function toRequiredString(
  value: unknown,
  fieldName: string,
  rowIndex: number,
): string {
  const result = toNullableString(value)?.trim() ?? "";
  if (result) return result;
  throw new Error(
    `Benchmark Arrow field is empty. field=${fieldName}, row=${rowIndex}.`,
  );
}

function decimalScale(column: Vector): number | null {
  const type = column.type as unknown as { scale?: unknown };
  return typeof type.scale === "number" ? type.scale : null;
}

function scaledIntegerToNumber(rawValue: string, scale: number): number {
  const trimmed = rawValue.trim();
  const match = /^([+-]?)(\d+)$/.exec(trimmed);
  if (!match) {
    throw new Error(`Unexpected Arrow decimal value: ${rawValue}`);
  }

  const sign = match[1] === "-" ? "-" : "";
  const digits = match[2].replace(/^0+(?=\d)/, "");
  let logicalValue: string;

  if (scale === 0) {
    logicalValue = `${sign}${digits}`;
  } else if (scale > 0) {
    const padded = digits.padStart(scale + 1, "0");
    const integerPart = padded.slice(0, -scale);
    const fractionalPart = padded.slice(-scale);
    logicalValue = `${sign}${integerPart}.${fractionalPart}`;
  } else {
    logicalValue = `${sign}${digits}${"0".repeat(-scale)}`;
  }

  const numericValue = Number(logicalValue);
  if (!Number.isFinite(numericValue)) {
    throw new Error(
      `Arrow decimal is outside the JavaScript number range: ${logicalValue}`,
    );
  }

  return numericValue;
}

function toNullableNumber(
  value: unknown,
  column: Vector,
  fieldName: string,
  rowIndex: number,
): number | null {
  if (value === null || value === undefined || value === "") return null;

  const scale = decimalScale(column);
  if (scale !== null) {
    try {
      // Arrow Decimal values are fixed-point scaled integers. Convert through the
      // exact decimal string so the raw 128-bit value is never coerced directly
      // to Number before applying the schema scale.
      return scaledIntegerToNumber(String(value), scale);
    } catch (error) {
      throw new Error(
        `Benchmark Arrow decimal conversion failed. ` +
          `field=${fieldName}, row=${rowIndex}, arrowType=${column.type.toString()}, ` +
          `scale=${scale}, rawValue=${String(value)}. ${describeError(error)}`,
        { cause: error },
      );
    }
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return numericValue;

  throw new Error(
    `Benchmark Arrow numeric conversion failed. ` +
      `field=${fieldName}, row=${rowIndex}, arrowType=${column.type.toString()}, ` +
      `value=${String(value)}, runtimeType=${typeof value}.`,
  );
}

function toDateOnly(
  value: unknown,
  fieldName: string,
  rowIndex: number,
): string {
  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number" || typeof value === "bigint") {
    const numericValue = Number(value);
    const milliseconds =
      Math.abs(numericValue) < 1_000_000
        ? numericValue * 86_400_000
        : numericValue;
    const date = new Date(milliseconds);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }

  const text = String(value ?? "").trim();
  if (text.length >= 10) return text.slice(0, 10);

  throw new Error(
    `Benchmark Arrow date conversion failed. ` +
      `field=${fieldName}, row=${rowIndex}, value=${String(value)}, ` +
      `runtimeType=${typeof value}.`,
  );
}

export function decodeBenchmarkPositionArrow(
  payload: ArrayBuffer | Uint8Array,
): BenchmarkPositionAnalytics[] {
  const bytes =
    payload instanceof Uint8Array ? payload : new Uint8Array(payload);

  let table: Table;
  try {
    table = tableFromIPC(bytes);
  } catch (error) {
    throw new Error(
      `Benchmark Arrow IPC decoding failed. byteLength=${bytes.byteLength}. ` +
        `${describeError(error)}`,
      { cause: error },
    );
  }

  const fields = schemaFields(table);
  console.info("[Benchmark Arrow] IPC decoded", {
    byteLength: bytes.byteLength,
    rowCount: table.numRows,
    fields,
  });
  console.table(fields);

  const columns = readColumns(table);
  const rows = new Array<BenchmarkPositionAnalytics>(table.numRows);

  for (let index = 0; index < table.numRows; index += 1) {
    try {
      rows[index] = {
        asOfDate: toDateOnly(
          readArrowValue(columns.asOfDate, "AS_OF_DATE", index),
          "AS_OF_DATE",
          index,
        ),
        benchmarkKey: toNullableString(
          readArrowValue(columns.benchmarkKey, "BENCHMARK_KEY", index),
        ),
        legacyBenchmarkCode: toNullableString(
          readArrowValue(
            columns.legacyBenchmarkCode,
            "LEGACY_BENCHMARK_CODE",
            index,
          ),
        ),
        universeTypeCode: toNullableString(
          readArrowValue(columns.universeTypeCode, "UNIVERSE_TYPE_CODE", index),
        ),
        securityKey: toRequiredString(
          readArrowValue(columns.securityKey, "SECURITY_KEY", index),
          "SECURITY_KEY",
          index,
        ),
        ticker: toNullableString(
          readArrowValue(columns.ticker, "TICKER", index),
        ),
        currentFace: toNullableNumber(
          readArrowValue(columns.currentFace, "CURRENT_FACE", index),
          columns.currentFace,
          "CURRENT_FACE",
          index,
        ),
        marketValuePercentage: toNullableNumber(
          readArrowValue(
            columns.marketValuePercentage,
            "MARKET_VALUE_PERCENTAGE",
            index,
          ),
          columns.marketValuePercentage,
          "MARKET_VALUE_PERCENTAGE",
          index,
        ),
        usdMarketValue: toNullableNumber(
          readArrowValue(columns.usdMarketValue, "USD_MARKET_VALUE", index),
          columns.usdMarketValue,
          "USD_MARKET_VALUE",
          index,
        ),
        durationContribution: toNullableNumber(
          readArrowValue(
            columns.durationContribution,
            "DURATION_CONTRIBUTION",
            index,
          ),
          columns.durationContribution,
          "DURATION_CONTRIBUTION",
          index,
        ),
        tcwCoreLevel1: toNullableString(
          readArrowValue(columns.tcwCoreLevel1, "TCW_CORE_LEVEL1", index),
        ),
        tcwCoreLevel2: toNullableString(
          readArrowValue(columns.tcwCoreLevel2, "TCW_CORE_LEVEL2", index),
        ),
        tcwCoreLevel3: toNullableString(
          readArrowValue(columns.tcwCoreLevel3, "TCW_CORE_LEVEL3", index),
        ),
        tcwCoreLevel4: toNullableString(
          readArrowValue(columns.tcwCoreLevel4, "TCW_CORE_LEVEL4", index),
        ),
        tcwCoreLevel5: toNullableString(
          readArrowValue(columns.tcwCoreLevel5, "TCW_CORE_LEVEL5", index),
        ),
        tcwCoreLevel6: toNullableString(
          readArrowValue(columns.tcwCoreLevel6, "TCW_CORE_LEVEL6", index),
        ),
        tcwCoreLevel7: toNullableString(
          readArrowValue(columns.tcwCoreLevel7, "TCW_CORE_LEVEL7", index),
        ),
      };
    } catch (error) {
      throw new Error(
        `Benchmark Arrow row conversion failed. row=${index}. ` +
          `${describeError(error)}`,
        { cause: error },
      );
    }
  }

  console.info("[Benchmark Arrow] row conversion completed", {
    rowCount: rows.length,
  });

  return rows;
}

export async function fetchBenchmarkPositionArrow(
  url: string,
  signal?: AbortSignal,
): Promise<BenchmarkPositionAnalytics[]> {
  const payload = await fetchPfaArrowBuffer(url, {
    signal,
    includeAuthorization: false,
    credentials: "omit",
  });

  try {
    return decodeBenchmarkPositionArrow(payload);
  } catch (error) {
    console.error("[Benchmark Arrow] conversion failed", {
      url,
      byteLength: payload.byteLength,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorCause:
        error instanceof Error && error.cause
          ? describeError(error.cause)
          : undefined,
    });
    throw error;
  }
}
