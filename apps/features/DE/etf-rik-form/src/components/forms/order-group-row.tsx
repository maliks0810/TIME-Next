import OrderStatusTimeline, { OrderStatus } from "../order-status-timeline";
import {
    Box,
    Typography,
    TableRow,
    TableCell
} from "@mui/material";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ReplayIcon from "@mui/icons-material/Replay";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { useSubmitETFTransferOrder } from "../../hooks/useETFTransfer";

interface Props {
    requestId: string;
    orderId: string;
    status: OrderStatus;
    failedStep?: OrderStatus;
    canSubmit: boolean;
    collapsed: boolean;
    colSpan: number;
    onToggle: () => void;
}

const OrderGroupRow = ({
    requestId,
    orderId,
    status,
    failedStep,
    canSubmit,
    collapsed,
    colSpan,
    onToggle
}: Props) => {
    const orderSubmitMutation = useSubmitETFTransferOrder(requestId)
    const handleRetry = async () => {
        await orderSubmitMutation.mutateAsync(orderId);
    };
    return (
        <TableRow
            sx={{
                backgroundColor: "#F8FAFC"
            }}
        >
            <TableCell
                colSpan={colSpan}
                onClick={onToggle}
                sx={{
                    cursor: "pointer",
                    py: 1
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                    >
                        {collapsed ? (
                            <KeyboardArrowRightIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}

                        <Typography
                            fontWeight={700}
                            color="primary"
                        >
                            Order ID: {orderId}
                        </Typography>
                    </Box>

                    <OrderStatusTimeline
                        status={status}
                        failedStep={failedStep}
                    />
                </Box>
            </TableCell>
            <TableCell align="center">
                {status === "FAILED" && canSubmit && (
                    <Tooltip title="Resubmit Order">
                        <IconButton
                            size="small"
                            color="warning"
                            disabled={orderSubmitMutation.isPending}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRetry()
                            }}
                        >
                            <ReplayIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </TableCell>
        </TableRow>
    );
};

export default OrderGroupRow;