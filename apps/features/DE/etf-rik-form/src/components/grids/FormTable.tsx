import { useNavigate } from "react-router-dom"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    LinearProgress,
    Box
} from "@mui/material";


import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import CircularProgress from "@mui/material/CircularProgress";
import { getStatusColor } from "../../utils/common";
import { useDeleteETFTransferRequest, useDownloadETFTransferRequest } from "../../hooks/useETFTransfer";
import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import Collapse from "@mui/material/Collapse";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import OrderStatusTimeline from "../order-status-timeline";
import { ETFTransferRequest } from "../../types/response";


interface Props {
    data: ETFTransferRequest[];
    email: string;
}


const FormTable: React.FC<Props> = ({ data, email }: Props) => {

    const navigate = useNavigate();

    const [expandedRows, setExpandedRows] =
        useState<Record<string, boolean>>({});
    // const canViewAll = hasPermission(access ?? {}, VIEWALL)

    const deleteMutation = useDeleteETFTransferRequest();
    const downloadMutation = useDownloadETFTransferRequest();
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const isFetching = useIsFetching({ queryKey: ["etf-transfer-requests"] })
    const [deletingId, setDeletingId] = useState<string | null | undefined>(null);
    const handleEdit = (id?: string) => {
        navigate(`/de/etfrikform/detail/${id}`); // ✅ relative navigation
    };

    const handleDelete = (id?: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this request?");
        if (!confirmed) return;

        setDeletingId(id);
        deleteMutation.mutate(id, {
            onSettled: () => setDeletingId(null)
        });
    };

    const handleDownload = async (id?: string, mode: string = 'order') => {
        if (!id) return;
        try {
            setDownloadingId(id);
            await downloadMutation.mutateAsync({ id, mode });
        } finally {
            setDownloadingId(null);
        }
    };

    // useEffect(() => {
    //     const next: Record<string, boolean> = {};

    //     data.forEach((row, index) => {
    //         if (row.id) {
    //             next[row.id] = index === 0;
    //         }
    //     });

    //     setExpandedRows(next);
    // }, [data]);
    useEffect(() => {
        if (!data.length) {
            setExpandedRows({});
            return;
        }

        setExpandedRows({
            [data[0].id!]: true,
        });
    }, [data]);
    return (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
            {isFetching > 0 && <LinearProgress />}
            <Table size="small" sx={{
                "& .MuiTableCell-root": {
                    py: 0.6,          // tighter vertical spacing
                    px: 1,
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap" // ✅ prevent wrapping
                }
            }}>
                <TableHead sx={{ backgroundColor: "#f5f7fa" }}>
                    <TableRow>
                        <TableCell width={40} />

                        <TableCell><b>Form ID</b></TableCell>
                        <TableCell><b>Created By</b></TableCell>
                        <TableCell><b>Created On</b></TableCell>
                        <TableCell><b>Status</b></TableCell>
                        <TableCell align="center"><b>Actions</b></TableCell>
                    </TableRow>
                </TableHead>


                <TableBody>

                    {data.length > 0 ? (
                        data.map((row: ETFTransferRequest) => {
                            const isOwner = row.created_by?.toLowerCase() === email?.toLowerCase()
                            const canEdit =
                                isOwner &&
                                ['DRAFT', 'FAILED', 'NEW'].includes(row.status);
                            return (
                                <>
                                    <TableRow
                                        key={row.id}
                                        hover
                                        sx={{
                                            "&:nth-of-type(odd)": { backgroundColor: "#fafafa" }
                                        }}
                                    >
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setExpandedRows((prev) => ({
                                                        ...prev,
                                                        [row.id!]:
                                                            !prev[row.id!]
                                                    }))
                                                }
                                            >
                                                {expandedRows[row.id!] ? (
                                                    <KeyboardArrowDownIcon />
                                                ) : (
                                                    <KeyboardArrowRightIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={500}>
                                                {row.request_reference}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{row.created_by}</TableCell>
                                        <TableCell>
                                            {new Date(row.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>

                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Chip
                                                    color={getStatusColor(row.status)}
                                                    label={row.status_display}
                                                    size="small"
                                                />

                                            </div>

                                        </TableCell>

                                        {/* ✅ ACTIONS COLUMN */}
                                        <TableCell align="center">

                                            {canEdit ? (
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        color="secondary"
                                                        onClick={() => handleEdit(row.id)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="View">
                                                    <IconButton
                                                        color="secondary"
                                                        onClick={() => handleEdit(row.id)}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {row.spir_file && (
                                                <Tooltip title="Download SPIR File">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            disabled={downloadingId === row.id}
                                                            onClick={() => handleDownload(row.id, "request")}
                                                        >
                                                            {downloadingId === row.id ? (
                                                                <CircularProgress size={16} />
                                                            ) : (
                                                                <DownloadIcon fontSize="small" />
                                                            )}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            )}

                                            {isOwner && ['NEW', 'DRAFT'].includes(row.status) && (
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDelete(row.id)}
                                                        disabled={deletingId === row.id}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            sx={{
                                                p: 0,
                                                border: 0
                                            }}
                                        >
                                            <Collapse
                                                in={expandedRows[row.id!]}
                                                timeout="auto"
                                                unmountOnExit
                                            >{row.orders.length === 0 ? (
                                                <Box p={2} textAlign="center">
                                                    No Orders found!
                                                </Box>
                                            ) : (
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        mx: 1,
                                                        mb: 1,
                                                        p: 1,
                                                        bgcolor: "#fafbfd",
                                                        border: "1px solid #e6eaf0"
                                                    }}
                                                >
                                                    {row.orders?.map((order) => (
                                                        <Box
                                                            key={order.id}
                                                            display="flex"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            sx={{
                                                                py: 1,
                                                                px: 1,
                                                                borderBottom: "1px solid #edf1f5",
                                                                "&:last-child": {
                                                                    borderBottom: 0
                                                                }
                                                            }}
                                                        >
                                                            <Box>
                                                                <Typography
                                                                    fontWeight={600}
                                                                    fontSize="0.85rem"
                                                                >
                                                                    {order.order_id}
                                                                </Typography>

                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {order.allocations?.length ?? 0} Allocation(s)
                                                                </Typography>
                                                            </Box>

                                                            <Box
                                                                display="flex"
                                                                alignItems="center"
                                                                gap={0.5}
                                                            >
                                                                <OrderStatusTimeline
                                                                    status={order.status}
                                                                    failedStep={order.failed_step}
                                                                />
                                                                {/* <Chip
                                                                        size="small"
                                                                        label={order.status}
                                                                        color={getStatusColor(order.status)}
                                                                    /> */}

                                                                {order.status == "FILE_GENERATED" && (
                                                                    <Box display="flex" gap={0.5}>
                                                                        {order.ssb_plf_file && (
                                                                            <Tooltip title="Download SSB PLF File">
                                                                                <span>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        color="primary"
                                                                                        disabled={downloadingId === order.id}
                                                                                        onClick={() => handleDownload(order.id)}
                                                                                    >
                                                                                        {downloadingId === order.id ? (
                                                                                            <CircularProgress size={16} />
                                                                                        ) : (
                                                                                            <DownloadIcon fontSize="small" />
                                                                                        )}
                                                                                    </IconButton>
                                                                                </span>
                                                                            </Tooltip>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Paper>)}
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                No forms available
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>

            </Table>
        </TableContainer >
    );
};

export default FormTable;
