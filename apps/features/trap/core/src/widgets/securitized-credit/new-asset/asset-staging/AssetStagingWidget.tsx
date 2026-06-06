import React from "react";
import { Button, Divider, Progress, theme, Typography, message } from "antd";
import {
    ArrowRightOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import clsx from "clsx";

import WidgetCardShell from '../../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../../types/widget';
import { useGetWidgetValue, useSetWidgetValue } from '../../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../../state/Tabs/hooks';
import { executeWidget } from '../../../../api/trap';

import { buildAssetStagingLaunchContext } from './utils/buildLaunchContext';
import { validateStagingForm, hasErrors } from '../../../../utils/validation';
import type { ValidationErrors } from '../../../../utils/validation';
import { SectionHeader } from './components/SectionTitle';
import { StagedItemsPanel } from './components/StagedIemsPanel';
import { InputAssumptionsPanel } from './components/InputAssumptionsPanel';
import { calculateAssetStagingReadiness } from './utils/readiness';
import type { CallableType, InputAssumptionsState, StagingItem } from './types';
import type { Dayjs } from 'dayjs';
import styles from './AssetStagingWidget.module.scss';

const { Text } = Typography;

const ITEMS: StagingItem[] = [
    { label: "Deal", ctxKey: "deal.name", required: true },
    { label: "Tranche", ctxKey: "asset.staged.trancheId", required: true },
    { label: "External ID", ctxKey: "__extId__", required: false, isInput: true },
];

export default function AssetStagingWidget({
    widgetInstance,
    widgetDefinition,
    uiActions,
    loading,
    mode,
}: WidgetComponentProps) {
    const { token } = theme.useToken();

    const [extId, setExtId] = React.useState("");

    const [price, setPrice] = React.useState<number | null>(null);
    const [callable, setCallable] = React.useState<CallableType | null>("N");
    const [callDate, setCallDate] = React.useState<Dayjs | null>(null);
    const [cleanupValue, setCleanupValue] = React.useState<string | undefined>(undefined);

    const [prepaymentType, setPrepaymentType] = React.useState<string | undefined>(undefined);
    const [prepaymentValue, setPrepaymentValue] = React.useState<number | null>(null);

    const [defaultType, setDefaultType] = React.useState<string | undefined>(undefined);
    const [defaultValue, setDefaultValue] = React.useState<number | null>(null);

    const [severity, setSeverity] = React.useState<number | null>(null);
    const [delinquency, setDelinquency] = React.useState<number | null>(null);

    const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({});
    const [submitting, setSubmitting] = React.useState(false);

    const channelId = widgetInstance?.config?.params?.channel;
    const isDesigner = mode === "designer";

    const widgetDefId = String(
        widgetInstance?.composedWidgetId ??
        widgetInstance?.widgetDefinitionId ??
        widgetDefinition?.id ??
        ""
    );

    const dealName = useGetWidgetValue({
        channelId,
        key: "deal.name",
    }) as string | undefined;

    const trancheId = useGetWidgetValue({
        channelId,
        key: "asset.staged.trancheId",
    }) as string | undefined;

    const trancheName = useGetWidgetValue({
        channelId,
        key: "asset.staged.trancheName",
    }) as string | undefined;

    const scenarioId = useGetWidgetValue({
        channelId,
        key: "scenario.selectedResultId",
    }) as string | undefined;

    const assetIsNew = useGetWidgetValue({
        channelId,
        key: "asset.isNew",
    }) as string | undefined;

    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();

    // Reset stale state when deal changes
    const prevDealNameRef = React.useRef(dealName);

    React.useEffect(() => {
        if (dealName && dealName !== prevDealNameRef.current) {
            setExtId("");
            setPrice(null);
            setCallable("N");
            setCallDate(null);
            setCleanupValue(undefined);
            setPrepaymentType(undefined);
            setPrepaymentValue(null);
            setDefaultType(undefined);
            setDefaultValue(null);
            setSeverity(null);
            setDelinquency(null);
            setValidationErrors({});

            [
                "asset.staged.trancheId",
                "asset.staged.trancheName",
                "scenario.selectedResultId",
            ].forEach((key) =>
                setWidgetValueToChannel({ channelId, key, value: null, activeTab })
            );
        }

        prevDealNameRef.current = dealName;
    }, [dealName, channelId, activeTab, setWidgetValueToChannel]);

    const baseLaunchContext = React.useMemo<Record<string, unknown>>(() => {
        const context: Record<string, unknown> = {};

        if (dealName) context["deal.name"] = dealName;
        if (trancheId) context["asset.staged.trancheId"] = trancheId;
        if (trancheName) context["asset.staged.trancheName"] = trancheName;
        if (scenarioId) context["scenario.selectedResultId"] = scenarioId;
        if (assetIsNew) context["asset.isNew"] = assetIsNew;

        return context;
    }, [dealName, trancheId, trancheName, scenarioId, assetIsNew]);

    const stagingApplicable = assetIsNew === "true";
    const stagingExplicitlyNA = assetIsNew === "false";

    const doneMap: Record<string, boolean> = {
        "deal.name": !!dealName,
        "asset.staged.trancheId": !!trancheId,
        "scenario.selectedResultId": !!scenarioId,
        "__extId__": !!extId.trim(),
    };

    const displayVal: Record<string, string | undefined> = {
        "deal.name": dealName,
        "asset.staged.trancheId": trancheName ?? trancheId,
        "scenario.selectedResultId": scenarioId,
        "__extId__": extId.trim() || undefined,
    };

    const assumptions = React.useMemo<InputAssumptionsState>(() => ({
        price,
        callable,
        callDate,
        cleanupValue,
        prepaymentType,
        prepaymentValue,
        defaultType,
        defaultValue,
        severity,
        delinquency,
    }), [
        price,
        callable,
        callDate,
        cleanupValue,
        prepaymentType,
        prepaymentValue,
        defaultType,
        defaultValue,
        severity,
        delinquency,
    ]);

    const readiness = calculateAssetStagingReadiness({
        items: ITEMS,
        doneMap,
        assumptions,
    });

    const handleCallableChange = React.useCallback((next: CallableType) => {
        setCallable(next);

        if (next !== "Y") {
            setCallDate(null);
        }

        if (next !== "C") {
            setCleanupValue(undefined);
        }
    }, []);

    // Clear validation error when user corrects the value
    React.useEffect(() => {
        setValidationErrors((prev) => {
            if (!prev.extId) return prev;
            const { extId: __extId, ...rest } = prev;
            void __extId;
            return rest;
        });
    }, [extId]);

    React.useEffect(() => {
        setValidationErrors((prev) => {
            if (!prev.prepayment) return prev;
            const { prepayment: _prepayment, ...rest } = prev;
            void _prepayment;
            return rest;
        });
    }, [prepaymentValue]);

    React.useEffect(() => {
        setValidationErrors((prev) => {
            if (!prev.default) return prev;
            const { default: _default, ...rest } = prev;
            void _default;
            return rest;
        });
    }, [defaultValue]);


    const handleLaunch = React.useCallback(async () => {
        // Validate
        const errors = validateStagingForm({
            extId,
            prepaymentType,
            prepaymentValue,
            defaultType,
            defaultValue,
        });

        setValidationErrors(errors);

        if (hasErrors(errors)) {
            return;
        }

        const payload = buildAssetStagingLaunchContext({
            contextSnapshot: baseLaunchContext,
            extId,
            assumptions,
        });

        setSubmitting(true);

        try {
            await executeWidget({
                widgetDefinitionId: widgetDefId,
                params: {
                    action: "stage",
                    ...payload,
                },
                context: {},
                mode: isDesigner ? "MOCK" : "LIVE",
            });

            message.success("Asset staging submitted");

            uiActions?.openWorkflow?.({ context: payload });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Asset staging failed — try again";
            message.error(msg);
        } finally {
            setSubmitting(false);
        }
    }, [
        baseLaunchContext,
        extId,
        assumptions,
        uiActions,
        widgetDefId,
        isDesigner,
        prepaymentType,
        prepaymentValue,
        defaultType,
        defaultValue,
    ]);

    return (
        <WidgetCardShell>
            <div className={styles.widgetBody}>
                {/* Not applicable — security already exists in system */}
                {stagingExplicitlyNA && (
                    <div className={styles.centerState}>
                        <div className={styles.centerIcon}>
                            <CheckCircleOutlined style={{ fontSize: 20, color: token.colorSuccess }} />
                        </div>

                        <div className={styles.centerText}>
                            <Text className={styles.centerTitle}>
                                Security already in system
                            </Text>

                            <Text className={styles.centerDescription}>
                                This bond was found in the system — asset setup staging is not required.
                                Proceed directly to Security Analysis.
                            </Text>
                        </div>
                    </div>
                )}

                {/* No signal yet — waiting for CDI upload or security lookup */}
                {!stagingExplicitlyNA && !stagingApplicable && !dealName && (
                    <div className={styles.centerStateCompact}>
                        <div className={styles.centerIcon}>
                            <InboxOutlined style={{ fontSize: 20, color: token.colorTextQuaternary }} />
                        </div>

                        <Text className={styles.emptyDescription}>
                            Upload a CDI file or search for a security that is not yet in the system to begin asset staging
                        </Text>
                    </div>
                )}

                {!loading && (stagingApplicable || dealName) && !stagingExplicitlyNA && (
                    <>
                        {/* Header */}
                        <div className={styles.headerRow}>
                            <SectionHeader
                                icon={<InboxOutlined style={{ fontSize: 12, color: token.colorPrimary }} />}
                                title="New asset staging"
                            />

                            <Text style={{ fontSize: 10, fontFamily: "monospace", color: token.colorTextQuaternary }} />
                        </div>

                        <div className={styles.dividerLine} />

                        {/* Readiness */}
                        <div>
                            <div className={styles.readinessHeader}>
                                <Text className={styles.readinessLabel}>
                                    Readiness
                                </Text>

                                <Text
                                    className={clsx(
                                        styles.readinessValue,
                                        readiness.canLaunch ? styles.readinessSuccess : styles.readinessWarning
                                    )}
                                >
                                    {readiness.requiredDone} / {readiness.requiredTotal} required
                                </Text>
                            </div>

                            <Progress
                                percent={readiness.percent}
                                size="small"
                                showInfo={false}
                                strokeColor={readiness.canLaunch ? token.colorSuccess : token.colorWarning}
                                trailColor={token.colorFillSecondary}
                            />
                        </div>

                        {/* Staged items */}
                        <StagedItemsPanel
                            items={ITEMS}
                            doneMap={doneMap}
                            displayVal={displayVal}
                            extId={extId}
                            onExtIdChange={setExtId}
                            validationErrors={validationErrors}
                        />

                        {/* Input Assumptions */}
                        <Divider className={styles.inputAssumptionsDivider} />

                        <div className={styles.inputAssumptionsTitle}>
                            <SectionHeader
                                icon={<FileTextOutlined style={{ fontSize: 12, color: token.colorPrimary }} />}
                                title="Input Assumptions"
                            />
                        </div>

                        <InputAssumptionsPanel
                            price={price}
                            onPriceChange={setPrice}
                            callable={callable}
                            onCallableChange={handleCallableChange}
                            callDate={callDate}
                            onCallDateChange={setCallDate}
                            cleanupValue={cleanupValue}
                            onCleanupValueChange={setCleanupValue}
                            prepaymentType={prepaymentType}
                            onPrepaymentTypeChange={setPrepaymentType}
                            prepaymentValue={prepaymentValue}
                            onPrepaymentValueChange={setPrepaymentValue}
                            defaultType={defaultType}
                            onDefaultTypeChange={setDefaultType}
                            defaultValue={defaultValue}
                            onDefaultValueChange={setDefaultValue}
                            severity={severity}
                            onSeverityChange={setSeverity}
                            delinquency={delinquency}
                            onDelinquencyChange={setDelinquency}
                            validationErrors={validationErrors}
                        />

                        {/* Launch */}
                        <div className={styles.launchContainer}>
                            <Button
                                type="primary"
                                icon={<ArrowRightOutlined />}
                                disabled={!readiness.canLaunch}
                                loading={submitting}
                                onClick={handleLaunch}
                                style={{ width: "100%" }}
                            >
                                Launch asset setup
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </WidgetCardShell>
    );
}