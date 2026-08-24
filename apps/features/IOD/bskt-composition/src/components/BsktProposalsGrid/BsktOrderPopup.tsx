import { useRef, useState, useCallback } from "react";
import { Popup } from "devextreme-react/popup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import CloseIcon from "@mui/icons-material/Close";

import styles from "./BsktOrderSnapshotsPopup.module.css";
import { getBbgBasketOrder } from "./../../services/basketNegotiationService";


interface ContentViewProps {
    orderId: string;
    isLoading: boolean;
    result: string | null;
    error: string | null;
    onOrderIdChange: (value: string) => void;
    onLoad: () => void;
    onClose: () => void;
}


const ContentView = ({
    orderId,
    isLoading,
    result,
    error,
    onOrderIdChange,
    onLoad,
    onClose
}: ContentViewProps) => { 
        return (
        <div className={styles.popupBody}>
            <div className={styles.parametersGrid}>
                <div className={styles.parametersLabel}>Order Id:</div>
                <div className={styles.parametersInputActionRow}>
                    <div className={styles.parametersInput}>
                        <TextField
                            size="small"
                            onChange={(e) => {onOrderIdChange(e.target.value)}}
                            value={orderId}
                        >
                        </TextField>
                    </div>
                    <Button
                        variant="contained"
                        disableElevation
                        onClick={onLoad}
                        className={styles.actionBtn}
                        disabled={isLoading}>
                        Load Basket Order
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
                  onClick={onClose}
                  className={styles.popupCloseBtn}
                  disabled={isLoading}
                >
                  Close
                </Button>
            </div>
        </div>
    )};


interface BsktOrderPopupProps {
    show: boolean;
    onClose: () => void;
};

export function BsktOrderPopup({ show, onClose }: BsktOrderPopupProps) {
    const [orderId, setOrderId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const handleClose = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        onClose();
    }, [onClose]);

    const handleGetOrder = async () => {
        if (!orderId) {
            return;
        };

        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoading(true);
        setResult(null);
        setError(null);

        const fetchData = async () => {
            try {
                const response = await getBbgBasketOrder(orderId, controller.signal);
                setResult(response);
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
        };

        fetchData();
    };

    const Header = () => {
        return (
            <div className={styles.popupHeaderWrap}>
                <div className={styles.popupHeaderRow}>
                  <Typography className={styles.popupTitleText}>BBG Basket Order</Typography>

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
                    <ContentView 
                        orderId={orderId}
                        isLoading={isLoading}
                        result={result}
                        error={error}
                        onOrderIdChange={setOrderId}
                        onLoad={handleGetOrder}
                        onClose={handleClose}
                    />
                </div>
          </Popup>
        </div>
    );
}
