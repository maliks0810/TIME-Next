/* eslint-disable @typescript-eslint/no-explicit-any */
import "devextreme/dist/css/dx.light.css";
import "../../../../../lib/styles.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Segmented } from "antd";
import DataGrid, {
  Column,
  Grouping,
  GroupPanel,
  LoadPanel,
  Paging,
  Scrolling,
  SearchPanel,
} from "devextreme-react/data-grid";
import FormatPercent, {
  formatDate,
  formatAnalystPerformanceLabel,
} from "../../../lib/helpers";
import { ClientSideExport } from "./ClientSideExport";
import { RecommendationItem } from "../../analyst-buylist/lib/types";
import { getBuyList, getDroppedList } from "../../../../../lib/services";

type GridRow = RecommendationItem & { droppedDate?: string };

export default function AnalystBuyListDataGrid() {
  const [data, setData] = useState<GridRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runDate, setRunDate] = useState("");
  const [listType, setListType] = useState<"Buy List" | "Dropped List">(
    "Buy List"
  );

  const handleSegmentChange = (value: string) => {
    setListType(value as "Buy List" | "Dropped List");
  };

  const normalize = useCallback(
    (item: any): GridRow => ({
      sector: item.sector,
      industry: item.industry,
      analyst: formatAnalystPerformanceLabel(item.analyst),
      ticker: String(item.ticker ?? "").toUpperCase(),
      securityName: item.securityName,
      marketCap: item.marketCap,
      currentPrice: item.currentPrice,
      targetPrice: item.targetPrice,
      esgScore: item.esgScore,
      upside: item.upside,
      buyRecDate: formatDate(item.buyRecDate),
      ytdPerformance: item.ytdPerformance,
      portfolioCount: item.portfolioCount,
      tcwDollarExposure: item.tcwDollarExposure,
      portfolios: item.portfolios,
      droppedDate: item.droppedDate,
    }),
    []
  );

  const fetchBuyList = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await getBuyList();
      const now = new Date();
      setRunDate(formatDate(now.toString()));

      const items = (resp.data as any).equitiesAnalystBuyList.results.results;
      const json: GridRow[] = items.map((item: any) => normalize(item));
      setData(json);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.warn(`An error has occurred receiving the buy list: ${e}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [normalize]);

  const fetchDroppedList = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await getDroppedList();
      const now = new Date();
      setRunDate(formatDate(now.toString()));

      const items = (resp.data as any).equitiesAnalystDropList.results.results;
      const json: GridRow[] = items.map((item: any) => ({
        ...normalize(item),
        droppedDate: formatDate(item.removedDate),
      }));
      setData(json);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.warn(`An error has occurred receiving the dropped list: ${e}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    if (listType === "Buy List") fetchBuyList();
    else fetchDroppedList();
  }, [listType, fetchBuyList, fetchDroppedList]);

  const onCellPrepared = (e: any) => {
    if (e.rowType === "data" && e.column.dataField === "ticker") {
      e.cellElement.style.fontWeight = "bold";
    }

    if (
      e.rowType === "group" &&
      ["analyst", "sector", "industry"].includes(e.column.dataField)
    ) {
      const colonIndex = e.cellElement.textContent.indexOf(":");
      if (colonIndex !== -1) {
        e.cellElement.textContent = e.cellElement.textContent
          .substring(colonIndex + 1)
          .trim();
      }
    }

    if (e.rowType === "header") {
      e.cellElement.style.textAlign = "center";
    }

    const rightAligned = [
      "marketCap",
      "currentPrice",
      "targetPrice",
      "esgScore",
      "upside",
      "ytdPerformance",
      "portfolioCount",
      "tcwDollarExposure",
      "buyRecDate",
      "droppedDate",
    ];

    if (e.rowType === "data" && rightAligned.includes(e.column.dataField)) {
      e.cellElement.style.textAlign = "right";
    }

    if (
      e.rowType === "data" &&
      ["upside", "ytdPerformance"].includes(e.column.dataField)
    ) {
      const value = parseFloat(e.value);
      if (!isNaN(value)) {
        if (value > 0) e.cellElement.style.color = "#175340";
        else if (value < 0) e.cellElement.style.color = "#A33A29";
      }
    }
  };

  const title = useMemo(
    () =>
      listType === "Buy List"
        ? "US Equity Research Department - Analyst Buy List"
        : "US Equity Research Department - Dropped from Buy List",
    [listType]
  );

  return (
    <div style={{ margin: "24px 3%" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ opacity: 0.8 }}>As of {runDate}</div>
          <Segmented
            options={["Buy List", "Dropped List"]}
            value={listType}
            onChange={handleSegmentChange}
          />
          <ClientSideExport data={data} runDate={runDate} />
        </div>
      </div>

      <DataGrid
        className="analyst-coverage-datagrid analyst-coverage-headers"
        dataSource={data}
        showBorders={false}
        showColumnLines={false}
        showRowLines={false}
        allowColumnReordering
        rowAlternationEnabled={true}
        onCellPrepared={onCellPrepared}
        height={`calc(90vh - var(--main-header-height))`}
      >
        <Scrolling mode="virtual" />
        <SearchPanel visible={true} />
        <GroupPanel visible={true} />
        <Grouping autoExpandAll={false} />
        <Paging enabled={false} />

        <Column dataField="sector" groupIndex={0} />
        <Column dataField="industry" caption="Industry" dataType="string" />
        <Column width={"6%"} dataField="analyst" caption="Analyst" dataType="string" />
        <Column width={"7%"} dataField="ticker" dataType="string" />
        <Column width={"12%"} dataField="securityName" caption="Company" dataType="string" />

        <Column
          width={"8%"}
          dataField="marketCap"
          caption="ignored"
          headerCellRender={() => (
            <div style={{ textAlign: "center" }}>
              Market <br />
              Cap $MM
            </div>
          )}
          calculateCellValue={(row) => Number((row as any).marketCap)}
          cellRender={({ value }) =>
            value?.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }
        />

        <Column
          width={"8%"}
          dataField="currentPrice"
          caption="Current Price"
          dataType="number"
          format={{
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }}
          calculateCellValue={(row) => Number((row as any).currentPrice)}
        />

        <Column
          width={"8%"}
          dataField="targetPrice"
          caption="Target Price"
          dataType="number"
          format={{
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }}
          calculateCellValue={(row) => Number((row as any).targetPrice)}
        />

        <Column
          width={"6%"}
          dataField="esgScore"
          caption="ignored"
          headerCellRender={() => (
            <div style={{ textAlign: "center" }}>
              ESG <br />
              Score
            </div>
          )}
          dataType="number"
          format={{ maximumFractionDigits: 1 }}
          calculateCellValue={(row) => Number((row as any).esgScore)}
        />

        <Column
          width={"6%"}
          dataField="upside"
          caption="Upside %"
          dataType="number"
          calculateCellValue={(row) => Number((row as any).upside)}
          cellRender={({ value }) => <FormatPercent value={value} />}
        />

        <Column
          width={"8%"}
          dataField="buyRecDate"
          caption="Buy Rec. Date"
          dataType="date"
          format="MM/dd/yyyy"
          calculateCellValue={(row) =>
            (row as any).buyRecDate ? new Date((row as any).buyRecDate) : null
          }
        />

        <Column
          width={"7%"}
          dataField="ytdPerformance"
          caption="YTD %"
          dataType="number"
          calculateCellValue={(row) => Number((row as any).ytdPerformance)}
          cellRender={({ value }) => <FormatPercent value={value} />}
        />

        <Column
          width={"8%"}
          dataField="portfolioCount"
          caption="No. Portfolios"
          dataType="number"
          calculateCellValue={(row) => Number((row as any).portfolioCount)}
        />

        <Column
          width={"10%"}
          dataField="tcwDollarExposure"
          caption="ignored"
          headerCellRender={() => (
            <div style={{ textAlign: "center" }}>
              TCW <br />
              Exposure
            </div>
          )}
          dataType="number"
          format={{
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }}
          calculateCellValue={(row) => Number((row as any).tcwDollarExposure)}
        />

        <Column
          width={"20%"}
          dataField="portfolios"
          caption="Portfolios"
          dataType="string"
        />

        <Column
          width={"9%"}
          dataField="droppedDate"
          caption="Dropped Date"
          dataType="date"
          format="MM/dd/yyyy"
          calculateCellValue={(row) =>
            (row as any).droppedDate ? new Date((row as any).droppedDate) : null
          }
          visible={listType === "Dropped List"}
        />

        <LoadPanel enabled={isLoading} />
      </DataGrid>
    </div>
  );
}