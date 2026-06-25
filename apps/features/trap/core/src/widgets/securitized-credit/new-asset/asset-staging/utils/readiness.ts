import type { InputAssumptionsState, ReadinessResult, RequiredAssumptionStatus, StagingItem } from "../types";

export function calculateAssetStagingReadiness({
    items,
    doneMap,
    assumptions,
}: {
    items: StagingItem[];
    doneMap: Record<string, boolean>;
    assumptions: InputAssumptionsState;
}): ReadinessResult {
    const requiredStagingItems = items.filter(item => item.required);

    const requiredInputAssumptions: RequiredAssumptionStatus[] = [
        {
            key: "price",
            done: assumptions.price !== null,
        },
        {
            key: "collateralType",
            done: !!assumptions.collateralType,
        },
        {
            key: "callDate",
            done: assumptions.callable !== "Y" || !!assumptions.callDate,
            active: assumptions.callable === "Y",
        },
        {
            key: "callValue",
            done: assumptions.callable !== "C" || !!assumptions.callValue,
            active: assumptions.callable === "C",
        },
    ];

    const activeRequiredInputAssumptions = requiredInputAssumptions.filter(
        item => item.active !== false
    );

    const requiredDone =
        requiredStagingItems.filter(item => doneMap[item.ctxKey]).length +
        activeRequiredInputAssumptions.filter(item => item.done).length;

    const requiredTotal =
        requiredStagingItems.length + activeRequiredInputAssumptions.length;

    const percent = requiredTotal === 0
        ? 0
        : Math.round((requiredDone / requiredTotal) * 100);

    return {
        requiredDone,
        requiredTotal,
        percent,
        canLaunch: requiredDone === requiredTotal,
    };
}