import { useEffect, useMemo, useRef, useState } from "react";
import { Popup } from "devextreme-react/popup";
import DataGrid, { Column, DataGridRef, Scrolling, FilterRow, HeaderFilter, DataGridTypes } from "devextreme-react/data-grid";
import NumberBox from "devextreme-react/number-box";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import { ValueChangedEvent } from "devextreme/ui/number_box";

import { publishToBbg } from "../../services/bsktService";
import { getAladdinBasketSecurities } from "../../services/basketNegotiationService";
import type { AladdinBasketSecuritiesResponse } from "../../services/domain-objects/response/AladdinBasketSecuritiesResponse";
import { useUserInfo } from '@platform/utils';

import { exportDataGrid, } from "devextreme/excel_exporter";
import ExcelJS from "exceljs";
import saveAs from "file-saver";

import "devextreme/dist/css/dx.light.css";
import styles from "./BsktProposalsGrid.module.css";

import type { BasketProposal } from "../../services/domain-objects/basketProposal";

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
  marketPrice?: number;
  marketValue?: number;
  isin?: string;
  sedol?: string;
  currency?: string;
};

function usd(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "N/A";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
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

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aladdinData, setAladdinData] = useState<AladdinBasketSecuritiesResponse | null>(null);
  
  const dataGridRef = useRef<DataGridRef|null>(null);

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
      try {
        const data = await getAladdinBasketSecurities(bsktNegotiationId, currentUser);
        if (!cancelled) setAladdinData(data);
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
    return securitiesRows.length;
  }, [securitiesRows.length]);

  const totalMvText = useMemo(() => {
    return usd(aladdinData?.totalMarketValue);
  }, [aladdinData?.totalMarketValue]);

  const handleSaveAndPublish = async () => {
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

        <div className={styles.summaryLabel}># Securities</div>
        <div className={styles.summaryValue}>{securitiesCount}</div>

        <div className={styles.summaryLabel}>Total MV</div>
        <div className={styles.summaryValueRow}>
          <div className={styles.summaryValue}>{totalMvText}</div>
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
                value={cashFee ?? undefined}
                width={110}
                height={26}
                stylingMode="outlined"
                format={"#0.00"}
                min={0}
                showSpinButtons={false}
                showClearButton={true}
                onValueChanged={(e: ValueChangedEvent) => {
                  const v = e.value as number | null;
                  setCashFee(v == null || v === 0 ? null : v);
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
            <div className={styles.detailsV}>{toText(info?.totalShares)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}># Securities</div>
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
            <div className={styles.detailsK}>Unit Size</div>
            <div className={styles.detailsV}>{toText(info?.unitSize)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Units</div>
            <div className={styles.detailsV}>{toText(info?.units)}</div>
          </div>

          <div className={styles.detailsItem}>
            <div className={styles.detailsK}>Total Market Value</div>
            <div className={styles.detailsV}>{totalMvText}</div>
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
          >
            <Scrolling mode="standard" />
            <FilterRow visible={false} applyFilter="auto" />
            <HeaderFilter visible={true} />
            
          <Column dataField="isin" caption="ISIN" alignment="left" width="25%" allowResizing allowFiltering/>
          <Column dataField="sedol" caption="SEDOL" alignment="left" width="20%" allowResizing allowFiltering/>
          <Column dataField="currency" caption="Currency" alignment="left" width="15%" allowResizing allowFiltering/>
          <Column dataField="orderQuantity" caption="Bskt Amt" alignment="left" format="#,##0" width="15%" allowResizing allowFiltering/>
          <Column dataField="marketValue" caption="MV USD" alignment="left" width="25%" allowResizing allowFiltering 
              format={{ type: "currency", precision: 2 }} />
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
