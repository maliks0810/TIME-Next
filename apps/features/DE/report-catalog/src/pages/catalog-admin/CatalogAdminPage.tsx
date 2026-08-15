import { useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { useCatalog } from "./hooks/useCatalog";
import { CatalogTable } from "./components/catalog-table";
import { CatalogReport } from "./types/catalog";
import { SummaryCard } from "./components/summary-card";
import CatalogForm from "./components/catalog-form";
import { useCreateCatalog } from "./hooks/useCreateCatalog";
import { useUpdateCatalog } from "./hooks/useUpdateCatalog";
import { useUserInfo } from "@platform/utils";
import { useDeleteCatalog } from "./hooks/useDeleteCatalog";
import { Alert, Snackbar } from "@mui/material";

const DEFAULT_PAGE_SIZE = 25;

export default function CatalogAdminPage() {
    const [search, setSearch] = useState("");
    const userInfo = useUserInfo()
    console.log(userInfo.claims)
    const [status, setStatus] =
        useState("Active");

    const [page, setPage] =
        useState(0);

    const [pageSize, setPageSize] =
        useState(DEFAULT_PAGE_SIZE);

    const [selectedRow, setSelectedRow] =
        useState<CatalogReport | null>(
            null
        );

    const [createOpen, setCreateOpen] =
        useState(false);

    const [editOpen, setEditOpen] =
        useState(false);

    const [deleteOpen, setDeleteOpen] =
        useState(false);
    const createMutation = useCreateCatalog();
    const updateMutation = useUpdateCatalog();
    const deleteMutation = useDeleteCatalog();
    const email = userInfo.email;
    const [alert, setAlert] = useState<{
        open: boolean;
        severity: "success" | "error";
        message: string;
    }>({
        open: false,
        severity: "success",
        message: "",
    });

    const {
        data,
        isLoading,
        isFetching,
        refetch,
    } = useCatalog({
        email,
        search,
        page,
        pageSize,
        status
    });

    const rows = useMemo(
        () => data?.items ?? [],
        [data]
    );

    const totalCount = useMemo(
        () => data?.total ?? 0,
        [data]
    );

    const handleCreate = () => {
        setCreateOpen(true);
    };

    // const handleView = (
    //     row: CatalogReport
    // ) => {
    //     console.log("View", row);
    // };

    const handleEdit = (
        row: CatalogReport
    ) => {
        setSelectedRow(row);
        setEditOpen(true);
    };

    const handleDelete = (
        row: CatalogReport
    ) => {
        setSelectedRow(row);
        setDeleteOpen(true);
    };

    return (
        <Box
            sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            {/* HEADER */}

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Box>
                    <Typography
                        variant="h5"
                        fontWeight={600}
                    >
                        Catalog Administration
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Manage enterprise report
                        catalog
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={0.5}
                >
                    <IconButton
                        onClick={() =>
                            refetch()
                        }
                    >
                        <RefreshIcon />
                    </IconButton>

                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={
                            handleCreate
                        }
                    >
                        New Report
                    </Button>
                </Stack>
            </Stack>

            {/* KPI SUMMARY */}

            <Stack
                direction="row"
                spacing={1}
            >
                <SummaryCard
                    title="Total Reports"
                    value={totalCount}
                />

                {/* <SummaryCard
                    title="Loaded"
                    value={rows.length}
                /> */}

            </Stack>

            {/* FILTER BAR */}

            <Paper
                variant="outlined"
                sx={{
                    p: 1,
                }}
            >
                <Stack
                    spacing={1}
                    direction="row"
                >
                    <TextField
                        fullWidth
                        size="small"
                        value={search}
                        placeholder="Search by report number, report name, author..."
                        onChange={(e) => {
                            setSearch(
                                e.target.value
                            )
                            setPage(0)
                        }
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        select
                        size="small"
                        label="Status"
                        sx={{
                            minWidth: 150,
                        }}
                        value={status}
                        onChange={(e) =>
                            setStatus(
                                e.target.value
                            )
                        }
                    >
                        <MenuItem value="All">
                            All
                        </MenuItem>
                        <MenuItem value="Active">
                            Active
                        </MenuItem>
                        <MenuItem value="Inactive">
                            In Active
                        </MenuItem>
                        <MenuItem value="Retired">
                            Retired
                        </MenuItem>
                    </TextField>

                </Stack>
            </Paper>

            <Divider />

            {/* TABLE */}

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                }}
            >
                <CatalogTable
                    rows={rows}
                    loading={
                        isLoading || isFetching
                    }
                    totalCount={
                        totalCount
                    }
                    page={page}
                    pageSize={
                        pageSize
                    }
                    onPageChange={
                        setPage
                    }
                    onRowsPerPageChange={
                        setPageSize
                    }
                    onEdit={
                        handleEdit
                    }
                    onDelete={
                        handleDelete
                    }
                />
            </Box>

            {/* PLACEHOLDERS */}

            <Drawer
                anchor="right"
                open={createOpen}
                onClose={() =>
                    setCreateOpen(false)
                }
                PaperProps={{
                    sx: {
                        width: 850,
                        p: 3,
                    },
                }}
            >
                <CatalogForm
                    title="Create Report"
                    onCancel={() =>
                        setCreateOpen(false)
                    }
                    onSubmit={async (data) => {
                        try {
                            await createMutation.mutateAsync(data);

                            setAlert({
                                open: true,
                                severity: "success",
                                message:
                                    "Report created successfully",
                            });

                            setCreateOpen(false);
                        } catch {
                            setAlert({
                                open: true,
                                severity: "error",
                                message:
                                    "Failed to create report",
                            });
                        }
                    }}
                    loading={createMutation.isPending}
                    editMode={false}
                />
            </Drawer>

            <Drawer
                anchor="right"
                open={editOpen}
                onClose={() =>
                    setEditOpen(false)
                }
                PaperProps={{
                    sx: {
                        width: 850,
                        p: 3,
                    },
                }}
            >
                <CatalogForm
                    title="Edit Report"
                    initialData={selectedRow ?? undefined}
                    onCancel={() =>
                        setEditOpen(false)
                    }
                    loading={updateMutation.isPending}
                    onSubmit={async (data) => {
                        try {
                            await updateMutation.mutateAsync({
                                id:
                                    selectedRow!.catalogid,
                                payload: data,
                            });

                            setAlert({
                                open: true,
                                severity: "success",
                                message:
                                    "Report updated successfully",
                            });

                            setEditOpen(false);
                        } catch {
                            setAlert({
                                open: true,
                                severity: "error",
                                message:
                                    "Failed to update report",
                            });
                        }
                    }}
                    editMode={true}
                />
            </Drawer>

            <Dialog
                open={deleteOpen}
                onClose={() =>
                    setDeleteOpen(false)
                }
            >
                <DialogTitle>
                    Deactivate Report
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to
                        deactivate
                        <strong>
                            {" "}
                            {
                                selectedRow?.reportname
                            }
                        </strong>
                        ?
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setDeleteOpen(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"

                        disabled={deleteMutation.isPending}
                        onClick={async () => {
                            try {
                                await deleteMutation.mutateAsync(
                                    selectedRow!.catalogid
                                );

                                setAlert({
                                    open: true,
                                    severity: "success",
                                    message:
                                        "Report deactivated successfully",
                                });

                                setDeleteOpen(false);
                            } catch {
                                setAlert({
                                    open: true,
                                    severity: "error",
                                    message:
                                        "Failed to deactivate report",
                                });
                            }
                        }}

                    >
                        Deactivate
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={alert.open}
                autoHideDuration={4000}
                onClose={() =>
                    setAlert((s) => ({
                        ...s,
                        open: false,
                    }))
                }
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <Alert
                    severity={alert.severity}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
