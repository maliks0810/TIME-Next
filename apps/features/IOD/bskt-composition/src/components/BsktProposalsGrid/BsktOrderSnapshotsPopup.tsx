import { useRef, useState, useCallback } from "react";
import { Popup } from "devextreme-react/popup";
import { DateBox } from "devextreme-react/date-box"

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";

import styles from "./BsktOrderSnapshotsPopup.module.css";
import { getBbgBasketOrderSnapshots } from "./../../services/basketNegotiationService";
import { BbgBasketOrderSnapshot } from "./../../services/domain-objects/bbgBasketOrderSnapshot";

type BsktOrderSnapshotsPopupProps = {
    show: boolean;
    onClose: () => void;
};

export function BsktOrderSnapshotsPopup({ show, onClose }: BsktOrderSnapshotsPopupProps) {
    const [tradeDate, setTradeDate] = useState<Date | null>(new Date());
    const [includeFutureTradeDates, setIncludeFutureTradeDates] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<BbgBasketOrderSnapshot[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
 
    const handleClose = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        onClose();
    }, [show, onClose]);

    const handleGetSnapshots = useCallback(async () => {
        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const snapshots = await getBbgBasketOrderSnapshots(tradeDate != null ? tradeDate : new Date(), includeFutureTradeDates, controller.signal);
            setResult(snapshots);
        }
        catch (e) {
            if (controller.signal.aborted) return;
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        }
        finally {
            if (abortRef.current === controller){
                setIsLoading(false);
                abortRef.current = null;
            }
        }
    }, [tradeDate, includeFutureTradeDates]);


    const Header = () => {
        const title = "BBG Basket Order Snapshots";

        return (
            <div className={styles.popupHeaderWrap}>
                <div className={styles.popupHeaderRow}>
                  <Typography className={styles.popupTitleText}>{title}</Typography>

                  <div className={styles.popupHeaderActions}>
                    <IconButton
                      size="small"
                      onClick={handleClose}
                      aria-label="Close"
                      className={styles.popupCloseIcon}
                      disabled={isLoading}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                <div className={styles.popupHeaderGradientBar} />
            </div>
        );
    };

    const ContentView = () => (
        <div className={styles.popupBody}>
            <div className={styles.parametersGrid}>
                <div className={styles.parametersLabel}>Trade Date:</div>
                <div className={styles.parametersInput}>
                    <DateBox 
                        type="date"
                        width={200}
                        displayFormat="MM/dd/yyyy"
                        value={tradeDate}
                        onValueChanged={(e) => setTradeDate(e.value)}
                    />
                </div>
                <div className={styles.parametersLabel}>Include Future Trade Dates:</div>
                <div className={styles.parametersInputActionRow}>
                    <div className={styles.parametersInput}>
                        <input 
                            title="Include Future Trade Dates"
                            type="checkbox"
                            checked={includeFutureTradeDates}
                            onChange={(e) => setIncludeFutureTradeDates(e.target.checked)}
                            className={styles.cbxStyle}
                        />
                    </div>
                    <Button
                        variant="contained"
                        disableElevation
                        onClick={handleGetSnapshots}
                        className={styles.actionBtn}
                        disabled={isLoading}
                        >
                        Load Snapshots
                    </Button>
                </div>
            </div>
            <div className={styles.contentBlock}>
                <div >
                    {isLoading && <div>Requesting...</div>}
                    {error && (
                        <div className={styles.errorBlock}>{error}</div>
                    )}
                    {!isLoading && result && (
                        <pre>
                            {JSON.stringify(result, null, 4)}
                        </pre>
                    )}
                </div>
            </div>
            <div className={styles.popupFooter}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  className={styles.popupCloseBtn}
                  disabled={isLoading}
                >
                  Close
                </Button>
            </div>
        </div>
    );

    return (
        <div> 
            <Popup
                visible={show}
                onHiding={handleClose}
                hideOnOutsideClick={false}
                dragEnabled={false}
                showTitle={false}
                height="55%"
                resizeEnabled={false}
                position="center"
                width="40%"
                className={styles.popupNoScroll}
          >
                <div className={styles.popupRoot}>
                    <Header />
                    <ContentView />
                </div>
          </Popup>
        </div>
    );
}
