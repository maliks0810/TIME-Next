import { Col, Row } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import WelcomeBanner from "../../components/pma-home/WelcomeBanner";

import {
  FiReportSummaryResponse,
  Grid,
  Props,
} from "../../lib/types";

import { normalizeDispersionResponse } from "../../lib/helpers";
import { api } from "../../lib/services";
import { useUserInfo } from "@platform/utils";
import { getPersonaByRole, getRoleByOrg } from "../../lib/rbac/roles";

export function isFiReportSummaryResponse(
  data: unknown
): data is FiReportSummaryResponse {
  if (!data || typeof data !== "object") {
    return false;
  }

  const d = data as Record<string, unknown>;

  return (
    typeof d.asOfDate === "string" &&
    Array.isArray(d.portfolioNumbers) &&
    d.portfolioNumbers.every(
      (p) => typeof p === "string"
    ) &&
    typeof d.count === "number"
  );
}

export const EMPTY_FI_REPORT_SUMMARY: FiReportSummaryResponse = {
  asOfDate: "",
  portfolioNumbers: [],
  count: 0,
};

export function useLoadingAggregator() {
  const [pending, setPending] = useState(0);

  const runWithLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setPending((p) => p + 1);

      try {
        return await fn();
      } finally {
        setPending((p) => Math.max(0, p - 1));
      }
    },
    []
  );

  return {
    isLoading: pending > 0,
    runWithLoading,
  };
}

export default function PMAHomePage({}: Props) {
  const userInfo = useUserInfo();
  const { claims } = useUserInfo();
  const currentUser = useMemo(() => {
    let role = "";
    const resolvedRole = getRoleByOrg(claims?.OrgLevel4);
    role = resolvedRole;
    if(resolvedRole === undefined){
      const resolvedRole1 = getRoleByOrg(claims?.OrgLevel1);
    if(resolvedRole1 !== undefined)
      role = resolvedRole1;
    }

    return {
      firstName: userInfo.name,
      persona: getPersonaByRole(role),
      location: 'Los Angeles',
    };
  }, [userInfo]);

  const [
    attributionDispersionData,
    setAttributionDispersionData,
  ] = useState<Grid[]>([]);

  const [
    attributionAborIborDispersionData,
    setAttributionAborIborDispersionData,
  ] = useState<Grid[]>([]);

  const [
    monthlyFIReturnsData,
    setMonthlyFIReturnsData,
  ] = useState<FiReportSummaryResponse>(
    EMPTY_FI_REPORT_SUMMARY
  );

  const { runWithLoading } = useLoadingAggregator();

  /**
   * Core Plus Attribution Dispersion
   */
  useEffect(() => {
    let cancelled = false;

    runWithLoading(async () => {
      try {
        const resp =
          await api.requestCorePlusAttributionDispersonReportService();

        if (cancelled) {
          return;
        }

        const normalized =
          normalizeDispersionResponse(resp);

        setAttributionDispersionData(
          normalized?.data.grids ?? []
        );
      } catch {
        setAttributionDispersionData([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [runWithLoading]);

  /**
   * ABOR vs IBOR Dispersion
   */
  useEffect(() => {
    let cancelled = false;

    runWithLoading(async () => {
      try {
        const resp =
          await api.requestAborvsIborReportService();

        if (cancelled) {
          return;
        }

        const normalized =
          normalizeDispersionResponse(resp);

        setAttributionAborIborDispersionData(
          normalized?.data.grids ?? []
        );
      } catch {
        setAttributionAborIborDispersionData([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [runWithLoading]);

  /**
   * Monthly FI Returns
   */
  useEffect(() => {
    let cancelled = false;

    runWithLoading(async () => {
      try {
        const resp =
          await api.requestFIReportLatestSummaryService();

        if (cancelled) {
          return;
        }

        if (isFiReportSummaryResponse(resp)) {
          setMonthlyFIReturnsData(resp);
        } else {
          setMonthlyFIReturnsData(
            EMPTY_FI_REPORT_SUMMARY
          );
        }
      } catch {
        setMonthlyFIReturnsData(
          EMPTY_FI_REPORT_SUMMARY
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [runWithLoading]);

  /**
   * Temporary value.
   * Eventually comes from Recent Analyses API
   */
  const activeAnalyses = 3;

  const bannerKpis = useMemo(
    () => [
      {
        title: "ABOR vs IBOR",
        value:
          attributionAborIborDispersionData.length,
      },
      {
        title: "Attrib. Dispersion",
        value:
          attributionDispersionData.length,
      },
      {
        title: "Monthly Returns",
        value: monthlyFIReturnsData.count,
      },
      {
        title: "Portfolios",
        value:
          monthlyFIReturnsData
            .portfolioNumbers.length,
      },
    ],
    [
      attributionAborIborDispersionData,
      attributionDispersionData,
      monthlyFIReturnsData,
    ]
  );

  return (
    <div
      style={{
        margin: 16,
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <WelcomeBanner
            userName={currentUser.firstName ?? ""}
            persona={currentUser.persona}
            location={currentUser.location}
            assignedPortfolios={
              monthlyFIReturnsData
                .portfolioNumbers.length
            }
            activeAnalyses={activeAnalyses}
            kpis={bannerKpis}
          />
        </Col>

        {/*
          Next widgets to add:

          <QuickActions />

          <RecentAnalysesCard />

          <PortfolioAssignmentsCard />

          <SavedViewsCard />

          <AlertsCard />
        */}
      </Row>
    </div>
  );
}