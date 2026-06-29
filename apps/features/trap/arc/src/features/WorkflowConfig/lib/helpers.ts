import { Callable, PayloadItem, ReviewType, WorkflowRule } from '../../../lib/types';
import { hasValue } from '../../../lib/helpers';

/**
 * Resolve a review type from the workflow rules given a sample input. Returns the first rule whose
 * callable + speedOverridesExist both match, otherwise the config's default review type.
 *
 * Compare to speedOverridesExist() in src/lib/helpers.tsx, which performs the same boolean check
 * against a live asset's PayloadItem[].
 */
export function evaluateRules(
    rules: WorkflowRule[],
    defaultReviewType: ReviewType,
    input: { callable: Callable; speedOverridesExist: boolean }
): ReviewType {
    return (
        rules.find(
            (rule) =>
                rule.callable === input.callable &&
                rule.speedOverridesExist === input.speedOverridesExist
        )?.reviewType ?? defaultReviewType
    );
}

/**
 * Construct a PayloadItem[] from the DefaultOverrides visual form values, following the same
 * construction pattern used in RequestNewAsset/index.tsx onFinish (only include nodes that carry
 * a value).
 */
export function buildDefaultOverrides(formValues: Record<string, unknown>): PayloadItem[] {
    const payload: PayloadItem[] = [];

    if (hasValue(formValues['callable'])) {
        payload.push({ type: 'CALLABLE', parameters: { callable: String(formValues['callable']) } });
    }

    if (hasValue(formValues['callDate'])) {
        payload.push({ type: 'CALL_DATE', parameters: { callDate: String(formValues['callDate']) } });
    }

    if (hasValue(formValues['collateralType'])) {
        payload.push({
            type: 'COLLATERAL_TYPE',
            parameters: { collateralType: String(formValues['collateralType']) },
        });
    }

    if (hasValue(formValues['interestRateScenario']) || hasValue(formValues['modelFamilyOverride']) || hasValue(formValues['modelFamilyOverrideForAnalytics'])) {
        payload.push({
            type: 'SECURITY_SETTINGS',
            parameters: {
                interestRateScenario: String(formValues['interestRateScenario'] ?? ''),
                modelFamilyOverride: String(formValues['modelFamilyOverride'] ?? ''),
                modelFamilyOverrideForAnalytics: String(formValues['modelFamilyOverrideForAnalytics'] ?? ''),
                acceptModelOutputs: Boolean(formValues['acceptModelOutputs'])
            },
        });
    }

    if (hasValue(formValues['multiplierValue']) || hasValue(formValues['applyMultiplierEnabled'])) {
        payload.push({
            type: 'OAD_OAC_MULTIPLIER',
            parameters: {
                multiplierValue: Number(formValues['multiplierValue'] ?? ''),
                applyMultiplier: Boolean(formValues['applyMultiplierEnabled'])
            },
        });
    }

    if (formValues['speedOverridesEnabled']) {
        const speedOverridesParams = {
            ...(hasValue(formValues['prepaymentType']) ? { prepaymentType: String(formValues['prepaymentType']) } : {}),
            ...(hasValue(formValues['prepaymentSpeed'])
                ? { prepaymentSpeed: Number(formValues['prepaymentSpeed']) }
                : {}),
            ...(hasValue(formValues['defaultType']) ? { defaultType: String(formValues['defaultType']) } : {}),
            ...(hasValue(formValues['defaultSpeed']) ? { defaultSpeed: Number(formValues['defaultSpeed']) } : {}),
            ...(hasValue(formValues['severity']) ? { severity: Number(formValues['severity']) } : {}),
            ...(hasValue(formValues['delinquency']) ? { delinquency: Number(formValues['delinquency']) } : {}),
        };

        payload.push({ type: 'SPEED_OVERRIDES', parameters: speedOverridesParams });
    }

    return payload;
}
