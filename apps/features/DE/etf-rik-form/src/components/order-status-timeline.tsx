import React from "react";

import {
    Box,
    Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ErrorIcon from "@mui/icons-material/Error";

export type OrderStatus =
    | "PENDING"
    | "PROCESSING"
    | "FILE_GENERATED"
    | "FAILED";

interface OrderStatusTimelineProps {
    status: OrderStatus;
    failedStep?: OrderStatus;
}

const STEPS = [
    {
        key: "PENDING",
        label: "Pending",
    },
    {
        key: "PROCESSING",
        label: "Processing",
    },
    {
        key: "FILE_GENERATED",
        label: "File Generated",
    }
] as const;

const stepMap: Record<OrderStatus, number> = {
    PENDING: 0,
    PROCESSING: 1,
    FILE_GENERATED: 2,
    FAILED: 0,
};



const OrderStatusTimeline: React.FC<
    OrderStatusTimelineProps
> = ({ status, failedStep }) => {
    const currentStep = stepMap[status];
    const failedIndex = STEPS.findIndex(
        (s) => s.key === failedStep
    );
    const isCompleted = (index: number) => {
        switch (status) {
            case "PENDING":
                return false;

            case "PROCESSING":
                return index < 1; // Pending checked

            case "FILE_GENERATED":
                return index <= 2; // all checked

            case "FAILED":
                return failedIndex >= 0 && index < failedIndex;

            default:
                return false;
        }
    };

    const isActive = (index: number) => {
        if (
            status === "FAILED" ||
            status === "FILE_GENERATED"
        ) {
            return false;
        }

        return index === currentStep;
    };
    return (
        <Box
            display="flex"
            alignItems="center"
        >
            {STEPS.map((step, index) => {
                const completed = isCompleted(index)
                const active = isActive(index)

                const failed =
                    status === "FAILED" &&
                    failedStep === step.key;

                return (
                    <Box
                        key={step.key}
                        display="flex"
                        alignItems="center"
                    >
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            minWidth={78}
                        >
                            {failed ? (
                                <ErrorIcon
                                    color="error"
                                    sx={{
                                        fontSize: 12,
                                    }}
                                />
                            ) : completed ? (
                                <CheckCircleIcon
                                    color="success"
                                    sx={{
                                        fontSize: 12,
                                    }}
                                />
                            ) : (
                                <RadioButtonUncheckedIcon
                                    color={
                                        active
                                            ? "primary"
                                            : "disabled"
                                    }
                                    sx={{
                                        fontSize: 12,
                                    }}
                                />
                            )}

                            <Typography
                                sx={{
                                    fontSize:
                                        "0.65rem",
                                    fontWeight: 600,
                                    lineHeight: 1,
                                    mt: 0.25,
                                }}
                            >
                                {step.label}
                            </Typography>
                        </Box>

                        {index <
                            STEPS.length - 1 && (
                                <Box
                                    sx={{
                                        width: 26,
                                        height: 2,
                                        mx: 0.5,
                                        bgcolor:
                                            completed
                                                ? "success.main"
                                                : "divider",
                                    }}
                                />
                            )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default OrderStatusTimeline;