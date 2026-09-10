import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
    Box,
    Step,
    StepConnector,
    stepConnectorClasses,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormStatus } from "../types/etfform";
import CircularProgress from "@mui/material/CircularProgress";



interface StatusTimelineProps {
    status: FormStatus;
    failed_step: FormStatus | null;
    created_at: string;
    draft_saved_at?: string | null;
    submitted_at?: string | null;
    processing_at?: string | null;
    completed_at?: string | null;
    file_generated_at?: string | null;
    failed_at?: string | null;
}

interface Step {
    key: string;
    label: string;
    field: string;
}

const STEPS = [
    {
        key: "DRAFT",
        label: "Draft",
        field: "draft_saved_at",
    },
    {
        key: "SUBMITTED",
        label: "Submitted",
        field: "submitted_at",
    },
    {
        key: "PROCESSING",
        label: "Processing",
        field: "processing_at",
    },
    {
        key: "FILE_GENERATED",
        label: "File Generated",
        field: "file_generated_at",
    },
    {
        key: "TRANSFERRED",
        label: "Transferred",
        field: "completed_at",
    }
] as const;

const Connector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 12,
    },

    [`& .${stepConnectorClasses.line}`]: {
        borderTopWidth: 2,
        borderColor: theme.palette.divider,
    },

    [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.success.main,
    },

    [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.success.main,
    },
}));

const formatDate = (value?: string | null) => {
    if (!value) return "";

    return new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

function StepIcon(props: {
    active?: boolean;
    completed?: boolean;
    error?: boolean;
    status?: string;
}) {
    const {
        active,
        completed,
        error,
        status
    } = props;

    if (error) {
        return <ErrorIcon color="error" />;
    }
    if (
        active &&
        status === "PROCESSING"
    ) {
        return (
            <CircularProgress
                size={18}
                thickness={6}
            />
        );
    }
    if (completed) {
        return (
            <CheckCircleIcon color="success" />
        );
    }
    return (
        <RadioButtonUncheckedIcon
            color={active ? "primary" : "disabled"}
        />
    );
}

export default function StatusTimeline(
    props: StatusTimelineProps
) {
    const {
        status,
        failed_step,
        created_at,
        submitted_at,
        processing_at,
        file_generated_at,
        completed_at,
        draft_saved_at
    } = props;

    const timestamps = {
        created_at,
        submitted_at,
        processing_at,
        file_generated_at,
        completed_at,
        draft_saved_at
    };

    // const lastCompletedStep = STEPS.reduce(
    //     (last, step, index) =>
    //         timestamps[step.field as keyof typeof timestamps]
    //             ? index
    //             : last,
    //     0
    // );
    const failedIndex = STEPS.findIndex(
        (s) => s.key === failed_step
    );
    const activeStep =
        status === "FAILED"
            ? failedIndex
            : Math.max(
                STEPS.findIndex((s) => s.key === status),
                -1
            );
    return (
        <Box sx={{ width: "75%", py: 0.5 }}>
            <Stepper
                alternativeLabel
                activeStep={activeStep}
                connector={<Connector />}
            >
                {STEPS.map((step, index) => {
                    const isFailedStep =
                        status === "FAILED" &&
                        index === activeStep;

                    const completed =
                        status === "FAILED"
                            ? index < activeStep
                            : index <= activeStep;
                    const timestamp =
                        timestamps[
                        step.field as keyof typeof timestamps
                        ];

                    return (
                        <Step
                            key={step.key}
                            completed={completed}
                        >
                            <StepLabel
                                StepIconComponent={() => (
                                    <StepIcon
                                        active={index === activeStep}
                                        completed={completed}
                                        error={isFailedStep}
                                        status={status}
                                    />
                                )}
                            >

                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{ fontSize: 13 }}
                                >
                                    {step.label}
                                </Typography>

                                {timestamp && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: "block",
                                            mt: 0.25,
                                            fontSize: 11,
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {formatDate(timestamp)}
                                    </Typography>
                                )}

                            </StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
        </Box>
    );
}