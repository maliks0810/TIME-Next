import { AllocationInputRow, AllocationOutputRow, AllocationRow, OrderStatus } from "../../types/etfform";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Autocomplete,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Link,
  AlertTitle,
  Container
} from "@mui/material";

import { useState, useEffect, ReactNode } from "react";
import TradeTable from "./TradeTable";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  useETFTransferRequest,
  useSaveETFLineItems,
  useSubmitETFTransferRequest
} from "../../hooks/useETFTransfer";
import { portfolioOptions, brokerOptions } from "../../api/constants";
import SecuritySelector from "../autocomplete/security";
import StatusTimeline from "../status-timeline";
import { ETFTransferAllocation } from "../../types/response";
import { useUserAccess } from "../../hooks/useUserAccess";
import { useUserInfo } from "@platform/utils";
import { hasPermission } from "../../utils/auth";
import { VIEWALL } from "../../lib/roles";
const STATUS_MESSAGE: Record<string, string> = {
  SUBMITTED:
    "Request received. Processing will begin shortly.",
  PROCESSING:
    "Processing request. You may continue working while processing completes.",
  FILE_GENERATED:
    "File generated successfully. Final transfer is in progress.",
};
const getEmptyForm = (): AllocationRow => ({
  tradeDate: new Date().toISOString().split("T")[0],
  portfolioNumber: "",
  cusip: "",
  isin: "",
  sedol: "",
  securityName: "",
  quantity: "",
  broker: "",
  brokerName: ""
});

const getGroupKey = (
  row: AllocationInputRow
) =>
  [
    row.tradeDate,
    row.portfolioNumber,
    row.broker
  ].join("|");

const transformRows = (rows: AllocationInputRow[], groupOrderMap: Record<string, string>): AllocationOutputRow[] => {
  return rows.map((r): AllocationOutputRow => ({
    id: r.id,
    trade_date: r.tradeDate,
    order_id: groupOrderMap[getGroupKey(r)],
    portfolio_number: r.portfolioNumber,
    cusip: r.cusip,
    isin: r.isin,
    sedol: r.sedol,
    security_name: r.securityName,
    quantity:
      typeof r.quantity === 'number'
        ? r.quantity
        : Number.parseFloat(r.quantity),
    broker: r.broker,
    broker_name: r.brokerName
  }));
};

type CompletionStatus = "FAILED" | "TRANSFERRED";

interface CompletionAlertConfig {
  severity: "success" | "error" | "warning" | "info";
  message: ReactNode;
}

const mapAllocationToRow = (
  allocation: ETFTransferAllocation,
  orderId: string,
  orderStatus: OrderStatus,
  failedStep?: OrderStatus
): AllocationInputRow => ({
  id: allocation.id,
  orderId,
  orderStatus,
  failedStep,
  tradeDate: allocation.tradeDate,
  portfolioNumber: allocation.portfolioNumber,
  cusip: allocation.cusip,
  isin: allocation.isin,
  sedol: allocation.sedol,
  securityName: allocation.securityName,
  quantity: allocation.quantity,
  broker: allocation.broker,
  brokerName: allocation.brokerName,
});

const AllocationForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: access, isLoading: accessLoading } = useUserAccess();
  const user = useUserInfo()

  const { data: request, isLoading, refetch } = useETFTransferRequest(id!);
  const saveMutation = useSaveETFLineItems(id!);
  const submitMutation = useSubmitETFTransferRequest(id!);

  const [rows, setRows] = useState<AllocationInputRow[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const { control, handleSubmit, reset, setValue, watch } = useForm<AllocationInputRow>({
    defaultValues: getEmptyForm()
  });
  const [formResetVersion, setFormResetVersion] = useState(0);
  const [inputValue, setInputValue] = useState<string | null>("");
  const hasLineItems = rows.length > 0;
  // Authz
  const isOwner =
    request?.created_by?.toLowerCase() === user.email?.toLowerCase();

  const canView =
    isOwner ||
    hasPermission(access ?? {}, VIEWALL);

  const canEdit =
    isOwner &&
    ["DRAFT", "NEW"].includes(request?.status ?? "");
  const canSubmit =
    isOwner &&
    (
      canEdit ||
      request?.status === "FAILED"
    );
  const serverRows: AllocationInputRow[] =
    request?.orders?.flatMap((order) =>
      order.allocations.map((allocation) =>
        mapAllocationToRow(
          allocation,
          order.order_id,
          order.status,
          order.failed_step
        )
      )
    ) ?? [];
  const selectedPortfolio = watch("portfolioNumber")
  const hasRowChanges =
    JSON.stringify(rows) !==
    JSON.stringify(serverRows);
  const hasUnsavedChanges = hasRowChanges;
  const [groupOrderMap, setGroupOrderMap] =
    useState<Record<string, string>>({});

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();
      e.returnValue = ""; // required for browser dialog
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // ✅ load existing data
  useEffect(() => {
    if (!request?.orders) {
      setRows([]);
      setGroupOrderMap({});
      return;
    }

    const nextOrderMap: Record<string, string> = {};

    const nextRows = request.orders.flatMap(
      (order) =>
        order.allocations.map((allocation) => {
          const row = mapAllocationToRow(
            allocation,
            order.order_id,
            order.status,
            order.failed_step
          );

          nextOrderMap[
            getGroupKey(row)
          ] = order.order_id;

          return row;
        })
    );

    setRows(nextRows);
    setGroupOrderMap(nextOrderMap);

  }, [request]);
  const navigateWithPrompt = (path: string) => {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      )
    ) {
      return;
    }
    navigate(path);
  };
  const handleEdit = (index: number) => {
    const row = rows[index];
    reset(row);
    setEditIndex(index);
    setInputValue(row.cusip ?? '')
  };

  const handleDelete = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      reset(getEmptyForm());
    }
  };

  const handleReset = () => {
    reset(getEmptyForm());
    setFormResetVersion((v) => v + 1);
  };

  const onSubmit = (data: AllocationInputRow) => {
    if (editIndex !== null) {
      setRows((prev) =>
        prev.map((row, i) => (i === editIndex ? data : row))
      );
      setEditIndex(null);
    } else {
      setRows((prev) => [...prev, data]);
    }
    handleReset()
  };

  // ✅ SAVE → call API
  const handleSave = async () => {
    await saveMutation.mutateAsync(
      transformRows(rows, groupOrderMap)
    );
    await refetch(); // from useETFTransferRe
  };

  // ✅ SUBMIT → save + submit
  const handleSubmitForm = async () => {
    await handleSave();
    await submitMutation.mutateAsync();
    await refetch();
  };
  const showProcessingBanner =
    ["SUBMITTED", "PROCESSING", "FILE_GENERATED"].includes(
      request?.status ?? ""
    );


  const emailBody = encodeURIComponent(
    ` Please describe the issue below and attach a screenshot of the page.

      To assist with troubleshooting, the application has automatically included the following details:

      Issue Details:
  `
  );
  const subject = encodeURIComponent(
    "ETF RIK Form - Request Failure"
  );


  const COMPLETION_ALERTS: Record<
    CompletionStatus,
    CompletionAlertConfig
  > = {
    FAILED: {
      severity: "error",
      message: (
        <>
          The request could not be completed due to a system issue. Please reach out to{" "}
          <a href={`mailto:Reports @tcw.com?subject = ${subject}& body=${emailBody} `}>
            Reports@tcw.com
          </a>{" "}
          and attach a screenshot of this page.
        </>
      ),

    },
    TRANSFERRED: {
      severity: "success",
      message:
        "This request has been successfully transferred and is complete.",
    },
  };

  const completionAlert =
    COMPLETION_ALERTS[
    request?.status as CompletionStatus
    ];
  if (isLoading || accessLoading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  if (!canView) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Alert severity="error">
          <AlertTitle>Unauthorized Access</AlertTitle>
          You are not authorized to view this request because you are neither
          the request owner nor assigned a role that grants access.
        </Alert>
      </Container>
    );
  }

  if (!request) {
    return null;
  }
  return (
    <Box p={2}>
      {/* ✅ HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {/* ✅ LEFT GROUP */}
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          {/* BACK ICON */}
          <Tooltip title="Back to forms">
            <IconButton
              size="small"
              onClick={() => navigateWithPrompt("/de/redemption-in-kind")}
              sx={{ mt: "2px" }} // slight alignment polish
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* TITLE + REF */}
          <Box>
            <Typography variant="h5" fontWeight={600}>
              ETF RIK Form
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {request?.request_reference}
            </Typography>
          </Box>
        </Box>

        {/* ✅ RIGHT: STATUS */}
        {/* <Chip
          label={request.status_display}
          color={getStatusColor(request.status)}
          size="small"
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 20,
            fontWeight: 600
          }}
        /> */}

        <StatusTimeline
          status={request.status}
          created_at={request.created_at}
          draft_saved_at={request.draft_saved_at}
          submitted_at={request.submitted_at}
          processing_at={request.processing_at}
          failed_step={request.failed_step}
          failed_at={request.failed_at}
          file_generated_at={request.file_generated_at}
          completed_at={request.completed_at}
        />

      </Box>

      {/* ✅ ALERT HERE */}
      {completionAlert && !showProcessingBanner && (
        <Alert severity={completionAlert.severity} sx={{ mb: 2 }}>
          {completionAlert.message}{" "}
          <Link
            component="button"
            variant="inherit"
            underline="hover"
            onClick={() => navigateWithPrompt("/de/redemption-in-kind")}
          >
            Return to Dashboard
          </Link>
        </Alert>
      )}
      {/* {!isDraft && request.status === "FAILED" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {request.error_message}
        </Alert>
      )} */}
      {showProcessingBanner && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 1 }}

          >
            {STATUS_MESSAGE?.[request?.status] ?? ''}
          </Alert>

          <Typography variant="caption" display="block">
            You may safely return to the dashboard while processing continues.{" "}
            <Button
              variant="text"
              size="small"
              sx={{
                minWidth: 0,
                p: 0,
                textTransform: "none",
                fontSize: "inherit",
                verticalAlign: "baseline",
              }}
              onClick={() => navigateWithPrompt("/de/redemption-in-kind")}
            >
              Return to Dashboard
            </Button>
          </Typography>

          <LinearProgress />
        </Box>
      )}


      <Grid container spacing={2}>
        {/* LEFT FORM */}
        <Grid size={3.5}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Security Details
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1}>
                <Controller
                  name="tradeDate"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} disabled label="Trade Date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} />
                  )}
                />

                <Controller
                  name="portfolioNumber"
                  control={control}
                  rules={{ required: "Porfolio field is required" }}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      size="small"
                      fullWidth
                      options={portfolioOptions}
                      value={portfolioOptions.find((o) => o.value === field.value) || null}
                      onChange={(_, val) => field.onChange(val?.value || "")}
                      renderInput={(params) => <TextField {...params} error={!!fieldState.error}
                        helperText={fieldState.error?.message} label="Portfolio" />}
                    />
                  )}
                />
              </Stack>

              <Controller
                name="cusip"
                control={control}
                rules={{ required: "CUSIP is required" }}
                render={({ field, fieldState }) => (
                  <SecuritySelector
                    inputValue={inputValue}
                    portfolio={selectedPortfolio}
                    setInputValue={setInputValue}
                    value={field.value}
                    onChange={(option) => {
                      field.onChange(option?.aladdin_id ?? "");

                      // ✅ populate dependent fields
                      setValue("isin", option?.isin ?? "", {
                        shouldValidate: true,
                        shouldDirty: true,
                      });

                      setValue("sedol", option?.sedol ?? "", {
                        shouldValidate: true,
                        shouldDirty: true,
                      });

                      setValue("securityName", option?.security_name ?? "", {
                        shouldValidate: true,
                        shouldDirty: true,
                      });

                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    resetVersion={formResetVersion}
                  />
                )}
              />

              <Stack direction="row" spacing={1}>
                <Controller name="isin" control={control} render={({ field }) => <TextField {...field} disabled label="ISIN" size="small" fullWidth />} />
                <Controller name="sedol" control={control} render={({ field }) => <TextField {...field} disabled label="SEDOL" size="small" fullWidth />} />
              </Stack>

              <Controller name="securityName" control={control} render={({ field }) => <TextField {...field} disabled label="Security Name" size="small" fullWidth />} />

              <Stack direction="row" spacing={1}>
                <Controller name="quantity" control={control} rules={{ required: "Quantity is required", min: { value: 1, message: "Quantity should be > 0" } }} render={({ field, fieldState }) =>
                  <TextField {...field} label="Quantity" type="number" size="small" fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                } />
                <Controller name="broker" control={control}
                  rules={{ required: "Broker field is required" }}
                  render={({ field, fieldState }) => <Autocomplete
                    size="small"
                    fullWidth
                    options={brokerOptions}
                    value={brokerOptions.find((o) => o.value === field.value) || null}
                    onChange={(_, val) => {
                      field.onChange(val?.value || "");
                      setValue("brokerName", val?.label || "");
                    }}
                    renderInput={(params) => <TextField {...params} label="Broker" error={!!fieldState.error}
                      helperText={fieldState.error?.message} />}

                  />} />
              </Stack>
              {canEdit && (
                <Button variant="contained" size="small" onClick={handleSubmit(onSubmit)}>
                  {editIndex !== null ? "Update" : "+ Add"}
                </Button>
              )}
              {editIndex !== null && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setEditIndex(null);
                    handleReset()
                  }}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT TABLE */}
        <Grid size={8.5}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={600}>Allocations</Typography>

              <Stack direction="row" spacing={1}>
                {canEdit && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      color="secondary"
                      onClick={() => navigateWithPrompt("/de/redemption-in-kind")}
                    >
                      {"Cancel"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleSave}
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </>
                )}
                {canSubmit && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSubmitForm}
                    disabled={hasUnsavedChanges || submitMutation.isPending || !hasLineItems || saveMutation.isPending}
                  >
                    {submitMutation.isPending
                      ? request?.status === "FAILED"
                        ? "Re-submitting..."
                        : "Submitting..."
                      : request?.status === "FAILED"
                        ? "Re-Submit"
                        : "Submit"}
                  </Button>
                )}
              </Stack>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <TradeTable
              requestId={request.id}
              baseOrderId={request.reference_id}
              data={rows}
              onDelete={handleDelete}
              onEdit={handleEdit}
              isEditable={canEdit}
              canSubmit={canSubmit}
              groupOrderMap={groupOrderMap}
              setGroupOrderMap={setGroupOrderMap}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AllocationForm;
