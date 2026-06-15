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
import { validateStagingForm, hasErrors, isValidCusip } from '../../../../utils/validation';
import type { ValidationErrors } from '../../../../utils/validation';
import { SectionHeader } from './components/SectionTitle';
import { StagedItemsPanel } from './components/StagedIemsPanel';
import { InputAssumptionsPanel } from './components/InputAssumptionsPanel';
import { PayloadPreview } from './components/PayloadPreview';
import { calculateAssetStagingReadiness } from './utils/readiness';
import type { CallableType, InputAssumptionsState, StagingItem } from './types';
import type { Dayjs } from 'dayjs';
import styles from './AssetStagingWidget.module.scss';

const { Text } = Typography;

const ITEMS: StagingItem[] = [
    { label: "Deal", ctxKey: "deal.name", required: true },
    { label: "Tranche", ctxKey: "asset.staged.trancheId", required: true },
    { label: "CUSIP", ctxKey: "__cusipOverride__", required: false, isInput: true, inputType: "cusip" },
    { label: "External ID", ctxKey: "__extId__", required: false, isInput: true, inputType: "extId" },
];

function isInvalidCusip(cusip: string | undefined): boolean {
    if (!cusip || !cusip.trim()) return true;
    const upper = cusip.trim().toUpperCase();
    if (/^(.)\1+$/.test(upper)) return true;
    return false;
}

export default function AssetStagingWidget({
    widgetInstance,
    widgetDefinition,
    uiActions,
    loading,
    mode,
}: WidgetComponentProps) {
    const { token } = theme.useToken();

    const [extId, setExtId] = React.useState("");
    const [cusipOverride, setCusipOverride] = React.useState("");
    const [omFile, setOmFile] = React.useState<File | null>(null);

    const [trancheCusip, setTrancheCusip] = React.useState<string | undefined>(undefined);
    const [collateralType, setCollateralType] = React.useState<string | undefined>(undefined);
    const [prefilling, setPrefilling] = React.useState(false);

    // Backend-driven payload snapshot
    const [payloadSnapshot, setPayloadSnapshot] = React.useState<Record<string, unknown>>({});
    const [initializingPayload, setInitializingPayload] = React.useState(false);

    // Dynamic call options from deal structure
    const [callOptions, setCallOptions] = React.useState<{ label: string; value: string }[]>([]);

    const [price, setPrice] = React.useState<number | null>(null);
    const [callable, setCallable] = React.useState<CallableType | null>("N");
    const [callDate, setCallDate] = React.useState<Dayjs | null>(null);
    const [callValue, setCallValue] = React.useState<string | undefined>(undefined);

    const [prepaymentType, setPrepaymentType] = React.useState<string | undefined>(undefined);
    const [prepaymentValue, setPrepaymentValue] = React.useState<number | null>(null);

    const [defaultType, setDefaultType] = React.useState<string | undefined>(undefined);
    const [defaultValue, setDefaultValue] = React.useState<number | null>(null);

    const [severity, setSeverity] = React.useState<number | null>(null);
    const [delinquency, setDelinquency] = React.useState<number | null>(null);

    const [validationErrors, setValidationErrors] = React.useState<ValidationErrors>({});
    const [submitting, setSubmitting] = React.useState(false);

    const [stageError, setStageError] = React.useState<string | null>(null);
    const [stageSuccess, setStageSuccess] = React.useState(false);

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

    // ─── Step 1: Init payload when deal arrives ───
    const prevDealNameRef = React.useRef(dealName);

    React.useEffect(() => {
        if (dealName && dealName !== prevDealNameRef.current) {
            // Reset all local state
            setStageError(null);
            setStageSuccess(false);
            setExtId("");
            setCusipOverride("");
            setOmFile(null);
            setTrancheCusip(undefined);
            setCollateralType(undefined);
            setPayloadSnapshot({});
            setCallOptions([]);
            setPrice(null);
            setCallable("N");
            setCallDate(null);
            setCallValue(undefined);
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

            // Call backend to init payload with deal-level data
            const init = async () => {
                setInitializingPayload(true);

                try {
                    const { result } = await executeWidget({
                        widgetDefinitionId: widgetDefId,
                        params: {
                            action: "initPayload",
                            dealName,
                        },
                        context: {},
                        mode: isDesigner ? "MOCK" : "LIVE",
                    });

                    setPayloadSnapshot(result.fields ?? {});

                    // Dynamic call options from deal structure
                    if (Array.isArray(result.callOptions)) {
                        setCallOptions(result.callOptions);
                    }

                    // If deal has calls, default callable to "C"
                    if (result.fields?.callableValue) {
                        setCallable(result.fields.callableValue as CallableType);
                    }
                } catch {
                    // Init failed — user fills manually, preview shows what it can
                } finally {
                    setInitializingPayload(false);
                }
            };

            init();
        }

        prevDealNameRef.current = dealName;
    }, [dealName, channelId, activeTab, setWidgetValueToChannel, widgetDefId, isDesigner]);

    // ─── Step 2: Prefill when tranche is selected ───
    const prevTrancheIdRef = React.useRef(trancheId);

    React.useEffect(() => {
        if (!trancheId || trancheId === prevTrancheIdRef.current) {
            prevTrancheIdRef.current = trancheId;
            return;
        }

        prevTrancheIdRef.current = trancheId;
        setStageError(null);
        setStageSuccess(false);

        const prefetch = async () => {
            setPrefilling(true);

            try {
                const { result } = await executeWidget({
                    widgetDefinitionId: widgetDefId,
                    params: {
                        action: "prefill",
                        dealName,
                        tranche: trancheName,
                    },
                    context: {},
                    mode: isDesigner ? "MOCK" : "LIVE",
                });

                // Prefill form fields
                if (result.cusip) setTrancheCusip(result.cusip);
                if (result.collateralType) setCollateralType(result.collateralType);
                if (typeof result.price === "number") setPrice(result.price);
                if (result.callable) setCallable(result.callable);
                if (result.prepaymentType) setPrepaymentType(result.prepaymentType);
                if (typeof result.prepaymentValue === "number") setPrepaymentValue(result.prepaymentValue);
                if (result.defaultType) setDefaultType(result.defaultType);
                if (typeof result.defaultValue === "number") setDefaultValue(result.defaultValue);
                if (typeof result.severity === "number") setSeverity(result.severity);
                if (typeof result.delinquency === "number") setDelinquency(result.delinquency);

                // Merge tranche-level fields into payload snapshot
                if (result.fields) {
                    setPayloadSnapshot((prev) => ({ ...prev, ...result.fields }));
                }
            } catch {
                // Prefill failed — user can fill manually
            } finally {
                setPrefilling(false);
            }
        };

        prefetch();
    }, [trancheId, dealName, widgetDefId, isDesigner]);

    // ─── Payload preview: merge backend snapshot + user overrides ───
    const payloadFields = React.useMemo(() => {
        // Determine the best CUSIP — override wins, then snapshot (only if not placeholder)
        const snapshotCusip = payloadSnapshot.cusip
            && !/^(.)\1+$/i.test(String(payloadSnapshot.cusip))
            ? String(payloadSnapshot.cusip)
            : undefined;

        const effectiveCusip = cusipOverride.trim() || snapshotCusip || trancheCusip;

        // Identifier: override CUSIP → snapshot ISIN → valid snapshot CUSIP
        const snapshotIsin = payloadSnapshot.identifierTypeValue === "ISIN" && payloadSnapshot.identifierValue
            ? String(payloadSnapshot.identifierValue)
            : undefined;

        let identifierTypeValue: string | undefined;
        let identifierValue: string | undefined;

        if (cusipOverride.trim()) {
            identifierTypeValue = "CUSIP";
            identifierValue = cusipOverride.trim();
        } else if (snapshotIsin) {
            identifierTypeValue = "ISIN";
            identifierValue = snapshotIsin;
        } else if (snapshotCusip) {
            identifierTypeValue = "CUSIP";
            identifierValue = snapshotCusip;
        }

        const merged: Record<string, unknown> = {
            ...payloadSnapshot,

            // CUSIP: override → valid snapshot → trancheCusip
            cusip: effectiveCusip,

            // External ID → aladdinCdiId
            aladdinCdiId: extId.trim() || payloadSnapshot.aladdinCdiId,

            // INTEX deal name always from channel
            intexDealName: dealName ?? payloadSnapshot.intexDealName,

            // SSD dealName: Bloomberg name from backend, fallback to INTEX
            dealName: payloadSnapshot.dealName ?? dealName,

            // Description: Bloomberg ticker from backend, fallback to deal + tranche
            description: payloadSnapshot.description
                ?? (dealName && trancheName ? `${dealName} ${trancheName}` : undefined),

            // Tranche name
            tranche: payloadSnapshot.tranche ?? trancheName,

            // Identifier
            identifierTypeValue,
            identifierValue,

            // Bloomberg ID from backend
            idBbGlobal: payloadSnapshot.idBbGlobal ?? undefined,

            // Static
            isNewIssue: true,
            ssapIdPassword: "",
            isEuSecuritizationRequested: payloadSnapshot.isEuSecuritizationRequested ?? false,
            sourceAppName: "TRAP",
            marketSectorTypeValue: "Mtge",

            // User form inputs — override snapshot
            callableValue: callable ?? payloadSnapshot.callableValue,
            callDate: callDate?.format("YYYY-MM-DD") ?? payloadSnapshot.callDate,
            price: price ?? payloadSnapshot.price,
            collateralValue: collateralType ?? payloadSnapshot.collateralValue,
            sectorValue: collateralType ?? payloadSnapshot.sectorValue,
            prepaymentTypeValue: prepaymentType ?? payloadSnapshot.prepaymentTypeValue,
            prepaymentSpeed: prepaymentValue ?? payloadSnapshot.prepaymentSpeed,
            defaultTypeValue: defaultType ?? payloadSnapshot.defaultTypeValue,
            defaultSpeed: defaultValue ?? payloadSnapshot.defaultSpeed,
            severity: severity ?? payloadSnapshot.severity,
            delinquency: delinquency ?? payloadSnapshot.delinquency,

            // Computed from backend
            slicerTypeValue: payloadSnapshot.slicerTypeValue ?? undefined,
            mbsTypeValue: payloadSnapshot.mbsTypeValue ?? undefined,
        };

        // noteInstructions: set when callable is C with selected call option
        if (callable === "C" && callValue) {
            merged.noteInstructions = callValue;
        }

        return Object.entries(merged).map(([key, value]) => ({
            key,
            value: value as string | number | boolean | null | undefined,
        }));
    }, [
        payloadSnapshot, cusipOverride, trancheCusip, extId,
        dealName, trancheName, callable, callDate, price,
        collateralType, prepaymentType, prepaymentValue,
        defaultType, defaultValue, severity, delinquency,
        callValue,
    ]);

    const cusipRequired = isInvalidCusip(trancheCusip);

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

    const effectiveItems = React.useMemo(() =>
        ITEMS.map((item) =>
            item.inputType === "cusip"
                ? { ...item, required: cusipRequired }
                : item
        ),
        [cusipRequired]
    );

    const doneMap: Record<string, boolean> = {
        "deal.name": !!dealName,
        "asset.staged.trancheId": !!trancheId,
        "__cusipOverride__": cusipRequired
            ? (cusipOverride.trim().length === 9 && isValidCusip(cusipOverride.trim().toUpperCase()) && !validationErrors.cusip)
            : true,
        "__extId__": !!extId.trim(),
    };

    const displayVal: Record<string, string | undefined> = {
        "deal.name": dealName,
        "asset.staged.trancheId": trancheName ?? trancheId,
        "__cusipOverride__": cusipOverride.trim() || trancheCusip,
        "scenario.selectedResultId": scenarioId,
        "__extId__": extId.trim() || undefined,
    };

    const assumptions = React.useMemo<InputAssumptionsState>(() => ({
        price,
        callable,
        callDate,
        callValue,
        collateralType,
        prepaymentType,
        prepaymentValue,
        defaultType,
        defaultValue,
        severity,
        delinquency,
    }), [
        price, callable, callDate, callValue, collateralType,
        prepaymentType, prepaymentValue, defaultType, defaultValue,
        severity, delinquency,
    ]);

    const readiness = calculateAssetStagingReadiness({
        items: effectiveItems,
        doneMap,
        assumptions,
    });

    const handleCallableChange = React.useCallback((next: CallableType) => {
        setCallable(next);

        if (next !== "Y") {
            setCallDate(null);
        }

        if (next !== "C") {
            setCallValue(undefined);
        }
    }, []);

    // Clear validation errors when user corrects values
    React.useEffect(() => {
        setValidationErrors((prev) => {
            if (!prev.extId) return prev;
            const next = { ...prev };
            delete next.extId;
            return next;
        });
    }, [extId]);

    React.useEffect(() => {
        setValidationErrors((prev) => {
            if (!prev.cusip) return prev;
            const next = { ...prev };
            delete next.cusip;
            return next;
        });
    }, [cusipOverride]);

    React.useEffect(() => {
        setValidationErrors((prev) => {
            if (!prev.collateralType) return prev;
            const next = { ...prev };
            delete next.collateralType;
            return next;
        });
    }, [collateralType]);

    React.useEffect(() => {
        setValidationErrors((prev) => {
            if (!prev.prepayment) return prev;
            const next = { ...prev };
            delete next.prepayment;
            return next;
        });
    }, [prepaymentValue]);

    React.useEffect(() => {
        setValidationErrors((prev) => {
            if (!prev.default) return prev;
            const next = { ...prev };
            delete next.default;
            return next;
        });
    }, [defaultValue]);

    // ─── Step 4: Launch — merge snapshot + user inputs → call GraphQL ───
    const handleLaunch = React.useCallback(async () => {
        // Don't clear banners here — wait for final result

        if (submitting) return; // Guard against double-click

        const errors = validateStagingForm({
            extId,
            cusipOverride: cusipRequired ? cusipOverride : undefined,
            collateralType,
            prepaymentType,
            prepaymentValue,
            defaultType,
            defaultValue,
        });

        setValidationErrors(errors);

        if (hasErrors(errors)) {
            return;
        }

        // Also block if there are existing blur errors
        if (validationErrors.cusip || validationErrors.extId) {
            return;
        }

        // Build final payload: backend snapshot + user overrides
        const finalPayload: Record<string, unknown> = {};

        payloadFields.forEach(({ key, value }) => {
            if (value != null && value !== "") {
                finalPayload[key] = value;
            }
        });

        // OM file as base64
        let omBase64: string | undefined;

        if (omFile) {
            omBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = () => reject(new Error('File read failed'));
                reader.readAsDataURL(omFile);
            });
        }

        // Now commit — disable button, hide previous banners
        setSubmitting(true);
        setStageError(null);
        setStageSuccess(false);

        try {
            const { result: stageResult } = await executeWidget({
                widgetDefinitionId: widgetDefId,
                params: {
                    action: "stage",
                    ...finalPayload,
                    ...(omBase64 && omFile ? {
                        omFileName: omFile.name,
                        omFileBase64: omBase64,
                    } : {}),
                },
                context: {},
                mode: isDesigner ? "MOCK" : "LIVE",
            });

            const staged = stageResult as Record<string, unknown>;

            // Check for error returned from backend
            if (staged?.success === false || staged?.error) {
                setStageError(String(staged.error ?? "Asset staging failed — try again"));
                return;
            }

            // Success
            setStageSuccess(true);

            if (staged?.omUploaded === false && staged?.omError) {
                message.success("Asset staged successfully");
                message.warning(`OM upload failed: ${staged.omError}`);
            } else {
                message.success("Asset staging submitted");
            }

            uiActions?.openWorkflow?.({
                context: buildAssetStagingLaunchContext({
                    contextSnapshot: baseLaunchContext,
                    extId,
                    assumptions,
                }),
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Asset staging failed — try again";
            setStageError(msg);
        } finally {
            setSubmitting(false);
        }
    }, [
        baseLaunchContext, extId, cusipOverride, cusipRequired,
        collateralType, assumptions, uiActions, widgetDefId,
        isDesigner, omFile, prepaymentType, prepaymentValue,
        defaultType, defaultValue, payloadFields, validationErrors,
        submitting,
    ]);

    const handleValidationErrorChange = React.useCallback((errors: Partial<ValidationErrors>) => {
        setValidationErrors((prev) => {
            const next = { ...prev };
            Object.entries(errors).forEach(([key, value]) => {
                if (value) {
                    next[key as keyof ValidationErrors] = value;
                } else {
                    delete next[key as keyof ValidationErrors];
                }
            });
            return next;
        });
    }, []);

    return (
        <WidgetCardShell>
            <div className={styles.widgetBody}>
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
                        {initializingPayload ? (
                            <div className={styles.centerStateCompact}>
                                <div className={styles.centerIcon}>
                                    <InboxOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
                                </div>

                                <Text className={styles.emptyDescription}>
                                    Loading deal structure…
                                </Text>
                            </div>
                        ) : (
                            <>
                                <div className={styles.headerRow}>
                                    <SectionHeader
                                        icon={<InboxOutlined style={{ fontSize: 12, color: token.colorPrimary }} />}
                                        title="New asset staging"
                                    />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {prefilling && (
                                            <span style={{ fontSize: 10, color: token.colorTextTertiary }}>
                                                Prefilling…
                                            </span>
                                        )}

                                        <PayloadPreview fields={payloadFields} />
                                    </div>
                                </div>

                                <div className={styles.dividerLine} />

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

                                <StagedItemsPanel
                                    items={effectiveItems}
                                    doneMap={doneMap}
                                    displayVal={displayVal}
                                    extId={extId}
                                    onExtIdChange={setExtId}
                                    cusipOverride={cusipOverride}
                                    onCusipOverrideChange={setCusipOverride}
                                    trancheCusip={trancheCusip}
                                    validationErrors={validationErrors}
                                    onValidationErrorChange={handleValidationErrorChange}
                                    omFile={omFile}
                                    onOmFileChange={setOmFile}
                                />

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
                                    callValue={callValue}
                                    onCallValueChange={setCallValue}
                                    callOptions={callOptions}
                                    collateralType={collateralType}
                                    onCollateralTypeChange={setCollateralType}
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

                                {stageError && (
                                    <div
                                        style={{
                                            borderRadius: token.borderRadius,
                                            background: token.colorErrorBg,
                                            border: `1px solid ${token.colorErrorBorder}`,
                                            padding: '8px 12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 4,
                                        }}
                                    >
                                        <span style={{ fontSize: 11, fontWeight: 700, color: token.colorError }}>
                                            Submission failed
                                        </span>
                                        <span style={{ fontSize: 11, color: token.colorError, lineHeight: '16px' }}>
                                            {stageError}
                                        </span>
                                    </div>
                                )}

                                {stageSuccess && (
                                    <div
                                        style={{
                                            borderRadius: token.borderRadius,
                                            background: token.colorSuccessBg,
                                            border: `1px solid ${token.colorSuccessBorder}`,
                                            padding: '8px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        <CheckCircleOutlined style={{ fontSize: 13, color: token.colorSuccess }} />
                                        <span style={{ fontSize: 11, fontWeight: 600, color: token.colorSuccess }}>
                                            Security setup request submitted successfully
                                        </span>
                                    </div>
                                )}

                                <div className={styles.launchContainer}>
                                    <Button
                                        type="primary"
                                        icon={<ArrowRightOutlined />}
                                        disabled={!readiness.canLaunch || stageSuccess || submitting}
                                        loading={submitting}
                                        onClick={handleLaunch}
                                        style={{ width: "100%" }}
                                    >
                                        {stageSuccess ? "Submitted" : "Launch asset setup"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </WidgetCardShell>
    );
}