import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import notify from 'devextreme/ui/notify';

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
import CircularProgress from "@mui/material/CircularProgress";

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
  CreateTestDealerInventoryRequest
} from "../../services/domain-objects/request/createTestDealerInventoryRequest";

import { getBasketProposals, sendToAladdin, getAladdinBasketSecurities,getBasketDetails,sendBasketDetails, createTestDealerProposal, publishToBbg } from "../../services/basketNegotiationService";
import { BasketProposal, BasketInformation } from "../../services/domain-objects/basketProposal";
import { BasketState } from "../../services/domain-objects/basketState";
import { useInterval } from "../../hooks/useInterval";
import { usePageVisibilityChange } from "../../hooks/useVisibilityChange";
import { getCurrentLocalTime } from "../../utils/format";
import { useUserInfo } from '@platform/utils';
import { BsktOrderSnapshotsPopup } from "./BsktOrderSnapshotsPopup";
import { BsktOrderPopup } from "./BsktOrderPopup";
import type { BasketDetailsObj } from "../../services/domain-objects/response/BasketDetailsResponse";


type RowKey = string;


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
  onPublish
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

          {data.status === "Published" && (
            <Box sx={{ width: 160, height: 28 }} />
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

const fmt = {
  currency: (v: number) =>
    v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }),
  number: (v: number, decimals = 2) =>
    v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
};

const formatCurrency = (value: string): string => {
  if (value == null || value.trim() === "") {
    return "";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "";
  }

  return numericValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};


//editable fields
type EditableFields = {
  inkindPercent: string;
  aladdinSecuritiesMV: string;
};


type BasketDetailsGridData = {
  data: BasketProposal;
};


type BasketDetailsProps = {
  data: BasketDetailsGridData;
  editableFieldsByProposalId: Record<string, EditableFields>;
  onInkindPercentChange: (proposalId: string, value: string) => void;
  onAladdinSecuritiesMVChange: (proposalId: string, value: string) => void;  
  basketDetailsFromApi?: BasketDetailsObj;
  onRefreshBasketDetails: (basketNegotiationId: number) => Promise<void>;
  saveMessage: string;
  showTemporarySaveMessage: (basketNegotiationId: number, message: string) => void;
  onFieldFocus: (proposalId: string, fieldName: string) => void;
  onFieldBlur: () => void;
  focusInkindBasketId: number | null;
  onFocusInkindHandled: () => void;
  focusAladdinMvBasketId: number | null;
  onFocusAladdinMvHandled: () => void;
};

const BasketDetails: React.FC<BasketDetailsProps> = ({
  data, 
  editableFieldsByProposalId,
  onInkindPercentChange,
  onAladdinSecuritiesMVChange,
  basketDetailsFromApi,
  onRefreshBasketDetails,
  saveMessage,
  showTemporarySaveMessage,
  onFieldFocus,
  onFieldBlur,
  focusInkindBasketId,
  onFocusInkindHandled,
  focusAladdinMvBasketId,
  onFocusAladdinMvHandled

}) => {
  
  // used for focusing on validation
  const inKindRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const aladdinMvRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const basketNegID = Number(data.data.id); 
  
  useEffect(() => {
      if (focusInkindBasketId !== basketNegID) {
        return;
      }

      const focusInput = () => {
        const input = inKindRefs.current[basketNegID];

        if (!input) {
          return;
        }

        input.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        input.focus();
      };

      // re focus twice incase data is being loaded/re-renders
      const timeoutId1 = window.setTimeout(focusInput, 300);
      const timeoutId2 = window.setTimeout(focusInput, 700);

      return () => {
        window.clearTimeout(timeoutId1);
        window.clearTimeout(timeoutId2);
      };
}, [focusInkindBasketId, basketNegID]);

useEffect(() => {
    if (focusAladdinMvBasketId !== basketNegID) {
      return;
    }

    const focusInput = () => {
      const input = aladdinMvRefs.current[basketNegID];

      if (!input) {
        return;
      }

      input.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      input.focus();
    };

    const timeoutId1 = window.setTimeout(focusInput, 300);
    const timeoutId2 = window.setTimeout(focusInput, 700);

    return () => {
      window.clearTimeout(timeoutId1);
      window.clearTimeout(timeoutId2);
    };
}, [focusAladdinMvBasketId, basketNegID]);

  // Provided Fields
  const { email: createdBy } = useUserInfo();
  const currentStatus = data.data.status;
  const info: BasketInformation = data.data.basketInformation;
  const isLoading = info?.isLoadingMv ?? false;
  const proposalId = info.basketId;
  const creationUnitSize = info?.creationUnitSize ?? 0;
  const desiredUnits     = info?.units ?? 0;
  const isEditableAladdinMV = currentStatus === "In Aladdin"
  const isEditableInkindPercent = currentStatus === "Proposed"

//API FIELDS
  const previousDayNav = basketDetailsFromApi?.previousCloseNavPerShare;
  const orderTotalValue = basketDetailsFromApi?.orderTotalValue;
  const orderTotalValueDisplay = orderTotalValue === null ? "TBD" : fmt.currency(orderTotalValue ?? 0);

  const bloombergSecuritiesMV = basketDetailsFromApi?.bloombergSecuritiesMarketValue;
  const bloombergSecuritiesMVDisplay = bloombergSecuritiesMV === null ? "TBD" : fmt.currency(bloombergSecuritiesMV ?? 0);
  const bloombergCash = basketDetailsFromApi?.bloombergCash;
  const bloombergCashDisplay = bloombergCash === null ? "TBD" : fmt.currency(bloombergCash ?? 0);

  const aladdinCash = basketDetailsFromApi?.aladdinCash;
  const aladdinCashDisplay = bloombergCash === null ? "TBD" : fmt.currency(aladdinCash ?? 0);
  const aladdinCashPercent = basketDetailsFromApi?.aladdinCashPercent;
  const aladdinCashPercentDisplay = bloombergCash === null ? "TBD" : Number(aladdinCashPercent).toFixed(2);

  //new fields
  const targetCashPercent = basketDetailsFromApi?.inKindPercent === null ? "TBD" : Number(100 - Number(basketDetailsFromApi?.inKindPercent)).toFixed(2)
  const aladdinSecuritiesMVPercent = basketDetailsFromApi?.aladdinSecuritiesMarketValue === null ? "TBD" : Number(100 - Number(aladdinCashPercent)).toFixed(2)
  const aladdinSecuritiesCount = basketDetailsFromApi?.aladdinSecuritiesCount === null ? "TBD" : basketDetailsFromApi?.aladdinSecuritiesCount

  //INPUT FIELDS Phase 2 INKIND %
  const savedInkindPercentValue =editableFieldsByProposalId[proposalId]?.inkindPercent ?? basketDetailsFromApi?.inKindPercent?.toString();

  const [localInkindPercent, setLocalInkindPercent] = useState<string>(savedInkindPercentValue);
  const [isTargetInkindFocused, setIsTargetInkindFocused] = useState(false);

  useEffect(() => {
  if (!isTargetInkindFocused) {
    setLocalInkindPercent(savedInkindPercentValue);
  }
}, [proposalId, savedInkindPercentValue, isTargetInkindFocused]);


  const handleLocalInkindPercentChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!isEditableInkindPercent) return;
  const value = e.target.value;

  const validPattern = /^(\d{0,3})(\.\d{0,2})?$/;

  if (!validPattern.test(value)) {
    return;
  }

  if (value !== "" && value !== "." && Number(value) > 100) {
    return;
  }

  setLocalInkindPercent(value);
};

  const handleLocalInkindPercentBlur = () => {
  let value = localInkindPercent.trim();

  if (value === "") {
    setLocalInkindPercent("");
    onInkindPercentChange(proposalId, "");
    return;
  }
  if (value.startsWith(".")) {
    value = `0${value}`;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    value = "";
  } else if (numericValue > 100) {
    value = "100.00";
  } else {
    value = numericValue.toFixed(2);
  }

  setLocalInkindPercent(value);
  onInkindPercentChange(proposalId, value);
};

  //INPUT FIELDS Phase 2 AladdinSecuritiesMV
  const savedaladdinSecuritiesMV =editableFieldsByProposalId[proposalId]?.aladdinSecuritiesMV ??basketDetailsFromApi?.aladdinSecuritiesMarketValue?.toString() ?? "";

  const [localaladdinSecuritiesMV, setLocalaladdinSecuritiesMV] = useState<string>(savedaladdinSecuritiesMV);
  const [isAladdinSecurityMvFocused, setIsAladdinSecurityMvFocused] = useState(false);
 

  useEffect(() => {
  if (!isAladdinSecurityMvFocused) {
    setLocalaladdinSecuritiesMV(savedaladdinSecuritiesMV);
  }
      }, [proposalId,savedaladdinSecuritiesMV,isAladdinSecurityMvFocused,]);

const handleLocalAladdinSecuritiesMVChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!isEditableAladdinMV) return;

  const value = e.target.value;

  const cleanedValue = value.replace(/[$,]/g, "");
  const validPattern = /^\d*\.?\d*$/;

  if (!validPattern.test(cleanedValue)) {
    return;
  }

  setLocalaladdinSecuritiesMV(cleanedValue);
};

const handleLocalAladdinSecuritiesMVBlur = () => {
  let value = localaladdinSecuritiesMV.trim();

  if (value === "") {
    setLocalaladdinSecuritiesMV("");
    onAladdinSecuritiesMVChange(proposalId, "");
    return;
  }
  if (value.startsWith(".")) {
    value = `0${value}`;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    value = "";
  } else if (numericValue < 0) {
    value = "";
  } else {
    value = numericValue.toFixed(2);
  }

  setLocalaladdinSecuritiesMV(value);
  onAladdinSecuritiesMVChange(proposalId, value);
};


    //SAVE LOGIC 
const [isSaving, setIsSaving] = useState<boolean>(false);

const handleSave = async () => {
  if (isSaving) {
    return;
  }

  //validation first
  const currentStatus = data?.data?.status
  
  if (
    currentStatus === "Proposed" &&
    (!localInkindPercent || localInkindPercent.trim() === "")
  ) {
    notify(
      {
        message: "Inkind Security MV % cannot be empty before clicking Save.",
        position: {
          my: "top center",
          at: "top center",
          of: window,
        },
      },
      "warning",
      2000
    );

    return;
  }

  // In Aladdin => validate Aladdin Securities MV $
  if (
    currentStatus === "In Aladdin" &&
    (!localaladdinSecuritiesMV ||
      localaladdinSecuritiesMV.trim() === "")
  ) {
    notify(
      {
        message:
          "Aladdin Securities MV $ cannot be empty before clicking Save.",
        position: {
          my: "top center",
          at: "top center",
          of: window,
        },
      },
      "warning",
      2000
    );

    return;
  }


  try {
    setIsSaving(true);

    const aladdinsecurityMVFinalValue = data?.data?.status === "Proposed" ? null : localaladdinSecuritiesMV

    await sendBasketDetails(
      basketNegID,
      localInkindPercent,
      aladdinsecurityMVFinalValue,
      createdBy
    );

    showTemporarySaveMessage(basketNegID,"Saved successfully");

    // GET the latest basket details
    await onRefreshBasketDetails(basketNegID);

  } catch (error) {
    console.error("Failed to save basket information:", error);
  
    showTemporarySaveMessage(basketNegID,"Save failed");
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className={styles.detailPanel}>
      <div className={styles.sectionTitle}>
        Basket Information{info?.bbgTicker ? ` - ${info.bbgTicker}` : ""}
      </div>
      <div className={styles.infoSection}>
        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
            <CircularProgress size={16} />
            <Typography sx={{ fontSize: 12, color: "#717182" }}>Loading securities data...</Typography>
          </Box>
        ) : (
          <div className={styles.infoGrid}>
            {/* empty row */}
            <div className={styles.kv}><div className={styles.k}></div><div className={styles.v}>{}</div></div>
            <div className={styles.kv}><div className={styles.k}></div><div className={styles.v}>{}</div></div>
            <div className={styles.kv}><div className={styles.k}></div><div className={styles.v}>{}</div></div>
            <div className={styles.kv}><strong>Aladdin</strong><div className={styles.k}></div><div className={styles.v}>{}</div></div>

            <div className={styles.kv}><div className={styles.k}>Basket ID</div><div className={styles.v}>{info?.basketId}</div></div>
            <div className={styles.kv}><div className={styles.k}>Desired # Units</div><div className={styles.v}>{fmt.number(desiredUnits)}</div></div>
            <div className={styles.kv}><div className={styles.k}>Number of Securities</div><div className={styles.v}>{info?.securitiesCount}</div></div>
            <div className={styles.kv}><div className={styles.k}>Number of Securities</div><div className={styles.v}>{aladdinSecuritiesCount}</div></div>
            <div className={styles.kv}><div className={styles.k}>Timestamp</div><div className={styles.v}>{info?.timestamp}</div></div>
            <div className={styles.kv}><div className={styles.k}>Creation Unit Size</div><div className={styles.v}>{fmt.number(creationUnitSize, 0)}</div></div>
            <div className={styles.kv}><div className={styles.k}>Inkind Security MV %</div>  

                      <input
                          ref={(el) => {inKindRefs.current[basketNegID] = el;}}
                          className={styles.numberInput}
                          type="text"
                          value={localInkindPercent}
                          onChange={handleLocalInkindPercentChange}
                          disabled={!isEditableInkindPercent}
                          onFocus={() => {
                            setIsTargetInkindFocused(true);
                            onFieldFocus(proposalId, "targetInkind");
                          }}
                          onBlur={() => {
                            handleLocalInkindPercentBlur();
                            setIsTargetInkindFocused(false);                                          
                            onFieldBlur()
                            onFocusInkindHandled();
                          }}
                      />
            </div>
            <div className={styles.kv}><div className={styles.k}>Aladdin Securities MV %</div><div className={styles.v}>{aladdinSecuritiesMVPercent}</div></div>          
            <div className={styles.kv}><div className={styles.k}>Dealer Desk</div><div className={styles.v}>{info?.dealerDesk}</div></div>
            <div className={styles.kv}><div className={styles.k}>Total Shares</div><div className={styles.v}>{fmt.number(info?.totalShares,0)}</div></div>
            <div className={styles.kv}><div className={styles.k}>Target Securities MV $</div><div className={styles.v}>{bloombergSecuritiesMVDisplay}</div></div>
            <div className={styles.kv}><div className={styles.k}>Aladdin Securities MV $</div>  
                      <input
                          ref={(el) => {aladdinMvRefs.current[basketNegID] = el;}}
                          className={styles.numberInput}
                          style={{width: '40%'}}
                          type="text"
                          value={isAladdinSecurityMvFocused? localaladdinSecuritiesMV: formatCurrency(localaladdinSecuritiesMV)}
                          onChange={handleLocalAladdinSecuritiesMVChange}
                          disabled={!isEditableAladdinMV}
                          onFocus={() => {setIsAladdinSecurityMvFocused(true);
                                          onFieldFocus(proposalId, "aladdinSecurityMV");}}
                          onBlur={() => {handleLocalAladdinSecuritiesMVBlur();
                                         setIsAladdinSecurityMvFocused(false);                                          
                                         onFieldBlur();
                                         onFocusAladdinMvHandled();
                                        }}                       
                        />
            </div>  
            <div className={styles.kv}><div className={styles.k}>Dealer Email</div><div className={styles.v}>{info?.dealerEmail}</div></div>
            <div className={styles.kv}><div className={styles.k}>NAV</div><div className={styles.v}>{previousDayNav}</div></div>                 
            <div className={styles.kv}><div className={styles.k}>Target Cash $</div><div className={styles.v}>{bloombergCashDisplay}</div></div>
            <div className={styles.kv}><div className={styles.k}>Aladdin Cash $</div><div className={styles.v}>{aladdinCashDisplay}</div></div>               
            <div className={styles.kv}><div className={styles.k}></div><div className={styles.v}>{}</div></div>            
            <div className={styles.kv}><div className={styles.k}>Order Total Value</div><div className={styles.v}>{orderTotalValueDisplay}</div></div>

            <div className={styles.kv}><div className={styles.k}>Target Cash %</div><div className={styles.v}>{targetCashPercent}</div></div> 
            <div className={styles.kv}><div className={styles.k}>Aladdin Cash %</div><div className={styles.v}>{aladdinCashPercentDisplay}</div></div> 
            
            
            
            
            
            
            
            

            
           
                     
                  
          </div> // end of infoGrid
        )}
      </div> {/* end of infoSection */}

        {currentStatus !== "Published" && (
          <div className={styles.saveButtonContainer}>
            {saveMessage && (
              <span className={styles.saveMessage}>
                {saveMessage}
              </span>
            )}

            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <CircularProgress size={14} className={styles.saveSpinner} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        )}


    </div> // end of BasketDetails Panel
  );
};

BasketDetails.displayName = "BasketDetails";

function renderStatusCell(cell: { data: BasketProposal }) {
  return <StatusCell data={cell.data} />;
}

function renderConditionsCell(cell: { data: BasketProposal }) {
  return <ConditionsCell data={cell.data} />;
}

interface OpenBsktOrderSnapshotsPopupBtnProps {
    onOpen: () => void;
    onClose: () => void;
}

interface OpenBsktOrderPopupBtnProps {
    onOpen: () => void;
    onClose: () => void;
}

const OpenBsktOrderPopupBtn = ({onOpen, onClose}: OpenBsktOrderPopupBtnProps) => {
    const [showBsktOrder, setShowBsktOrder] = useState(false);
    return (
        <>
        <Button
            variant="text"
            size="small"
            sx={{ textTransform: "none", fontWeight: 800 }}
            onClick={() => {
                onOpen();
                setShowBsktOrder(true);
            }}
        >
            Basket Order
        </Button>
        {showBsktOrder && (
            <BsktOrderPopup
                show={showBsktOrder}
                onClose={() => {
                        setShowBsktOrder(false);
                        onClose();
                    }
                }
            />
        )}
        </>
    )
};

const OpenBsktOrderSnapshotsPopupBtn = ({onOpen, onClose}: OpenBsktOrderSnapshotsPopupBtnProps) => {
    const [showBsktOrderSnapshots, setShowBsktOrderSnapshots] = useState(false);
    return (
        <>
        <Button
            variant="text"
            size="small"
            sx={{ textTransform: "none", fontWeight: 800 }}
            onClick={() => {
                onOpen();
                setShowBsktOrderSnapshots(true);
            }}
        >
            Basket Order Snapshots
        </Button>
        {showBsktOrderSnapshots && (
            <BsktOrderSnapshotsPopup
                show={showBsktOrderSnapshots}
                onClose={() => {
                        setShowBsktOrderSnapshots(false);
                        onClose();
                    }
                }
            />
        )}
        </>
    )
};

export default function BsktProposalsGrid() {
  const gridRef = useRef<dxDataGrid | null>(null);
  const { email: currentUser } = useUserInfo();

  const [showOverridePopup, setShowOverridePopup] = useState(false);
  const [showOrderSnapshotPopup, setShowOrderSnapshotPopup] = useState(false);
  const [showBsktOrderPopup, setShowBsktOrderPopup] = useState(false);
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

  //prevent polling when editing
  const isEditingTextboxRef = useRef(false);

  const editingFieldRef = useRef<{
  proposalId: string;
  fieldName: string;
} | null>(null);

  const handleFieldFocus = useCallback((proposalId: string, fieldName: string) => {
  isEditingTextboxRef.current = true;
  editingFieldRef.current = { proposalId, fieldName };
}, []);

const handleFieldBlur = useCallback(() => {
  isEditingTextboxRef.current = false;
  editingFieldRef.current = null;
}, []);

  //save fields
const [saveMessageByBasketId, setSaveMessageByBasketId] = useState<Record<number, string>>({});

const showTemporarySaveMessage = (basketNegotiationId: number, message: string) => {
  setSaveMessageByBasketId((prev) => ({
    ...prev,
    [basketNegotiationId]: message,
  }));

  setTimeout(() => {
    setSaveMessageByBasketId((prev) => ({
      ...prev,
      [basketNegotiationId]: "",
    }));
  }, 1000);
};

type EditableFields = {
  inkindPercent: string;
  aladdinSecuritiesMV: string;
};

const [editableFieldsByProposalId, setEditableFieldsByProposalId] = useState<
  Record<string, EditableFields>
>({});

const handleInkindPercentChange = (proposalId: string, value: string) => {
  const validPattern = /^(\d{0,3})(\.\d{0,2})?$/;

  if (!validPattern.test(value)) {
    return;
  }

  const numericValue = Number(value);

  if (value !== "" && numericValue > 100) {
    return;
  }

  setEditableFieldsByProposalId((prev) => {
    const currentFields = prev[proposalId] ?? {
      inkindPercent: "",
    };

    return {
      ...prev,
      [proposalId]: {
        ...currentFields,
        inkindPercent: value,
      },
    };
  });
};

const handleAladdinSecuritiesMVChange = (
  proposalId: string,
  value: string
) => {
  // Remove commas from copied/pasted value
  const cleanedValue = value.replace(/,/g, "");

  // Allows:
  // 123
  // 123.45
  // 123.456789
  // empty string
  const validPattern = /^\d*\.?\d*$/;

  if (!validPattern.test(cleanedValue)) {
    return;
  }

  setEditableFieldsByProposalId((prev) => {
    const currentFields = prev[proposalId] ?? {
      aladdinSecuritiesMV: "",
    };

    return {
      ...prev,
      [proposalId]: {
        ...currentFields,
        aladdinSecuritiesMV: cleanedValue,
      },
    };
  });
};
  //end of editable fields

  //api fields
const [basketDetailsByNegotiationId, setBasketDetailsByNegotiationId] =
  useState<Record<number, BasketDetailsObj>>({});

const [, setLoadingBasketDetailsByNegotiationId] =
  useState<Record<number, boolean>>({});

const loadBasketDetailsForRow = useCallback(
  async (basketNegotiationId: number) => {
    try {
      setLoadingBasketDetailsByNegotiationId((prev) => ({
        ...prev,
        [basketNegotiationId]: true,
      }));

      const response = await getBasketDetails(basketNegotiationId);

      setBasketDetailsByNegotiationId((prev) => {
        const next = {
          ...prev,
          [basketNegotiationId]: response.basketDetails,
        };

        return next;
      });
    } catch (error) {
      console.error(
        "Failed to load basket details for basketNegotiationId:",
        basketNegotiationId,
        error
      );
    } finally {
      setLoadingBasketDetailsByNegotiationId((prev) => ({
        ...prev,
        [basketNegotiationId]: false,
      }));
    }
  },
  []
);
  //end of api fields

  //focus fields validation
  const [focusInkindBasketId, setFocusInkindBasketId] = useState<number | null>(null);
  const [focusAladdinMvBasketId, setFocusAladdinMvBasketId] = useState<number | null>(null);
  

  const expandAndFocusInkindPercent = useCallback(
    async (basketNegotiationId: number, rowKey: RowKey) => {

    const grid = gridRef.current;

    if (grid) {
      grid.expandRow(rowKey);
    }

    await loadBasketDetailsForRow(basketNegotiationId);

    window.setTimeout(() => {
      requestInkindFocus(Number(rowKey));
    }, 300);
  },
  [gridRef, loadBasketDetailsForRow]
);


  const expandAndFocusAladdinMv = useCallback(
    async (basketNegotiationId: number, rowKey: RowKey) => {
    const grid = gridRef.current;

    if (grid) {
      grid.expandRow(rowKey);
    }

    await loadBasketDetailsForRow(basketNegotiationId);

    window.setTimeout(() => {
      requestAladdinMvFocus(Number(rowKey));
    }, 300);
  },
  [gridRef,loadBasketDetailsForRow]
);

//helper focus functions
const requestInkindFocus = (basketId: number) => {
  setFocusAladdinMvBasketId(null);
  setFocusInkindBasketId(null);

  window.setTimeout(() => {
    setFocusInkindBasketId(basketId);
  }, 0);
};

const requestAladdinMvFocus = (basketId: number) => {
  setFocusInkindBasketId(null);
  setFocusAladdinMvBasketId(null);

  window.setTimeout(() => {
    setFocusAladdinMvBasketId(basketId);
  }, 0);
};



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

  const securitiesMvCacheRef = useRef<Record<string, number | null>>({});
  const proposalsRef = useRef<BasketProposal[] | undefined>(undefined);

  const fetchSecuritiesMv = useCallback(async (proposal: BasketProposal) => {
    setTimeout(() => {
      setProposals((prev) =>
        prev?.map((p) =>
          p.id === proposal.id
            ? { ...p, basketInformation: { ...p.basketInformation, isLoadingMv: true } }
            : p
        )
      );
    }, 0);
    try {
      const res = await getAladdinBasketSecurities(Number(proposal.id), currentUser);
      const mv = res?.totalMarketValue ?? null;
      securitiesMvCacheRef.current[proposal.id] = mv;
      setProposals((prev) =>
        prev?.map((p) =>
          p.id === proposal.id
            ? { ...p, basketInformation: { ...p.basketInformation, securitiesMv: mv, isLoadingMv: false } }
            : p
        )
      );
    } catch {
      securitiesMvCacheRef.current[proposal.id] = null;
      setProposals((prev) =>
        prev?.map((p) =>
          p.id === proposal.id
            ? { ...p, basketInformation: { ...p.basketInformation, securitiesMv: null, isLoadingMv: false } }
            : p
        )
      );
    }
  }, [currentUser]);


  const handleRowExpanding = useCallback(
  (e: DataGridTypes.RowExpandingEvent<BasketProposal, RowKey>) => {
    const basketNegotiationId = Number(e.key);

    if (Number.isNaN(basketNegotiationId)) {
      console.error("Invalid basketNegotiationId from row key:", e.key);
      return;
    }

    // Call GET basket details when caret is clicked
    loadBasketDetailsForRow(basketNegotiationId);

    if (securitiesMvCacheRef.current[e.key] === undefined) 
    {
      const proposal = proposalsRef.current?.find((p) => p.id === e.key);

      if (proposal) 
      {
        fetchSecuritiesMv(proposal);
      }
    }
  },
  [fetchSecuritiesMv, loadBasketDetailsForRow]
);

  const refreshProposals = useCallback(async (signal?: AbortSignal) => {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const data = await getBasketProposals(currentUser, asOfDate, false, signal);
      const merged = data.map((p) => ({
        ...p,
        basketInformation: {
          ...p.basketInformation,
          securitiesMv: securitiesMvCacheRef.current[p.id] !== undefined ? securitiesMvCacheRef.current[p.id] : null,
          isLoadingMv: false,
        },
      }));
      proposalsRef.current = merged;
      setProposals(merged);
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
    if (isPageVisible && !showOverridePopup && !showOrderSnapshotPopup && !showBsktOrderPopup) {
      setPollingInterval(BASKET_POLLING_INTERVAL);
    }
    else {
      setPollingInterval(null);
    }
  }, [isPageVisible, showOverridePopup, showOrderSnapshotPopup, showBsktOrderPopup]);

 // poll data in intervals
  useInterval(() => {
    if (!isPolling && !isEditingTextboxRef.current) {
      pollingProposalData();
    }
  }, pollingInterval);

  const pollingProposalData = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsPolling(true);
      setRefreshError(null);
      const data = await getBasketProposals(currentUser, asOfDate, true, signal);
      const polledMerged = data.map((p) => ({
        ...p,
        basketInformation: {
          ...p.basketInformation,
          securitiesMv: securitiesMvCacheRef.current[p.id] !== undefined ? securitiesMvCacheRef.current[p.id] : null,
          isLoadingMv: false,
        },
      }));
      proposalsRef.current = polledMerged;
      setProposals(polledMerged);
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

  const normalizeValue = (value: string | number | null | undefined) => {
        if (value === null || value === undefined) {
          return "";
        }

        const trimmedValue = value.toString().trim();

        if (trimmedValue === "") {
          return "";
        }

        const numericValue = Number(trimmedValue);

        if (Number.isNaN(numericValue)) {
          return trimmedValue;
        }

        return numericValue.toFixed(2);
      };


  const runAction = useCallback(async <R,>(
  actionName: string,
  p: BasketProposal,
  action: (id: number) => Promise<R>
) => {
  setActionError(null);

  const id = getBasketNegotiationId(p);

  setActionBusyId(p.id);

  const responseBasketDetails = await getBasketDetails(id);
  const BasketDetails = responseBasketDetails?.basketDetails;
  const inkindSecurityMVPercent =BasketDetails.inKindPercent;
  const aladdinSecurityMV =BasketDetails.aladdinSecuritiesMarketValue;
  const localInkindSecurityMVPercent =editableFieldsByProposalId[BasketDetails.proposalId]?.inkindPercent;
  const localAladdinSecurityMV =editableFieldsByProposalId[BasketDetails.proposalId]?.aladdinSecuritiesMV;


  try {
    // Validation 1:
    // Send to Aladdin
    // If Inkind Security MV % is NULL in database
    if (
      actionName === "Send to Aladdin" &&
      p.status === "Proposed" &&
      inkindSecurityMVPercent == null
    ) {
      notify(
        {
          message:
            "Inkind Security MV % must be reviewed and saved before sending to Aladdin.",
          position: {
            my: "top center",
            at: "top center",
            of: window,
          },
        },
        "warning",
        3000
      );

      await expandAndFocusInkindPercent(id, p.id);

      setActionBusyId(null);
      return;
    }

    // Validation 1.5:
    // Send to Aladdin
    // If Inkind Security MV % is Different from database value because user did not save
    if (
      actionName === "Send to Aladdin" &&
      p.status === "Proposed" &&
      localInkindSecurityMVPercent !== undefined &&
      normalizeValue(localInkindSecurityMVPercent) !==
        normalizeValue(inkindSecurityMVPercent)
    ) {
      notify(
        {
          message:
            "You have unsaved changes for Inkind Security MV %. Please save before sending to Aladdin.",
          position: {
            my: "top center",
            at: "top center",
            of: window,
          },
        },
        "warning",
        3000
      );

      await expandAndFocusInkindPercent(id, p.id);

      setActionBusyId(null);
      return;
    }


    // Validation 2:
    // Publish
    // If Aladdin Securities MV $ is Null in the database
    if (
      actionName === "Publish" &&
      p.status === "In Aladdin" &&
      aladdinSecurityMV == null
    ) {
      notify(
        {
          message:
            "Aladdin Securities MV $ must be reviewed and saved before publishing to Aladdin.",
          position: {
            my: "top center",
            at: "top center",
            of: window,
          },
        },
        "warning",
        3000
      );

      await expandAndFocusAladdinMv(id, p.id);

      setActionBusyId(null);
      return;
    }

    // Validation 2.5:
    // Publish
    // If Aladdin Securities MV $ is Different from database value because user did not save
    if (
      actionName === "Publish" &&
      p.status === "In Aladdin" &&
      localAladdinSecurityMV !== undefined &&
      normalizeValue(localAladdinSecurityMV) !==
        normalizeValue(aladdinSecurityMV)
    ) {
      notify(
        {
          message:
            "You have unsaved changes for Aladdin Securities MV $. Please save before publishing to Aladdin.",
          position: {
            my: "top center",
            at: "top center",
            of: window,
          },
        },
        "warning",
        3000
      );

      await expandAndFocusAladdinMv(id, p.id);

      setActionBusyId(null);
      return;
    }

    

    // End of validation

    if (actionName === "Publish") {
      setSelectedProposal(p);
      setBasketNegoId(id);
      setShowOverridePopup(true);
      return;
    }

    await action(id);

    await new Promise((r) => setTimeout(r, 250));

    await refreshProposals();
  } catch (error) {
    console.error(`Failed action: ${actionName}`, error);

    setActionError(
      `Failed to "${actionName}", please contact a developer.`
    );
  } finally {
    if (
      actionName !== "Publish" &&
      actionName !== "ShowBasketOrder"
    ) {
      setActionBusyId(null);
    }
  }
}, [
  getBasketNegotiationId,
  refreshProposals,
  expandAndFocusInkindPercent,
  expandAndFocusAladdinMv,
  editableFieldsByProposalId,
]);

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
            onRowExpanding={handleRowExpanding}
            loadPanel={{enabled: isPolling ? false : true}}
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
            {/* <MasterDetail enabled={false} component={BasketDetails} /> */}

            <MasterDetail
            enabled={false}
            render={(detailData) => (
              <BasketDetails
                data={detailData}
                editableFieldsByProposalId={editableFieldsByProposalId}
                onInkindPercentChange={handleInkindPercentChange}
                onAladdinSecuritiesMVChange={handleAladdinSecuritiesMVChange}       
                basketDetailsFromApi={basketDetailsByNegotiationId[detailData.data.id]}
                onRefreshBasketDetails={loadBasketDetailsForRow}                
                saveMessage={saveMessageByBasketId[detailData.data.id] ?? ""}
                showTemporarySaveMessage={showTemporarySaveMessage}              
                onFieldFocus={handleFieldFocus}
                onFieldBlur={handleFieldBlur}
                focusInkindBasketId={focusInkindBasketId}
                onFocusInkindHandled={() => setFocusInkindBasketId(null)}
                focusAladdinMvBasketId={focusAladdinMvBasketId}
                onFocusAladdinMvHandled={() => setFocusAladdinMvBasketId(null)}
              />
            )}
           />       

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
            <Divider sx={{ mt: 2, mb: 1 }} />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                    Test Basket Orders:
                </Typography>

                <Box sx={{marginLeft: "auto", display: "flex", gap: 1}} >
                    <OpenBsktOrderSnapshotsPopupBtn onOpen={() => setShowOrderSnapshotPopup(true)} onClose={() => setShowOrderSnapshotPopup(false)} />
                    <OpenBsktOrderPopupBtn  onOpen={() => setShowBsktOrderPopup(true)} onClose={() => setShowBsktOrderPopup(false)}/>
                </Box>
            </Box>

            <Divider sx={{ mt: 1, mb: 1.5 }} />

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