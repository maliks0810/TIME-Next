import {   Card, Col,  Row,  } from "antd";
import {  Grid, Props } from "../../lib/types";
import { useCallback, useEffect, useState } from "react";
import { normalizeDispersionResponse } from "../../lib/helpers";
import { KpiGrid } from "../../components/kpi-card/KpiGrid";
import { api } from "../../lib/services";

export function useLoadingAggregator() {
  const [pending, setPending] = useState(0);

  const runWithLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setPending((p) => p + 1);
    try {
      return await fn();
    } finally {
      setPending((p) => Math.max(0, p - 1));
    }
  }, []);

  return { isLoading: pending > 0, runWithLoading };
}

export default function PMAHomePage({  }: Props)  {

  const [attributionDispersionData, setAtributionDispersionData] = useState<Grid[]>([]);
  const [attributionAborIborDispersionData, setAttributionAborIborDispersionData] = useState<Grid[]>([]);
  const { runWithLoading } = useLoadingAggregator();

    // Core Plus Attribution Dispersion
  useEffect(() => {
    let cancelled = false;

    runWithLoading(async () => {
      try {
        const resp = await api.requestCorePlusAttributionDispersonReportService();

        if (cancelled) return;

        const normalized = normalizeDispersionResponse(resp);
        setAtributionDispersionData(normalized?.data.grids ?? []);
      } catch {

      }
    });

    return () => { cancelled = true; };
  }, [runWithLoading]);

  // ABOR vs IBOR Dispersion
  useEffect(() => {
    let cancelled = false;

    runWithLoading(async () => {
      try {

        const resp = await api.requestAborvsIborReportService();

        if (cancelled) return;

        const normalized = normalizeDispersionResponse(resp);
        setAttributionAborIborDispersionData(normalized?.data.grids ?? []);
      } catch {
      }
    });

    return () => { cancelled = true; };
  }, [runWithLoading]);


	type Kpi = {
	title: string;
	subtitle: string;
	value: string;
	actionLink: string;
	status?: "success" | "warning" | "error";
	};


const kpis: Kpi[] = [
  {
    title: "ABOR vs. IBOR",
    subtitle: "Dispersion across ABOR and IBOR",
    value: `${attributionAborIborDispersionData.length}`,
    actionLink: "diagnostics",
    status:
      attributionAborIborDispersionData.length > 0
        ? "warning"
        : "success",
  },
  {
    title: "Attrib. Dispersion",
    subtitle: "Outliers in attribution dispersion",
    value: `${attributionDispersionData.length}`,
    actionLink: "diagnostics",
    status:
      attributionDispersionData.length > 0
        ? "warning"
        : "success",
  },
];


  return (
	<div style={{margin:'16px' }}>
	    <Card className="pa-card" title="Returns / Attribution Exceptions">
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <Card size="small" title="Diagnostics Review">
				      <KpiGrid kpis={kpis} />
            </Card>
          </Col>
        </Row>
      </Card>
	</div>
  );
}
