import type { InputAssumptionsState } from "../types";

function serializeDate(value: unknown): string | undefined {
    if (!value) {
        return undefined;
    }

    if (
        typeof value === "object" &&
        value !== null &&
        "format" in value &&
        typeof (value as { format?: unknown }).format === "function"
    ) {
        return (value as { format: (format: string) => string }).format("YYYY-MM-DD");
    }

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    if (typeof value === "string") {
        return value;
    }

    return undefined;
}

function hasValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== "";
}

export function buildAssetStagingLaunchContext({
    contextSnapshot,
    extId,
    assumptions,
}: {
    contextSnapshot: Record<string, unknown> | undefined;
    extId: string;
    assumptions: InputAssumptionsState;
}): Record<string, unknown> {
    const trimmedExtId = extId.trim();

    return {
        ...contextSnapshot,

        ...(trimmedExtId
            ? {
                "asset.staged.externalId": trimmedExtId,
            }
            : {}),

        "asset.assumptions.price": assumptions.price,
        "asset.assumptions.callable": assumptions.callable,

        ...(assumptions.callable === "Y" && assumptions.callDate
            ? {
                "asset.assumptions.callDate": serializeDate(assumptions.callDate),
            }
            : {}),

        ...(assumptions.callable === "C" && assumptions.cleanupValue
            ? {
                "asset.assumptions.cleanupValue": assumptions.cleanupValue,
            }
            : {}),

        ...(hasValue(assumptions.prepaymentType)
            ? {
                "asset.assumptions.prepaymentType": assumptions.prepaymentType,
            }
            : {}),

        ...(hasValue(assumptions.prepaymentValue)
            ? {
                "asset.assumptions.prepaymentValue": assumptions.prepaymentValue,
            }
            : {}),

        ...(hasValue(assumptions.defaultType)
            ? {
                "asset.assumptions.defaultType": assumptions.defaultType,
            }
            : {}),

        ...(hasValue(assumptions.defaultValue)
            ? {
                "asset.assumptions.defaultValue": assumptions.defaultValue,
            }
            : {}),

        ...(hasValue(assumptions.severity)
            ? {
                "asset.assumptions.severity": assumptions.severity,
            }
            : {}),

        ...(hasValue(assumptions.delinquency)
            ? {
                "asset.assumptions.delinquency": assumptions.delinquency,
            }
            : {}),
    };
}