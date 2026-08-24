import { useEffect, useMemo, useRef, useState } from "react";
import { Popup } from "devextreme-react/popup";
import DataGrid, { Column, DataGridRef, Scrolling, FilterRow, HeaderFilter, DataGridTypes } from "devextreme-react/data-grid";
import NumberBox from "devextreme-react/number-box";
import CircularProgress from "@mui/material/CircularProgress";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { ValueChangedEvent } from "devextreme/ui/number_box";

import { getAladdinBasketSecurities, getBasketDetails, publishToBbg } from "../../services/basketNegotiationService";
import type { AladdinBasketSecuritiesResponse } from "../../services/domain-objects/response/AladdinBasketSecuritiesResponse";
import type { BasketDetailsObj } from "../../services/domain-objects/response/BasketDetailsResponse";
import { useUserInfo } from '@platform/utils';

import { exportDataGrid, } from "devextreme/excel_exporter";
import ExcelJS from "exceljs";
import saveAs from "file-saver";

import "devextreme/dist/css/dx.light.css";
import styles from "./BsktProposalsGrid.module.css";

import type { BasketProposal } from "../../services/domain-objects/basketProposal";
import notify from 'devextreme/ui/notify';

interface BsktProposalOverridePopupProps {
  bsktNegotiationId: number;
  proposal?: BasketProposal | null;
  show: boolean;
  onClose: () => void;
  onPublished: () => void;
}

type AladdinSecurityRow = {
  bbgAladdinSecurityId: number | string;
  aladdinId?: string;
  cusip?: string;
  orderQuantity?: number;
  proposedQuantity?: number | null;
  marketPrice?: number;
  marketValue?: number;
  isin?: string;
  sedol?: string;
  currency?: string;
};


function toNumber(v: unknown): number | null {
  if (typeof v === "number") {
    return Number.isFinite(v) ? v : null;
  }

  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

function usd(v: unknown): string {
  const n = toNumber(v);
  if (n == null) return "N/A";

  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function wholeNumber(v: unknown): string {
  const n = toNumber(v);
  if (n == null) return "";

  return n.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}


function toText(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

export function BsktProposalOverridePopup({
  bsktNegotiationId,
  proposal,
  show,
  onClose,
  onPublished,
}: BsktProposalOverridePopupProps) {
  const { email: currentUser } = useUserInfo();
  const [cashFee, setCashFee] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const cashFeeRef = useRef<React.ComponentRef<typeof NumberBox>>(null);

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aladdinData, setAladdinData] = useState<AladdinBasketSecuritiesResponse | null>(null);
  const [basketDetails, setBasketDetails] = useState<BasketDetailsObj | null>(null);
  
  const dataGridRef = useRef<DataGridRef|null>(null);

  const focusCashFeeInput = () => {
  window.setTimeout(() => {
    const numberBoxInstance = cashFeeRef.current?.instance?.();

    if (!numberBoxInstance) return;

    numberBoxInstance.focus();

    const input = numberBoxInstance
      .element()
      .querySelector("input.dx-texteditor-input:not([type='hidden'])") as HTMLInputElement | null;

    console.log("visible cashFee input:", input);

    if (input) {
      input.focus();
      input.select();
    }
  }, 150);
};



  // Autofocus Cash Fee when popup is ready
  useEffect(() => {
    if (!show) return;
    if (showDetails) return;
    if (loading) return;
    if (loadError) return;

    focusCashFeeInput();
  }, [show, showDetails, loading, loadError]);

  // Reset details state whenever popup opens
  useEffect(() => {
    if (show) setShowDetails(false);
  }, [show]);

  useEffect(() => {
    if (!show || bsktNegotiationId <= 0) return;

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setLoadError(null);
      setBasketDetails(null);
      try {
        const [data, detailsResponse] = await Promise.all([
          getAladdinBasketSecurities(bsktNegotiationId, currentUser),
          getBasketDetails(bsktNegotiationId),
        ]);

        if (!cancelled) {
          setAladdinData(data);
          setBasketDetails(detailsResponse.basketDetails);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load basket details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [show, bsktNegotiationId]);

  const info = proposal?.basketInformation;

  const basketIdText = info?.basketId ?? String(bsktNegotiationId);

  const securitiesRows = useMemo<AladdinSecurityRow[]>(() => {
    const raw = aladdinData?.aladdinBasketSecurities ?? [];
    return raw as unknown as AladdinSecurityRow[];
  }, [aladdinData?.aladdinBasketSecurities]);

  const securitiesCount = useMemo(() => {
    return basketDetails?.aladdinSecuritiesCount;
  }, [basketDetails?.aladdinSecuritiesCount]);

  const aladdinSecuritiesMvText = useMemo(() => {
  return usd(basketDetails?.aladdinSecuritiesMarketValue);
}, [basketDetails?.aladdinSecuritiesMarketValue]);

  const handleSaveAndPublish = async () => {
    //validation. no empty cash fee
    if (cashFee == null) 
      {
        notify(
              {
              message: 'Please enter a Cash Fee value before clicking Save & Publish.',
              position: {
                my: 'top center',
                at: 'top center',
                of: window
                        }
              },
            'warning',
            3000
            );
        focusCashFeeInput();
        return;
      }

    setPublishing(true);
    try {
      await publishToBbg(bsktNegotiationId, currentUser, cashFee);
      onPublished();
    } catch {
      alert('Error occurred while publishing. Please contact a developer.');
    } finally {
      setPublishing(false);
    }
  };

  const onDetailClose = async () => {
      setShowDetails(false);
  };
  const handleExportClick = async () => 
  {
    if (!dataGridRef.current) {  
      alert("DataGrid is not ready, please try again later.");  
      return;  
    }
    try {  
      const workbook = new ExcelJS.Workbook();  
      const worksheet = workbook.addWorksheet("Securities");  

      await exportDataGrid({
        component: dataGridRef.current.instance(),
        worksheet,
        autoFilterEnabled: false
      })
      // column headers --  
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).alignment = { horizontal: "center" };

      // Generate a buffer  
      const buffer = await workbook.xlsx.writeBuffer(); 

      const fileName = `Basket_${basketIdText}.xlsx`;  
      saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);  

      console.log("File exported:", fileName);  
    } catch (err) {  
      console.error("Export error:", err);  
      alert("Failed to export data. Check console for details.");  
    } 
  }

  const onCellPrepared = (e: DataGridTypes.CellPreparedEvent) => {  
    if (e.rowType === 'header') {          
      e.cellElement.style.textAlign = 'left';  
    }  
    else if (e.rowType === 'data') {  
      e.cellElement.style.textAlign = 'center';         
    }  
  };

  const onRowPrepared = (e: DataGridTypes.RowPreparedEvent<AladdinSecurityRow> ) => {
    if (e.rowType === 'data' && e.data.proposedQuantity != null && e.data.orderQuantity != null && (e.data.orderQuantity > e.data.proposedQuantity)) {
        e.rowElement.classList.add(styles.highlighted);
    }
  };
  
  const Header = () => {
    const title = showDetails ? "Basket Details" : "Publish Basket from Aladdin to BSKT";

    return (
      <div className={styles.popupHeaderWrap}>
        <div className={styles.popupHeaderRow}>
          <Typography className={styles.popupTitleText}>{title}</Typography>

          <div className={styles.popupHeaderActions}>
            {showDetails && (
              <Button
                variant="text"
                size="small"
                startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                onClick={ handleExportClick }
                className={styles.popupExportBtn}
                disabled={publishing}
              >
                Export
              </Button>
            )}

            <IconButton
              size="small"
              onClick={showDetails? onDetailClose : onClose}
              aria-label="Close"
              className={styles.popupCloseIcon}
              disabled={publishing}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        <div className={styles.popupHeaderGradientBar} />
      </div>
    );
  };

  const SummaryView = () => (
    <div className={styles.popupBody}>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryLabel}>Basket ID</div>
        <div className={styles.summaryValue}>{basketIdText}</div>

        <div className={styles.summaryLabel}>Aladdin Number of Securities</div>
        <div className={styles.summaryValue}>{securitiesCount}</div>

        <div className={styles.summaryLabel}>Aladdin Securities MV $</div>
        <div className={styles.summaryValueRow}>
          <div className={styles.summaryValue}>{aladdinSecuritiesMvText}</div>
          <Button
            variant="contained"
            disableElevation
            onClick={() => setShowDetails(true)}
            className={styles.seeDetailsBtn}
            disabled={publishing}
          >
            See Details
          </Button>
        </div>
      </div>

      <div className={styles.overridesBlock}>
        <div className={styles.overridesTitle}>Overrides</div>
        <div className={styles.overridesHint}>
          Please override cashFee value if needed before clicking Save &amp; Publish.
        </div>

        <div className={styles.overrideTable}>
          <div className={styles.overrideHeaderCell}>Field</div>
          <div className={styles.overrideHeaderCell}>Value</div>

          <div className={styles.overrideCell}>Cash Fee</div>
          <div className={styles.overrideCell}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <NumberBox
                ref = {cashFeeRef}
                value={cashFee ?? undefined}
                width={110}
                height={26}
                stylingMode="outlined"
                elementAttr={{class: styles.yellowNumberBox}}
                format={"#0.00"}
                min={0}
                showSpinButtons={false}
                showClearButton={true}
                onContentReady={() => {if (show && !showDetails && !loading && !loadError) {focusCashFeeInput();}}}
                disabled={publishing}
                onValueChanged={(e: ValueChangedEvent) => {
                  const v = e.value as number | null;
                  setCashFee(v == null ? null : v);
                }}
              />
              <span className={styles.overrideCell}>bps</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.popupFooter}>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSaveAndPublish}
          className={styles.popupPrimaryBtn}
          disabled={publishing}
        >
          {publishing && (
              <CircularProgress
              size={14}
              sx={{
                color: "white",
                marginRight: "8px", }}/>
                         )}
                {publishing ? "Publishing..." : "Save & Publish"}
        </Button>

        <Button
          variant="outlined"
          onClick={onClose}
          className={styles.popupCancelBtn}
          disabled={publishing}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  const DetailsView = () => (
    <div className={styles.popupBodyDetails}>
      <div className={styles.detailsCard}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Basket ID</div>
            <div className={styles.detailsV}>{basketIdText}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Dealer Desk</div>
            <div className={styles.detailsV}>{toText(info?.dealerDesk)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Total Shares</div>
            <div className={styles.detailsV}>{wholeNumber(info?.totalShares)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Aladdin Number of Securities</div>
            <div className={styles.detailsV}>{toText(securitiesCount)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Timestamp</div>
            <div className={styles.detailsV}>{toText(info?.timestamp)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Dealer Email</div>
            <div className={styles.detailsV}>{toText(info?.dealerEmail)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Creation Unit Size</div>
            <div className={styles.detailsV}>{wholeNumber(info?.creationUnitSize)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Units</div>
            <div className={styles.detailsV}>{toText(info?.units)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Aladdin Securities MV $</div>
            <div className={styles.detailsV}>{aladdinSecuritiesMvText}</div>
          </div>
        </div>
      </div>

      <div className={styles.compositionTitle}>Composition</div>

      <div className={styles.compositionGridNarrow}>
        <div className={styles.popupGridWrapper}>
          <DataGrid
            ref={dataGridRef}
            dataSource={securitiesRows}
            keyExpr="bbgAladdinSecurityId"
            showBorders={false}
            columnAutoWidth
            allowColumnResizing={false}
            width="95%"
            onCellPrepared={onCellPrepared}
            onRowPrepared={onRowPrepared}
          >
            <Scrolling mode="standard" />
            <FilterRow visible={false} applyFilter="auto" />
            <HeaderFilter visible={true} />
            
          <Column dataField="isin" caption="ISIN" alignment="left" width="25%" allowResizing allowFiltering />
          <Column dataField="sedol" caption="SEDOL" alignment="left" width="20%" allowResizing allowFiltering />
          <Column dataField="currency" caption="Currency" alignment="left" width="15%" allowResizing allowFiltering />
          <Column dataField="proposedQuantity" caption="Proposed Qty" alignment="left" format="#,##0" width="20%" allowResizing allowFiltering />
          <Column dataField="orderQuantity" caption="Bskt Amt" alignment="left" format="#,##0" width="20%" allowResizing allowFiltering />
        </DataGrid>
        </div>
      </div>
    </div>
  );

  return (
    <div> { show && ( 
      !showDetails ? (
      <Popup
        visible={show}
        onHiding={onClose}
        dragEnabled={false}
        showTitle={false}
        height="55%"
        resizeEnabled={false}
        position="center"
        width="60%"
        className={styles.popupNoScroll}
        contentRender={() => (
          <div className={styles.popupRoot}>
            <Header />

            {loading && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Loading…</Typography>
              </Box>
            )}

            {!loading && loadError && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography sx={{ fontSize: 12, color: "#b91c1c" }}>{loadError}</Typography>
              </Box>
            )}

            {!loading && !loadError && <SummaryView />}
          </div>
        )}
      />)
      :(
        <Popup
        visible={showDetails}
        onHiding={onDetailClose}
        dragEnabled={false}
        showTitle={false}
        height="85%"
        resizeEnabled={false}
        position="center"
        width="90%"
        className={styles.popupNoScroll}
        contentRender={() => (
          <div className={styles.popupRoot}>
            <Header />
            {loading && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Loading…</Typography>
              </Box>
            )}

            {!loading && loadError && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography sx={{ fontSize: 12, color: "#b91c1c" }}>{loadError}</Typography>
              </Box>
            )}

            {!loading && !loadError && <DetailsView />}
          </div>
        )}
      />)
    )}
    </div>
  );
}
