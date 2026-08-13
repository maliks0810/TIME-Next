import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { CatalogReport } from "../types/catalog";
import { FormSection } from "./form-section";

export interface CatalogFormValues {
    report_num: string;
    report_name: string;
    description: string;
    status: string;
    department_name: string;
    dept_code: string;
    author: string;
    source: string;
    item_id: string;
    report_link: string;
    retirement_status: string;
    report_notes: string;
}

interface CatalogFormProps {
    title: string;
    initialData?: CatalogReport;
    loading?: boolean;
    onSubmit: (
        data: CatalogFormValues
    ) => Promise<void> | void;
    onCancel: () => void;
    editMode: boolean;
}

export default function CatalogForm({
    title,
    initialData,
    loading,
    onSubmit,
    onCancel,
    editMode = false
}: CatalogFormProps) {
    const {
        control,
        register,
        handleSubmit,
        reset,
        watch
    } = useForm<CatalogFormValues>({
        defaultValues: {
            report_num: "",
            report_name: "",
            status: "Active",
            department_name: "",
            dept_code: "",
            author: "",
            source: "",
            item_id: "",
            report_link: "",
            retirement_status: "No",
            report_notes: "",
        },
    });
    const [tab, setTab] = useState(0);
    useEffect(() => {
        if (initialData) {
            reset({
                report_num:
                    initialData.reportnum ?? "",

                report_name:
                    initialData.reportname ??
                    "",
                status:
                    initialData.status ??
                    "Active",

                department_name:
                    initialData.departmentname ??
                    "",

                dept_code:
                    initialData.deptcode ??
                    "",

                author:
                    initialData.author ??
                    "",
                source:
                    initialData.source ??
                    "",

                item_id:
                    initialData.item_id ??
                    "",

                report_link:
                    initialData.reportlink ??
                    "",

                retirement_status:
                    initialData.retirementstatus ??
                    "No",

                report_notes:
                    initialData.reportnotes ??
                    "",
                description: initialData.description
            });
        }
    }, [initialData, reset]);

    return (
        <Box>
            <Typography
                variant="h6"
                fontWeight={600}
                mb={2}
            >
                {title}
            </Typography>

            <form
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* REPORT DETAILS */}

                <FormSection title="Report Details">
                    <Grid
                        container
                        spacing={2}
                    >
                        <Grid
                            size={2}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Report Number"
                                {...register(
                                    "report_num"
                                )}
                                disabled={editMode}
                            />
                        </Grid>

                        <Grid
                            size={6}
                        >
                            <TextField
                                fullWidth
                                required
                                size="small"
                                label="Report Name"
                                {...register(
                                    "report_name"
                                )}
                            />
                        </Grid>


                        <Grid
                            size={2}
                        >
                            <Controller
                                control={control}
                                name="status"
                                render={({
                                    field,
                                }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        size="small"
                                        label="Status"
                                    >
                                        <MenuItem value="Active">
                                            Active
                                        </MenuItem>

                                        <MenuItem value="Inactive">
                                            Inactive
                                        </MenuItem>

                                        <MenuItem value="Retired">
                                            Retired
                                        </MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid
                            size={12}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Report Description"
                                {...register(
                                    "description"
                                )}
                            />
                        </Grid>
                    </Grid>
                </FormSection>
                <Divider sx={{ my: 1 }} />

                {/* OWNERSHIP */}

                <FormSection title="Ownership">
                    <Grid
                        container
                        spacing={2}
                    >
                        <Grid
                            size={6}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Department"
                                {...register(
                                    "department_name"
                                )}
                            />
                        </Grid>

                        <Grid
                            size={6}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Department Code"
                                {...register(
                                    "dept_code"
                                )}
                            />
                        </Grid>

                        {/* <Grid
                            size={6}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Author"
                                {...register(
                                    "author"
                                )}
                            />
                        </Grid> */}

                    </Grid>
                </FormSection>

                <Divider sx={{ my: 1 }} />

                {/* TECHNICAL */}
                <FormSection title="Technical">
                    <Grid
                        container
                        spacing={2}
                    >
                        {/* <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Source"
                                {...register(
                                    "source"
                                )}
                            />
                        </Grid> */}


                        <Grid
                            size={12}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Report URL"
                                {...register(
                                    "report_link"
                                )}
                            />
                        </Grid>
                    </Grid>
                </FormSection>
                <Divider sx={{ my: 1 }} />

                {/* RETIREMENT */}

                {/* <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    gutterBottom
                >
                    Retirement
                </Typography>

                <Grid
                    container
                    spacing={2}
                >
                    <Grid
                        item
                        xs={12}
                        md={4}
                    >
                        <Controller
                            control={control}
                            name="retirement_status"
                            render={({
                                field,
                            }) => (
                                <TextField
                                    {...field}
                                    select
                                    fullWidth
                                    size="small"
                                    label="Retirement Status"
                                >
                                    <MenuItem value="No">
                                        No
                                    </MenuItem>

                                    <MenuItem value="Planned">
                                        Planned
                                    </MenuItem>

                                    <MenuItem value="Retired">
                                        Retired
                                    </MenuItem>
                                </TextField>
                            )}
                        />
                    </Grid>
                </Grid> */}

                <FormSection title="Notes">
                    <Tabs
                        value={tab}
                        onChange={(_, value) => setTab(value)}

                        sx={{
                            minHeight: 32,

                            "& .MuiTabs-flexContainer": {
                                gap: 1,
                            },

                            "& .MuiTab-root": {
                                minHeight: 28,
                                height: 28,
                                py: 0,
                                px: 1.5,
                                minWidth: 60,

                                fontSize: "0.75rem",
                                fontWeight: 600,
                                textTransform: "none",

                                borderRadius: 1,
                                color: "text.secondary",
                            },

                            "& .Mui-selected": {
                                color: "primary.main",
                                backgroundColor: "action.selected",
                            },

                            "& .MuiTabs-indicator": {
                                display: "none",
                            },
                        }}

                    >
                        <Tab label="Edit" />
                        <Tab label="Preview" />
                    </Tabs>

                    {tab === 0 && (
                        <Controller
                            name="report_notes"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    multiline
                                    minRows={6}
                                    fullWidth
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    )}

                    {tab === 1 && (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1,
                                minHeight: 180,
                            }}
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: watch(
                                        "report_notes"
                                    ) || "<i>No content</i>",
                                }}
                            />
                        </Paper>
                    )}
                </FormSection>
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    sx={{ mt: 2 }}
                >
                    <Button
                        size='small'
                        variant="outlined"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>

                    <Button
                        size="small"
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={
                            loading ? (
                                <CircularProgress
                                    size={14}
                                    color="inherit"
                                />
                            ) : undefined
                        }
                    >
                        {loading ? "Saving..." : "Save"}
                    </Button>
                    ``
                </Stack>
            </form>
        </Box>
    );
}