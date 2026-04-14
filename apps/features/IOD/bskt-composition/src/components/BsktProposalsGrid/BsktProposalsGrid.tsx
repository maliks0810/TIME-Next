import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import DataGrid, {
  Column,
  MasterDetail,
  DataGridTypes,
  Scrolling,
} from "devextreme-react/data-grid";
import type dxDataGrid from "devextreme/ui/data_grid";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

import RefreshIcon from "@mui/icons-material/Refresh";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { BsktProposalOverridePopup } from "./BsktProposalOverridePopup";
import styles from "./BsktProposalsGrid.module.css";

import type { BasketCondition } from "../../types/basket";

import {
  ENVIRONMENTS,
  getCurrentEnvironment,
  isTestDealerProposalEnabled,
} from "../../config/environments";

import {
  createTestDealerProposal,
  publishToBbg,
  type CreateTestDealerInventoryRequest,
} from "../../services/bsktService";

import { getBasketProposals, sendToAladdin } from "../../services/basketNegotiationService";
import { BasketProposal, BasketInformation } from "../../services/domain-objects/basketProposal";
import { BasketState } from "../../services/domain-objects/basketState";
import { useInterval } from "../../hooks/useInterval";
import { usePageVisibilityChange } from "../../hooks/useVisibilityChange";
import { getCurrentLocalTime } from "../../utils/format";
import { useUserInfo } from '@platform/utils';

type RowKey = string;
type WrappedBasketProposal = {
  data: BasketProposal;
};

const COLOR = {
  blueText: "#013D7D",
  blueBg: "#013D7D40",
  greenText: "#4B773D",
  greenBg: "#4B773D40",
  orangeText: "#D76712",
  orangeBg: "#D7671240",
  redText: "#D44329",
  redBg: "#D4432940",
  purpleText: "#6B228D",
  purpleBg: "#6B228D40",
};

const BASKET_POLLING_INTERVAL = import.meta.env.VITE_IOD_BSKT_PROPOSAL_POLLING_INTERVAL;

function statusChipStyle(status: BasketState) {
  if (status === "Proposed") return { bgcolor: COLOR.blueBg, color: COLOR.blueText };
  if (status === "In Aladdin") return { bgcolor: COLOR.orangeBg, color: COLOR.orangeText };
  return { bgcolor: COLOR.greenBg, color: COLOR.greenText };
}

const ACTION_BTN = {
  width: 160,
  height: 28,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "none" as const,
  borderRadius: "6px",
  boxShadow: "none" as const,
};

const btnBlue = { ...ACTION_BTN, bgcolor: COLOR.blueBg, color: COLOR.blueText };
const btnGreen = { ...ACTION_BTN, bgcolor: COLOR.greenBg, color: COLOR.greenText };

function ActionsCell({
  data,
  gridRef,
  rowKey,
  isExpanded,
  isBusy,
  onSendToAladdin,
  onPublish,
}: {
  data: BasketProposal;
  gridRef: React.RefObject<dxDataGrid | null>;
  rowKey: RowKey;
  isExpanded: boolean;
  isBusy: boolean;
  onSendToAladdin: () => void;
  onPublish: () => void;
}) {
  return (
    <div className={styles.actionsCell}>
      <div className={styles.actionsButtons}>
        <Stack direction="row" spacing={1}>
          {data.status === "Proposed" && (
            <Button variant="contained" disableElevation sx={btnBlue} disabled={isBusy} onClick={onSendToAladdin}>
              Send to Aladdin
            </Button>
          )}

          {data.status === "In Aladdin" && (
            <Button variant="contained" disableElevation sx={btnGreen} disabled={isBusy} onClick={onPublish}>
              Publish
            </Button>
          )}
        </Stack>
      </div>

      <div className={styles.actionsArrow}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const grid = gridRef.current;
            if (!grid) return;
            if (isExpanded) grid.collapseRow(rowKey);
            else grid.expandRow(rowKey);
          }}
        >
          {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </div>
    </div>
  );
}

function ConditionsCell({ data }: { data: BasketProposal }) {
  if (!data.conditions?.length) return <span />;
  return (
    <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap">
      {data.conditions.map((c: BasketCondition) => (
        <Chip
          key={`${c.label}-${c.value}`}
          label={`${c.label}: ${c.value}`}
          size="small"
          sx={{ height: 22, fontSize: 11, borderRadius: "6px", fontWeight: 700 }}
        />
      ))}
    </Stack>
  );
}

function StatusCell({ data }: { data: BasketProposal }) {
  return (
    <Chip
      label={data.status}
      size="small"
      sx={{
        height: 22,
        minWidth: 78,
        fontSize: 11,
        fontWeight: 700,
        borderRadius: "6px",
        ...statusChipStyle(data.status),
      }}
    />
  );
}

const BasketDetails: React.FC<
  DataGridTypes.MasterDetailTemplateData<WrappedBasketProposal, RowKey>
> = ({ data }) => {
  if (!data) return null;

  const info: BasketInformation = data.data.basketInformation;

  return (
    <div className={styles.detailPanel}>
      <div className={styles.sectionTitle}>Basket Information</div>
      <div className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.kv}><div className={styles.k}>Basket ID</div><div className={styles.v}>{info?.basketId}</div></div>
          <div className={styles.kv}><div className={styles.k}>Dealer Desk</div><div className={styles.v}>{info?.dealerDesk}</div></div>
          <div className={styles.kv}><div className={styles.k}>Total Shares</div><div className={styles.v}>{info?.totalShares}</div></div>
          <div className={styles.kv}><div className={styles.k}># Securities</div><div className={styles.v}>{info?.securitiesCount}</div></div>
          <div className={styles.kv}><div className={styles.k}>Timestamp</div><div className={styles.v}>{info?.timestamp}</div></div>
          <div className={styles.kv}><div className={styles.k}>Dealer Email</div><div className={styles.v}>{info?.dealerEmail}</div></div>
          <div className={styles.kv}><div className={styles.k}>Unit Size</div><div className={styles.v}>{info?.unitSize}</div></div>
          <div className={styles.kv}><div className={styles.k}>Units</div><div className={styles.v}>{info?.units}</div></div>
        </div>
      </div>
    </div>
  );
};

BasketDetails.displayName = "BasketDetails";

function renderStatusCell(cell: { data: BasketProposal }) {
  return <StatusCell data={cell.data} />;
}

function renderConditionsCell(cell: { data: BasketProposal }) {
  return <ConditionsCell data={cell.data} />;
}

export default function BsktProposalsGrid() {
  const gridRef = useRef<dxDataGrid | null>(null);
  const { email: currentUser } = useUserInfo();

  const [showOverridePopup, setShowOverridePopup] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<BasketProposal | null>(null);
  const [basketNegoId, setBasketNegoId] = useState<number>(0);

  const [proposals, setProposals] = useState<BasketProposal[]>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const showFooter = isTestDealerProposalEnabled();
  const [showTestPanel, setShowTestPanel] = useState(false);

  const [pollingInterval, setPollingInterval] = useState<number | null>(BASKET_POLLING_INTERVAL)
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const isPageVisible = usePageVisibilityChange();

  const [form, setForm] = useState<CreateTestDealerInventoryRequest>({
    fundTicker: "FLXR US",
    inventoryName: "",
    basketType: "",
    numShares: 0,
    numUnits: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const asOfDate: Date | undefined = undefined;

  const isProd = useMemo(() => getCurrentEnvironment() === ENVIRONMENTS.PROD, []);
  const prodSafeMsg = "There was an issue retrieving Basket data, please contact the IOD Engineering Team.";

  const canSubmit = useMemo(() => {
    return (
      form.fundTicker.trim().length > 0 &&
      form.inventoryName.trim().length > 0 &&
      form.basketType.trim().length > 0 &&
      (form.numShares > 0 || form.numUnits > 0)
    );
  }, [form]);

  const refreshProposals = useCallback(async (signal?: AbortSignal) => {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const data = await getBasketProposals(currentUser, asOfDate, false, signal); //default skipBloolmberg = false
      setProposals(data);
    } catch (e) {
      if (signal?.aborted) return;
      const msg = e instanceof Error ? e.message : String(e);
      setRefreshError(isProd ? prodSafeMsg : msg);
    } finally {
      if (!signal?.aborted) setIsRefreshing(false);
    }
  }, [asOfDate, isProd, currentUser]);

  useEffect(() => {
    const controller = new AbortController();
    refreshProposals(controller.signal);
    return () => controller.abort();
  }, [refreshProposals]);

  // poll data when page is visible
  useEffect(() => {
    if (isPageVisible && !showOverridePopup) {
      setPollingInterval(BASKET_POLLING_INTERVAL);
    }
    else {
      setPollingInterval(null);
    }
  }, [isPageVisible, showOverridePopup]);

 // poll data in intervals
  useInterval(() => {
    if (!isPolling) {
      pollingProposalData();
    }
  }, pollingInterval);

  const pollingProposalData = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsPolling(true);
      setRefreshError(null);
      const data = await getBasketProposals(currentUser, asOfDate, true, signal); //for polling skipBloolmberg = true
      setProposals(data);
      const currentTime = getCurrentLocalTime();
      setLastRefreshed(currentTime);
    }
    catch (e) {
      if (signal?.aborted) return;
      const msg = e instanceof Error ? e.message : String(e);
      setRefreshError(isProd ? prodSafeMsg : msg);
    }
    finally {
      setIsPolling(false);
    }
  }, [setIsPolling, setProposals, currentUser]);

  const getBasketNegotiationId = useCallback((p: BasketProposal): number => {
    const n = Number(p.id);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.trunc(n);
  }, []);

  const handleCloseOverridePopup = useCallback(() => {
    setShowOverridePopup(false);
    setSelectedProposal(null);
    setBasketNegoId(0);
    setActionBusyId(null);
  }, []);

  const handlePublishedOverridePopup = useCallback(async () => {
    setShowOverridePopup(false);
    setSelectedProposal(null);
    setBasketNegoId(0);
    setActionBusyId(null);
    await refreshProposals();
  }, [refreshProposals]);

  const runAction = useCallback(async <R,>(
    actionName: string,
    p: BasketProposal,
    action: (id: number) => Promise<R>
  ) => {
    setActionError(null);
    const id = getBasketNegotiationId(p);
    setActionBusyId(p.id);

    try {
      if (actionName === "Publish") {
        setSelectedProposal(p);
        setBasketNegoId(id);
        setShowOverridePopup(true);
        return;
      }

      await action(id);
      await new Promise((r) => setTimeout(r, 250));
      await refreshProposals();
    } catch {
      setActionError(`Failed to "${actionName}", please contact a developer.`);
    } finally {
      if (actionName !== "Publish") setActionBusyId(null);
    }
  }, [getBasketNegotiationId, refreshProposals]);

  const submitTestDealerProposal = useCallback(async () => {
    setTestError(null);
    setTestSuccess(null);
    setSubmitting(true);

    try {
      const payload: CreateTestDealerInventoryRequest = {
        fundTicker: form.fundTicker.trim(),
        inventoryName: form.inventoryName.trim(),
        basketType: form.basketType.trim(),
        numShares: Number(form.numShares) || 0,
        numUnits: Number(form.numUnits) || 0,
      };

      const resp = await createTestDealerProposal(payload);
      setTestSuccess(`Created. inventoryId: ${resp.inventoryId}`);

      await new Promise((r) => setTimeout(r, 400));
      await refreshProposals();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setTestError(isProd ? prodSafeMsg : msg);
    } finally {
      setSubmitting(false);
    }
  }, [form, isProd, refreshProposals]);

  function renderActionsCell(
    cell: DataGridTypes.ColumnCellTemplateData<BasketProposal, RowKey>
  ) {
    const data = cell.data;
    const rowKey = cell.row?.key as RowKey | undefined;
    if (!data || !rowKey) return null;

    const isBusy = actionBusyId === data.id;

    return (
      <ActionsCell
        data={data}
        gridRef={gridRef}
        rowKey={rowKey}
        isExpanded={cell.row?.isExpanded === true}
        isBusy={isBusy}
        onSendToAladdin={() =>
          runAction("Send to Aladdin", data, (id) => sendToAladdin(id.toString(), currentUser))
        }
        onPublish={() =>
          runAction("Publish", data, (id) => publishToBbg(id, currentUser))
        }
      />
    );
  }

  const onCellPrepared = (e: DataGridTypes.CellPreparedEvent) => {  
    if (e.rowType === 'header') {          
      e.cellElement.style.textAlign = 'left';  
    }  
    else if (e.rowType === 'data') {  
      e.cellElement.style.textAlign = 'center';         
    }  
  };

  return (
    <Card className={styles.card}>
      <Box className={styles.cardTopGradient} />
      <CardContent className={styles.cardContent}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 900 }}>
            Basket Proposals
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'gray' }}>
              Last Refreshed: {lastRefreshed}
          </Typography>

          <Button
            variant="text"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => refreshProposals()}
            disabled={isRefreshing}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>

        {refreshError && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {refreshError}
          </Alert>
        )}

        {actionError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {actionError}
          </Alert>
        )}

        <div className={styles.mainGridWrapper}>
          <DataGrid
            dataSource={proposals}
            keyExpr="id"
            showBorders={false}
            columnAutoWidth
            onInitialized={(e) => {
              if (e.component) gridRef.current = e.component;
            }}
            onCellPrepared={onCellPrepared}
            loadPanel={{enabled: isPolling?false:true}}
          >
            <Scrolling mode="standard" />
            <Column dataField="basketName" caption="Basket Name" alignment="center" width="10%"/>
            <Column dataField="broker" caption="Broker" alignment="center" width="15%"/>
            <Column caption="Status" alignment="center" cellRender={renderStatusCell} width="15%"/>
            <Column dataField="dateProposed" caption="Date Proposed" alignment="center" width="10%" dataType="date" format="MMM dd, yyyy"/>
            <Column dataField="tradeDate" caption="Trade Date" alignment="center" width="10%" dataType="date" format="MMM dd, yyyy"/>
            <Column dataField="settleDate" caption="Settle Date" alignment="center" width="10%" dataType="date" format="MMM dd, yyyy"/>
            <Column caption="Conditions" alignment="center" cellRender={renderConditionsCell} width="10%" />
            <Column caption="Actions" alignment="center" cellRender={renderActionsCell} width="20%" />
            <MasterDetail enabled={false} component={BasketDetails} />
          </DataGrid>
        </div>

        { showOverridePopup && (
          <BsktProposalOverridePopup
            bsktNegotiationId={basketNegoId}
            proposal={selectedProposal}
            show={showOverridePopup}
            onClose={handleCloseOverridePopup}
            onPublished={handlePublishedOverridePopup}
          />)
        }

        {showFooter && (
          <>
            <Divider sx={{ mt: 2, mb: 1.5 }} />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                Test Dealer Proposal Create:
              </Typography>

              <Button
                variant="text"
                size="small"
                onClick={() => setShowTestPanel((v) => !v)}
                sx={{ textTransform: "none", fontWeight: 800 }}
              >
                {showTestPanel ? "Hide" : "Show"}
              </Button>
            </Box>

            <Collapse in={showTestPanel}>
              <Box sx={{ mt: 1.5, p: 1.5, borderRadius: "8px", bgcolor: "#f7f7f7" }}>
                {testError && <Alert severity="error" sx={{ mb: 1 }}>{testError}</Alert>}
                {testSuccess && <Alert severity="success" sx={{ mb: 1 }}>{testSuccess}</Alert>}

                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <TextField
                    size="small"
                    label="Fund Ticker"
                    value={form.fundTicker}
                    onChange={(e) => setForm((f) => ({ ...f, fundTicker: e.target.value }))}
                  />
                  <TextField
                    size="small"
                    label="Inventory Name"
                    value={form.inventoryName}
                    onChange={(e) => setForm((f) => ({ ...f, inventoryName: e.target.value }))}
                  />
                  <TextField
                    size="small"
                    label="Basket Type"
                    placeholder="CREATE / REDEEM"
                    value={form.basketType}
                    onChange={(e) => setForm((f) => ({ ...f, basketType: e.target.value }))}
                  />
                  <TextField
                    size="small"
                    label="Num Shares"
                    type="number"
                    value={form.numShares}
                    onChange={(e) => setForm((f) => ({ ...f, numShares: Number(e.target.value) }))}
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    size="small"
                    label="Num Units"
                    type="number"
                    value={form.numUnits}
                    onChange={(e) => setForm((f) => ({ ...f, numUnits: Number(e.target.value) }))}
                    inputProps={{ min: 0 }}
                  />

                  <Button
                    variant="contained"
                    disabled={!canSubmit || submitting}
                    onClick={submitTestDealerProposal}
                    sx={{ height: 40, textTransform: "none", fontWeight: 800 }}
                  >
                    {submitting ? "Creating..." : "Create"}
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
}