import {
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { CatalogReport } from "../types/catalog";

interface CatalogTableProps {
    rows: CatalogReport[];
    loading: boolean;

    totalCount: number;

    page: number;
    pageSize: number;

    onPageChange: (
        page: number
    ) => void;

    onRowsPerPageChange: (
        size: number
    ) => void;

    // onView: (
    //     row: CatalogReport
    // ) => void;

    onEdit: (
        row: CatalogReport
    ) => void;

    onDelete: (
        row: CatalogReport
    ) => void;
}

export const CatalogTable = ({
    rows,
    loading,
    totalCount,
    page,
    pageSize,
    onPageChange,
    onRowsPerPageChange,
    onEdit,
    onDelete,
}: CatalogTableProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            <TableContainer
                sx={{
                    maxHeight: 700,
                }}
            >
                <Table
                    stickyHeader
                    size="small"
                >
                    <TableHead>
                        <TableRow
                            sx={{
                                bgcolor: "grey.100",
                                "& .MuiTableCell-head": {
                                    fontWeight: 700,
                                    color: "text.primary",
                                    fontSize: "0.875rem",
                                    borderBottom: "2px solid",
                                    borderColor: "divider",
                                },
                            }}
                        >
                            <TableCell width={120}>
                                Report #
                            </TableCell>

                            <TableCell>
                                Report Name
                            </TableCell>

                            <TableCell width={150}>
                                Department
                            </TableCell>


                            <TableCell width={150}>
                                Author
                            </TableCell>

                            <TableCell width={120}>
                                Status
                            </TableCell>

                            <TableCell width={180}>
                                Modified
                            </TableCell>

                            <TableCell
                                width={140}
                                align="center"
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    align="center"
                                    sx={{ py: 5 }}
                                >
                                    <CircularProgress
                                        size={28}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    align="center"
                                    sx={{ py: 5 }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        No catalog records found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow
                                    hover
                                    key={row.catalogid}
                                >
                                    <TableCell>
                                        {row.reportnum || "-"}
                                    </TableCell>

                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                        >
                                            {row.reportname}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {row.departmentname ||
                                            "-"}
                                    </TableCell>


                                    <TableCell>
                                        {row.author ||
                                            "-"}
                                    </TableCell>

                                    <TableCell>
                                        <StatusChip
                                            status={
                                                row.status
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {row.modifieddate
                                            ? new Date(
                                                row.modifieddate
                                            ).toLocaleString()
                                            : "-"}
                                    </TableCell>

                                    <TableCell>
                                        <Stack
                                            direction="row"
                                            justifyContent="center"
                                            spacing={0.5}
                                        >
                                            {/* <Tooltip title="View">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        onView(
                                                            row
                                                        )
                                                    }
                                                >
                                                    <VisibilityOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip> */}

                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        onEdit(
                                                            row
                                                        )
                                                    }
                                                >
                                                    <EditOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {!["Inactive", "Retired"].includes(row.status ?? '') && (
                                                <Tooltip title="Deactivate">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() =>
                                                            onDelete(
                                                                row
                                                            )
                                                        }
                                                    >
                                                        <DeleteOutlineOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                page={page}
                count={totalCount}
                rowsPerPage={pageSize}
                rowsPerPageOptions={[
                    10,
                    25,
                    50,
                    100,
                ]}
                onPageChange={(
                    _,
                    newPage
                ) =>
                    onPageChange(
                        newPage
                    )
                }
                onRowsPerPageChange={(
                    e
                ) =>
                    onRowsPerPageChange(
                        Number(
                            e.target.value
                        )
                    )
                }
            />
        </Paper>
    );
};

function StatusChip({
    status,
}: {
    status?: string | null;
}) {
    if (!status) {
        return (
            <Chip
                size="small"
                label="-"
            />
        );
    }

    const color =
        status === "Active"
            ? "success"
            : status === "Retired"
                ? "warning"
                : "default";

    return (
        <Chip
            size="small"
            color={color}
            label={status}
        />
    )
}