import React from "react";
import { Button, Card, Col, Layout, Row, Segmented, Space, Tag, Typography, message } from "antd";
import { DownloadOutlined, FilterOutlined, GroupOutlined, ReloadOutlined, SettingOutlined, ThunderboltOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { DriverControlDrawer } from "./DriverControlDrawer";
import { DriverResultsPanel, type DriverGridViewMode } from "./DriverResultsPanel";
import { runDriverAnalysis } from "./driverMockApi";
import type { DriverAnalysisFormState, DriverAnalysisResult } from "./driverTypes";
import { createSavedView, loadFavoriteViewId, loadSavedViews, persistFavoriteViewId, persistSavedViews, type DriverSavedView } from "./savedViewsStorage";
import type { DriverColumnConfigState } from "./columnConfigTypes";
import {
  buildDefaultColumnConfigFromCatalog,
  getDefaultAttributionDimensionsFromConfig,
  getMetricByName,
  loadDriverAnalysisConfig,
  type DriverAnalysisConfigResponse
} from "./api/configApi";


const { Content } = Layout;
const { Text, Title } = Typography;

const defaultFormState: DriverAnalysisFormState = {
  portfolioId: "6614T",
  portfolioIds: ["6614T"],
  asOfDate: "2026-05-17",
  periods: ["MTD", "QTD", "YTD"],
  groupBy: ["sector"],
  displayNameField: "sector",
  metric: { name: "total_effect", label: "Total Effect", format: "bps" },
  top: { enabled: true, limit: 10 },
  bottom: { enabled: true, limit: 10 },
  includeComponents: ["allocation_effect", "selection_effect", "interaction_effect"],
  filters: { assetClass: [], currency: [], country: [], sector: [] },
  minimumAbsoluteValue: 0.000001,
  attributionAnalysis: {
    enabled: true,
    assetClass: "equity",
    dimensions: ["sector", "industry", "security"],
    effects: ["allocation_effect", "selection_effect", "interaction_effect", "total_effect"],
    viewMode: "summary"
  },
  datasetSource: {
    type: "platform",
    endpoint: {
      url: "",
      method: "POST",
      headersJson: '{"Content-Type":"application/json"}',
      bodyJson: '{"portfolioIds":["6614T"],"portfolioId":"6614T","asOfDate":"2026-05-17","periods":["MTD","QTD","YTD"]}',
      authMode: "none"
    }
  }
};

function normalizeFormState(state: DriverAnalysisFormState): DriverAnalysisFormState {
  const portfolioIds = state.portfolioIds?.length ? state.portfolioIds : [state.portfolioId || "6614T"];
  return {
    ...defaultFormState,
    ...state,
    portfolioId: portfolioIds[0],
    portfolioIds,
    attributionAnalysis: {
      ...defaultFormState.attributionAnalysis,
      ...state.attributionAnalysis
    },
    datasetSource: {
      ...defaultFormState.datasetSource,
      ...state.datasetSource
    }
  };
}

export function DriverAnalysisWorkspace() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<DriverAnalysisFormState>(defaultFormState);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<DriverAnalysisResult>();
  const [gridViewMode, setGridViewMode] = React.useState<DriverGridViewMode>("period");
  const [columnConfig, setColumnConfig] = React.useState<DriverColumnConfigState>({
    availableColumns: [],
    selectedColumns: []
  });
  const [savedViews, setSavedViews] = React.useState<DriverSavedView[]>(() => loadSavedViews());
  const [activeSavedViewId, setActiveSavedViewId] = React.useState<string | undefined>();
  const [favoriteSavedViewId, setFavoriteSavedViewId] = React.useState<string | undefined>(() => loadFavoriteViewId());
  const [configOptions, setConfigOptions] = React.useState<DriverAnalysisConfigResponse>();

  const handleRun = async (request: DriverAnalysisFormState) => {
  await executeAnalysis(request, { closeDrawer: true });
};

const executeAnalysis = React.useCallback(
  async (
    request: DriverAnalysisFormState,
    options?: { closeDrawer?: boolean; silent?: boolean },
  ): Promise<DriverAnalysisResult | undefined> => {
    try {
      setLoading(true);
      const normalizedRequest = normalizeFormState(request);
      setFormState(normalizedRequest);
      const response = await runDriverAnalysis(normalizedRequest);
      setResult(response);
      if (options?.closeDrawer) setDrawerOpen(false);
      if (!options?.silent) message.success("Driver analysis completed.");
      return response;
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Unable to run driver analysis.",
      );
      return undefined;
    } finally {
      setLoading(false);
    }
  },
  [],
);

  React.useEffect(() => {
    let isMounted = true;

    loadDriverAnalysisConfig()
      .then((config) => {
        if (!isMounted) return;

        const defaultMetric = getMetricByName(config, config.defaults.metricName);
        const defaultAttributionDimensions = getDefaultAttributionDimensionsFromConfig(
          config,
          config.defaults.attributionAssetClass
        );

        setConfigOptions(config);

        const savedViewsFromStorage = loadSavedViews();
        const favoriteViewIdFromStorage = loadFavoriteViewId();
        const favoriteView = savedViewsFromStorage.find(
          (view) => view.id === favoriteViewIdFromStorage
        );

        if (favoriteView) {
          setSavedViews(savedViewsFromStorage);
          setFavoriteSavedViewId(favoriteView.id);
          setActiveSavedViewId(favoriteView.id);
          setColumnConfig(favoriteView.columnConfig);
          setGridViewMode(favoriteView.gridViewMode);
          setFormState(normalizeFormState(favoriteView.formState));
          message.success(`Loaded favorite view: ${favoriteView.name}`);
          return;
        }

        if (favoriteViewIdFromStorage && !favoriteView) {
          persistFavoriteViewId(undefined);
          setFavoriteSavedViewId(undefined);
        }

        setColumnConfig(buildDefaultColumnConfigFromCatalog(config.columnCatalog));
        setFormState((current) => ({
          ...current,
          portfolioId: config.defaults.portfolioIds[0],
          portfolioIds: config.defaults.portfolioIds,
          asOfDate: config.defaults.asOfDate,
          periods: config.defaults.periods,
          groupBy: config.defaults.groupBy,
          metric: defaultMetric,
          attributionAnalysis: {
            ...current.attributionAnalysis,
            assetClass: config.defaults.attributionAssetClass,
            dimensions: defaultAttributionDimensions,
            effects: config.defaults.attributionEffects
          }
        }));
      })
      .catch((error) => {
        message.error(error instanceof Error ? error.message : "Unable to load configuration API.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleReset = () => {
    setFormState(defaultFormState);
    setResult(undefined);
    setColumnConfig(
      configOptions
        ? buildDefaultColumnConfigFromCatalog(configOptions.columnCatalog)
        : { availableColumns: [], selectedColumns: [] }
    );
    setActiveSavedViewId(undefined);
    message.info("Driver analysis has been reset.");
  };

  const handleExportCsv = () => {
    if (!result) {
      message.warning("Run analysis before exporting.");
      return;
    }

    const rows = [...result.topDrivers, ...result.bottomDrivers];
    const header = ["runId", "portfolioId", "portfolioIds", "asOfDate", "period", "direction", "rank", "driverName", "metricName", "metricValue", "metricDisplay"];
    const csv = [
      header.join(","),
      ...rows.map((row) => [
        result.runId,
        row.portfolioId ?? result.portfolioId,
        result.portfolioIds.join("|"),
        result.asOfDate,
        row.period,
        row.direction,
        row.rank,
        row.driverName,
        row.metricName,
        row.metricValue,
        row.metricDisplay
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `driver-analysis-${result.portfolioIds.join("-")}-${result.asOfDate}.csv`;
    element.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveView = (
    name: string,
    description?: string,
    viewFormState: DriverAnalysisFormState = formState,
  ) => {
    const normalizedFormState = {
      ...viewFormState,
      portfolioId: viewFormState.portfolioIds?.[0] ?? viewFormState.portfolioId,
      portfolioIds: viewFormState.portfolioIds?.length
        ? viewFormState.portfolioIds
        : [viewFormState.portfolioId],
    };

    const existing = savedViews.find(
      (view) => view.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

    const nextView = existing
      ? {
          ...existing,
          name: name.trim(),
          description: description?.trim(),
          formState: normalizedFormState,
          columnConfig,
          gridViewMode,
          updatedAt: new Date().toISOString(),
        }
      : createSavedView({
          name,
          description,
          formState: normalizedFormState,
          columnConfig,
          gridViewMode,
        });

    const nextViews = existing
      ? savedViews.map((view) => (view.id === existing.id ? nextView : view))
      : [nextView, ...savedViews];

    setSavedViews(nextViews);
    persistSavedViews(nextViews);
    setActiveSavedViewId(nextView.id);
    setFormState(normalizedFormState);
    message.success(`Saved view: ${nextView.name}`);
  };

  const handleLoadView = (viewId: string, options?: { autoRun?: boolean }) => {
  const view = savedViews.find((item) => item.id === viewId);

  if (!view) {
    message.error("Saved view was not found.");
    return;
  }

  const normalizedState = normalizeFormState(view.formState);

  setFormState(normalizedState);
  setColumnConfig(view.columnConfig);
  setGridViewMode(view.gridViewMode);
  setActiveSavedViewId(view.id);

  if (options?.autoRun) {
    message.success(`Loaded view: ${view.name}. Running analysis...`);
    void executeAnalysis(normalizedState, { silent: true });
  } else {
    setResult(undefined);
    message.success(`Loaded view: ${view.name}`);
  }
};

  const handleDeleteView = (viewId: string) => {
    const view = savedViews.find((item) => item.id === viewId);
    const nextViews = savedViews.filter((item) => item.id !== viewId);

    setSavedViews(nextViews);
    persistSavedViews(nextViews);

    if (activeSavedViewId === viewId) {
      setActiveSavedViewId(undefined);
    }

    if (favoriteSavedViewId === viewId) {
      setFavoriteSavedViewId(undefined);
      persistFavoriteViewId(undefined);
    }

    message.success(view ? `Deleted view: ${view.name}` : "Deleted saved view.");
  };

  const handleSetFavoriteView = (viewId: string | undefined) => {
    if (viewId && !savedViews.some((view) => view.id === viewId)) {
      message.error("Saved view was not found.");
      return;
    }

    setFavoriteSavedViewId(viewId);
    persistFavoriteViewId(viewId);

    if (viewId) {
      const view = savedViews.find((item) => item.id === viewId);
      message.success(view ? `Favorite view set: ${view.name}` : "Favorite view set.");
    } else {
      message.info("Favorite view cleared.");
    }
  };

  if (!configOptions) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f3f6fb" }}>
        <Content style={{ padding: 16 }}>
          <Card size="small">Loading driver analysis configuration from API...</Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f3f6fb" }}>
      <Content style={{ padding: 16 }}>
        <Card size="small" className="driver-command-bar" bodyStyle={{ padding: "10px 12px" }} style={{ marginBottom: 12 }}>
          <Row align="middle" justify="space-between" gutter={[12, 8]}>
            <Col flex="auto">
              <Space direction="vertical" size={2}>
                <Space size={8} wrap>
                  <ThunderboltOutlined style={{ color: "#1d4ed8" }} />
                  <Title level={5} style={{ margin: 0 }}>Driver Analysis</Title>
                  <Tag color="blue">Portfolios {formState.portfolioIds.join(", ")}</Tag>
                  <Tag color="purple">{formState.periods.join(", ")}</Tag>
                  <Tag color="green">{formState.metric.label}</Tag>
                  {favoriteSavedViewId && <Tag color="gold">Favorite view preloaded</Tag>}
                </Space>
                <Space size={6} wrap>
                  <Text type="secondary">Top / bottom drivers across returns, attribution, risk, and P&L.</Text>
                  <Tag icon={<FilterOutlined />}>Dataset: {formState.datasetSource.type}</Tag>
                  <Tag>Group: {formState.groupBy.join(", ")}</Tag>
                  <Tag>As-of: {formState.asOfDate}</Tag>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space size={8}>
                <Segmented
                  size="small"
                  value={gridViewMode}
                  onChange={(value) => setGridViewMode(value as DriverGridViewMode)}
                  options={[
                    { label: "Flat", value: "flat", icon: <UnorderedListOutlined /> },
                    { label: "By Period", value: "period", icon: <GroupOutlined /> }
                  ]}
                />
                <Button size="small" icon={<ReloadOutlined />} onClick={handleReset}>Reset</Button>
                <Button size="small" icon={<DownloadOutlined />} onClick={handleExportCsv}>Export</Button>
                <Button size="small" type="primary" icon={<SettingOutlined />} onClick={() => setDrawerOpen(true)}>Configure</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <DriverResultsPanel
          result={result}
          gridViewMode={gridViewMode}
          onGridViewModeChange={setGridViewMode}
          columnConfig={columnConfig}
        />

        <DriverControlDrawer
          open={drawerOpen}
          value={formState}
          loading={loading}
          columnConfig={columnConfig}
          configOptions={configOptions}
          savedViews={savedViews}
          activeSavedViewId={activeSavedViewId}
          favoriteSavedViewId={favoriteSavedViewId}
          onColumnConfigChange={setColumnConfig}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onDeleteView={handleDeleteView}
          onSetFavoriteView={handleSetFavoriteView}
          onClose={() => setDrawerOpen(false)}
          onChange={setFormState}
          onRun={handleRun}
        />
      </Content>
    </Layout>
  );
}
