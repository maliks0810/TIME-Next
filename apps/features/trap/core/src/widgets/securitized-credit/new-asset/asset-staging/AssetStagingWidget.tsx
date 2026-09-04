import React, { useEffect } from 'react';
import { Button, Divider, Progress, theme, Typography, message } from 'antd';
import {
    ArrowRightOutlined,
    CheckCircleOutlined,
    InboxOutlined,
    CloseOutlined,
    CalculatorOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';

import WidgetCardShell from '../../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../../types/widget';
import { useGetWidgetValue, useSetWidgetValue } from '../../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../../state/Tabs/hooks';
import { useTheme } from '../../../../theme/ThemeContext';
import { executeWidget } from '../../../../api/trap';

import { buildAssetStagingLaunchContext } from './utils/buildLaunchContext';
import { validateStagingForm, hasErrors, isValidCusip } from '../../../../utils/validation';
import type { ValidationErrors } from '../../../../utils/validation';
import { SectionHeader } from './components/SectionTitle';
import { StagedItemsPanel } from './components/StagedIemsPanel';
import { InputAssumptionsPanel } from './components/InputAssumptionsPanel';
import { PayloadPreview } from './components/PayloadPreview';
import StatusLine from './components/StatusLine';
import type { StatusTone, StatusChip, ChipState } from './components/StatusLine';
import { calculateAssetStagingReadiness } from './utils/readiness';
import type { CallableType, InputAssumptionsState, StagingItem } from './types';
import type { Dayjs } from 'dayjs';
import styles from './AssetStagingWidget.module.scss';
import {
    SCENARIO_MATRIX_UPDATE_TIMESTAMP,
    SCENARIO_SELECTED_SUMMARY,
    SELECTED_SCENARIO_CASHFLOWS,
} from '../scenario-matrix/constants';
import { ScenarioSummary } from '../scenario-matrix/utils/scenarioSummary';
import { PendingInputDialogue } from './components/PendingInputDialogue';

const { Text } = Typography;

type StatusState = {
    tone: StatusTone;
    label: string;
    summary: string;
    detail?: string;
    popoverTitle?: string;
    chips?: StatusChip[];
    copyable?: boolean;
};

const ITEMS: StagingItem[] = [
    { label: 'Deal', ctxKey: 'deal.name', required: true },
    { label: 'Tranche', ctxKey: 'asset.staged.trancheId', required: true },
    {
        label: 'CUSIP',
        ctxKey: '__cusipOverride__',
        required: false,
        isInput: true,
        inputType: 'cusip',
    },
    {
        label: 'External ID',
        ctxKey: '__extId__',
        required: false,
        isInput: true,
        inputType: 'extId',
    },
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

    const { themeName } = useTheme();

    const isWealthTheme = themeName === 'wealthLight' || themeName === 'wealthDark';

    const isWealthLight = themeName === 'wealthLight';

    const isWealthDark = themeName === 'wealthDark';

    const [extId, setExtId] = React.useState('');
    const [cusipOverride, setCusipOverride] = React.useState('');
    const [omFile, setOmFile] = React.useState<File | null>(null);

    const [trancheCusip, setTrancheCusip] = React.useState<string | undefined>(undefined);
    const [collateralType, setCollateralType] = React.useState<string | undefined>(undefined);
    const [prefilling, setPrefilling] = React.useState(false);

    const [payloadSnapshot, setPayloadSnapshot] = React.useState<Record<string, unknown>>({});
    const [initializingPayload, setInitializingPayload] = React.useState(false);

    const [heldStatus, setHeldStatus] = React.useState<{
        anyHeld: boolean;
        heldCusips: string[];
        tranches: {
            cusip: string;
            trancheName: string | null;
            held: boolean;
            portfolios: string[];
        }[];
        message: string | null;
    } | null>(null);

    const [callOptions, setCallOptions] = React.useState<{ label: string; value: string }[]>([]);

    const [price, setPrice] = React.useState<number | null>(null);
    const [callable, setCallable] = React.useState<CallableType | null>('N');
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

    const [status, setStatus] = React.useState<StatusState | null>(null);

    const [isScenarioMatrixPending, setIsScenarioMatrixPending] = React.useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [acceptedCashflows, setAcceptedCashflows] = React.useState<any>(null);

    const channelId = widgetInstance?.config?.params?.channel;
    const isDesigner = mode === 'designer';

    const widgetDefId = String(
        widgetInstance?.composedWidgetId ??
            widgetInstance?.widgetDefinitionId ??
            widgetDefinition?.id ??
            ''
    );

    const dealName = useGetWidgetValue({
        channelId,
        key: 'deal.name',
    }) as string | undefined;

    const stagedTrancheId = useGetWidgetValue({
        channelId,
        key: 'asset.staged.trancheId',
    }) as string | undefined;

    const stagedTrancheName = useGetWidgetValue({
        channelId,
        key: 'asset.staged.trancheName',
    }) as string | undefined;

    const liveTrancheId = useGetWidgetValue({
        channelId,
        key: 'tranche.id',
    }) as string | undefined;

    const liveTrancheName = useGetWidgetValue({
        channelId,
        key: 'tranche.name',
    }) as string | undefined;

    const scenarioRunSummary = useGetWidgetValue({
        channelId,
        key: SCENARIO_SELECTED_SUMMARY,
    }) as ScenarioSummary;
    const scenarioMatrixUpdate = useGetWidgetValue({
        channelId,
        key: SCENARIO_MATRIX_UPDATE_TIMESTAMP,
    });
    const scenarioCashflows = useGetWidgetValue({
        channelId,
        key: SELECTED_SCENARIO_CASHFLOWS,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    useEffect(() => {
        if (scenarioMatrixUpdate) {
            setIsScenarioMatrixPending(true);
        }
    }, [scenarioMatrixUpdate]);

    const closePendingModal = () => {
        setIsScenarioMatrixPending(false);
        // clear all staging items
        setWidgetValueToChannel({
            channelId,
            key: SCENARIO_MATRIX_UPDATE_TIMESTAMP,
            value: null,
            activeTab,
        });
        setWidgetValueToChannel({
            channelId,
            key: SCENARIO_SELECTED_SUMMARY,
            value: null,
            activeTab,
        });
        setWidgetValueToChannel({
            channelId,
            key: SELECTED_SCENARIO_CASHFLOWS,
            value: null,
            activeTab,
        });
    };

    const onAssumptionsAccept = () => {
        const summary = scenarioRunSummary as unknown as ScenarioSummary;

        if (summary) {
            setPrice(summary?.price);
            setPrepaymentType(summary?.assumptions?.prepay?.type);
            setPrepaymentValue(summary?.assumptions?.prepay?.value);
            setDefaultType(summary?.assumptions?.default?.type);
            setDefaultValue(summary?.assumptions?.default?.value);
            setSeverity(summary?.assumptions?.severity?.value || null);
            setDelinquency(summary?.assumptions?.delinquency?.value);
        }

        if (scenarioCashflows) {
            setAcceptedCashflows(scenarioCashflows);
        }

        closePendingModal();
    };

    const trancheName = stagedTrancheName ?? liveTrancheName;
    const derivedTrancheId = trancheName ? `t_${String(trancheName).toLowerCase()}` : undefined;
    const trancheId = stagedTrancheId ?? liveTrancheId ?? derivedTrancheId;

    const scenarioId = useGetWidgetValue({
        channelId,
        key: 'scenario.selectedResultId',
    }) as string | undefined;

    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();

    // ─── Step 1: Init payload when deal arrives ───
    const prevDealNameRef = React.useRef<string | undefined>(undefined);

    React.useEffect(() => {
        if (dealName && dealName !== prevDealNameRef.current) {
            setStatus(null);
            setExtId('');
            setCusipOverride('');
            setOmFile(null);
            setTrancheCusip(undefined);
            setCollateralType(undefined);
            setPayloadSnapshot({});
            setCallOptions([]);
            setPrice(null);
            setCallable('N');
            setCallDate(null);
            setCallValue(undefined);
            setPrepaymentType(undefined);
            setPrepaymentValue(null);
            setDefaultType(undefined);
            setDefaultValue(null);
            setSeverity(null);
            setDelinquency(null);
            setValidationErrors({});
            setHeldStatus(null);

            [
                'asset.staged.trancheId',
                'asset.staged.trancheName',
                'scenario.selectedResultId',
            ].forEach((key) =>
                setWidgetValueToChannel({
                    channelId,
                    key,
                    value: null,
                    activeTab,
                    widgetId: widgetInstance.id,
                })
            );

            const init = async () => {
                setInitializingPayload(true);

                try {
                    const { result } = await executeWidget({
                        widgetDefinitionId: widgetDefId,
                        params: {
                            action: 'initPayload',
                            dealName,
                        },
                        context: {},
                        mode: isDesigner ? 'MOCK' : 'LIVE',
                    });

                    setPayloadSnapshot(result.fields ?? {});

                    if (result.heldStatus) {
                        setHeldStatus(result.heldStatus as typeof heldStatus);
                    }

                    if (Array.isArray(result.callOptions)) {
                        setCallOptions(result.callOptions);
                    }

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

    // ─── Step 2: Prefill when tranche is selected (keyed on NAME) ───
    const prevTrancheNameRef = React.useRef(trancheName);

    React.useEffect(() => {
        if (!trancheName || trancheName === prevTrancheNameRef.current) {
            prevTrancheNameRef.current = trancheName;
            return;
        }

        prevTrancheNameRef.current = trancheName;
        setStatus(null);

        const prefetch = async () => {
            setPrefilling(true);

            try {
                const { result } = await executeWidget({
                    widgetDefinitionId: widgetDefId,
                    params: {
                        action: 'prefill',
                        dealName,
                        tranche: trancheName,
                    },
                    context: {},
                    mode: isDesigner ? 'MOCK' : 'LIVE',
                });

                if (result.cusip) setTrancheCusip(result.cusip);
                if (result.collateralType) setCollateralType(result.collateralType);
                if (typeof result.price === 'number') setPrice(result.price);
                if (result.callable) setCallable(result.callable);
                if (result.prepaymentType) setPrepaymentType(result.prepaymentType);
                if (typeof result.prepaymentValue === 'number')
                    setPrepaymentValue(result.prepaymentValue);
                if (result.defaultType) setDefaultType(result.defaultType);
                if (typeof result.defaultValue === 'number') setDefaultValue(result.defaultValue);
                if (typeof result.severity === 'number') setSeverity(result.severity);
                if (typeof result.delinquency === 'number') setDelinquency(result.delinquency);

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
    }, [trancheName, dealName, widgetDefId, isDesigner]);

    // Reset tranche-derived fields whenever the effective tranche CLEARS.
    // The deal-change reset only fires on a DIFFERENT deal; re-selecting the
    // SAME deal with no tranche (e.g. after an A3 recent) left stale tranche
    // data — most visibly the CUSIP. Keying on trancheName going falsy clears
    // it in every case (same deal or new deal).
    const hadTrancheRef = React.useRef<boolean>(!!trancheName);
    React.useEffect(() => {
        const hasTranche = !!trancheName;
        if (hadTrancheRef.current && !hasTranche) {
            // Tranche was present and is now gone → clear tranche-level state.
            setTrancheCusip(undefined);
            setCusipOverride('');
            setCollateralType(undefined);
            setPrice(null);
            setCallable('N');
            setCallDate(null);
            setCallValue(undefined);
            setPrepaymentType(undefined);
            setPrepaymentValue(null);
            setDefaultType(undefined);
            setDefaultValue(null);
            setSeverity(null);
            setDelinquency(null);
            // Drop tranche-level fields merged into the snapshot during prefill,
            // but keep deal-level fields (from initPayload) intact.
            setPayloadSnapshot((prev) => {
                const next = { ...prev };
                delete next.cusip;
                delete next.tranche;
                delete next.identifierTypeValue;
                delete next.identifierValue;
                delete next.idBbGlobal;
                return next;
            });
            // Also reset the prefill guard so re-selecting the SAME tranche name
            // later will re-run prefill instead of being deduped.
            prevTrancheNameRef.current = undefined;
        }
        hadTrancheRef.current = hasTranche;
    }, [trancheName]);

    // ─── Payload preview: merge backend snapshot + user overrides ───
    const payloadFields = React.useMemo(() => {
        const snapshotCusip =
            payloadSnapshot.cusip && !/^(.)\1+$/i.test(String(payloadSnapshot.cusip))
                ? String(payloadSnapshot.cusip)
                : undefined;

        const effectiveCusip = cusipOverride.trim() || snapshotCusip || trancheCusip;

        const snapshotIsin =
            payloadSnapshot.identifierTypeValue === 'ISIN' && payloadSnapshot.identifierValue
                ? String(payloadSnapshot.identifierValue)
                : undefined;

        let identifierTypeValue: string | undefined;
        let identifierValue: string | undefined;

        if (cusipOverride.trim()) {
            identifierTypeValue = 'CUSIP';
            identifierValue = cusipOverride.trim();
        } else if (snapshotCusip) {
            identifierTypeValue = 'CUSIP';
            identifierValue = snapshotCusip;
        } else if (snapshotIsin) {
            identifierTypeValue = 'ISIN';
            identifierValue = snapshotIsin;
        }

        // INTEX deal name — the ONLY value SSD receives as the deal identity.
        const intexName =
            (dealName as string | undefined) ??
            (payloadSnapshot.intexDealName as string | undefined);

        const merged: Record<string, unknown> = {
            ...payloadSnapshot,

            cusip: effectiveCusip,

            aladdinCdiId: extId.trim() || payloadSnapshot.aladdinCdiId,

            // SSD deal identity: ALWAYS INTEX (both fields), never Bloomberg.
            intexDealName: intexName,
            dealName: intexName,

            // Description = Bloomberg ticker from backend (includes tranche) — this
            // is CORRECT for SSD labeling. It is DISPLAY-ONLY-elsewhere; it must
            // NOT be used as the Deal-row display (that needs the deal name only).
            description:
                payloadSnapshot.description ??
                (intexName && trancheName ? `${intexName} ${trancheName}` : undefined),

            tranche: payloadSnapshot.tranche ?? trancheName,

            identifierTypeValue,
            identifierValue,

            idBbGlobal: payloadSnapshot.idBbGlobal ?? undefined,

            isNewIssue: true,
            ssapIdPassword: '',
            isEuSecuritizationRequested: payloadSnapshot.isEuSecuritizationRequested ?? false,
            sourceAppName: 'TRAP',
            marketSectorTypeValue: 'Mtge',

            callableValue: callable ?? payloadSnapshot.callableValue,
            callDate: callDate?.format('YYYY-MM-DD') ?? payloadSnapshot.callDate,
            price: price ?? payloadSnapshot.price,
            collateralValue: collateralType ?? payloadSnapshot.collateralValue,
            sectorValue: collateralType ?? payloadSnapshot.sectorValue,
            prepaymentTypeValue: prepaymentType ?? payloadSnapshot.prepaymentTypeValue,
            prepaymentSpeed: prepaymentValue ?? payloadSnapshot.prepaymentSpeed,
            defaultTypeValue: defaultType ?? payloadSnapshot.defaultTypeValue,
            defaultSpeed: defaultValue ?? payloadSnapshot.defaultSpeed,
            severity: severity ?? payloadSnapshot.severity,
            delinquency: delinquency ?? payloadSnapshot.delinquency,

            slicerTypeValue: payloadSnapshot.slicerTypeValue ?? undefined,
            mbsTypeValue: payloadSnapshot.mbsTypeValue ?? undefined,
        };

        if (callable === 'C' && callValue) {
            merged.noteInstructions = callValue;
        }

        return Object.entries(merged).map(([key, value]) => ({
            key,
            value: value as string | number | boolean | null | undefined,
        }));
    }, [
        payloadSnapshot,
        cusipOverride,
        trancheCusip,
        extId,
        dealName,
        trancheName,
        callable,
        callDate,
        price,
        collateralType,
        prepaymentType,
        prepaymentValue,
        defaultType,
        defaultValue,
        severity,
        delinquency,
        callValue,
    ]);

    const cusipRequired = isInvalidCusip(trancheCusip);

    const baseLaunchContext = React.useMemo<Record<string, unknown>>(() => {
        const context: Record<string, unknown> = {};

        if (dealName) context['deal.name'] = dealName;
        if (trancheId) context['asset.staged.trancheId'] = trancheId;
        if (trancheName) context['asset.staged.trancheName'] = trancheName;
        if (scenarioId) context['scenario.selectedResultId'] = scenarioId;

        return context;
    }, [dealName, trancheId, trancheName, scenarioId]);

    // Held status is per-tranche. Staging targets ONE tranche, so gate on the
    // SELECTED tranche's held flag — not the deal-level anyHeld.
    const selectedTrancheHeld = React.useMemo(() => {
        if (!heldStatus || !heldStatus.tranches?.length) return null;
        const match = heldStatus.tranches.find(
            (t) =>
                (trancheName && t.trancheName === trancheName) ||
                (trancheCusip && t.cusip === trancheCusip)
        );
        return match?.held ? match : null;
    }, [heldStatus, trancheName, trancheCusip]);

    const alreadySetUp = !!selectedTrancheHeld;

    const effectiveItems = React.useMemo(
        () =>
            ITEMS.map((item) =>
                item.inputType === 'cusip' ? { ...item, required: cusipRequired } : item
            ),
        [cusipRequired]
    );

    const doneMap: Record<string, boolean> = {
        'deal.name': !!dealName,
        'asset.staged.trancheId': !!trancheName,
        __cusipOverride__: cusipRequired
            ? cusipOverride.trim().length === 9 &&
              isValidCusip(cusipOverride.trim().toUpperCase()) &&
              !validationErrors.cusip
            : true,
        __extId__: !!extId.trim(),
    };

    // DISPLAY: Deal row shows the BLOOMBERG DEAL NAME only (e.g. "EART 2025-2A").
    // Source is the dedicated bloomberg deal-name field ONLY — never `description`
    // (that's the Bloomberg TICKER and includes the tranche, e.g. "EART 2025-2A
    // A1", which is what wrongly appeared). Falls back to INTEX when no Bloomberg
    // deal name is available (CDI path).
    const bloombergDealName =
        (payloadSnapshot.bloombergDealName as string | undefined) ??
        (payloadSnapshot.bloombergName as string | undefined) ??
        (payloadSnapshot.ssdDealName as string | undefined);

    const displayVal: Record<string, string | undefined> = {
        'deal.name': bloombergDealName || dealName,
        'asset.staged.trancheId': trancheName ?? trancheId,
        __cusipOverride__: cusipOverride.trim() || trancheCusip,
        'scenario.selectedResultId': scenarioId,
        __extId__: extId.trim() || undefined,
    };

    const assumptions = React.useMemo<InputAssumptionsState>(
        () => ({
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
        }),
        [
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
        ]
    );

    const readiness = calculateAssetStagingReadiness({
        items: effectiveItems,
        doneMap,
        assumptions,
    });

    const handleCallableChange = React.useCallback((next: CallableType) => {
        setCallable(next);

        if (next !== 'Y') {
            setCallDate(null);
        }

        if (next !== 'C') {
            setCallValue(undefined);
        }
    }, []);

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

    // ─── Step 4: Launch ───
    const handleLaunch = React.useCallback(async () => {
        if (submitting) return;

        setStatus(null);

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

        if (validationErrors.cusip || validationErrors.extId) {
            return;
        }

        setStatus(null);

        const setupWindow = window.open('about:blank', '_blank');

        if (setupWindow) {
            try {
                setupWindow.document.write(
                    '<!doctype html><title>Security Setup</title>' +
                        "<body style='font:14px -apple-system,Segoe UI,Roboto,Arial;" +
                        'display:flex;align-items:center;justify-content:center;' +
                        "height:100vh;margin:0;color:#555'>Opening Security Setup…</body>"
                );
            } catch {
                // Cross-origin/security edge — safe to ignore, tab still opens.
            }
        }

        const finalPayload: Record<string, unknown> = {};

        payloadFields.forEach(({ key, value }) => {
            if (value != null && value !== '') {
                finalPayload[key] = value;
            }
        });

        let omBase64: string | undefined;

        if (omFile) {
            try {
                omBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = () => reject(new Error('File read failed'));
                    reader.readAsDataURL(omFile);
                });
            } catch {
                if (setupWindow) setupWindow.close();
                setStatus({
                    tone: 'error',
                    label: 'Submission failed',
                    summary: 'Could not read the Offering Memorandum file.',
                    detail: 'The selected Offering Memorandum file could not be read. Please re-attach it and try again.',
                    popoverTitle: 'File read error',
                    copyable: true,
                    chips: [{ label: 'Details', state: 'bad' }],
                });
                message.error('Could not read the OM file');
                return;
            }
        }

        setSubmitting(true);

        try {
            const { result: stageResult } = await executeWidget({
                widgetDefinitionId: widgetDefId,
                params: {
                    action: 'stage',
                    ...finalPayload,
                    ...(omBase64 && omFile
                        ? {
                              omFileName: omFile.name,
                              omFileBase64: omBase64,
                          }
                        : {}),
                },
                context: {},
                mode: isDesigner ? 'MOCK' : 'LIVE',
            });

            const staged = stageResult as Record<string, unknown>;

            if (staged?.success === false || staged?.error) {
                if (setupWindow) setupWindow.close();
                const errorMsg = String(staged.error ?? 'Request failed — please try again');
                setStatus({
                    tone: 'error',
                    label: 'Submission failed',
                    summary: errorMsg,
                    detail: errorMsg,
                    popoverTitle: 'Submission failed',
                    copyable: true,
                    chips: [{ label: 'Details', state: 'bad' }],
                });
                message.error('Security setup request failed');
                setSubmitting(false);
                return;
            }

            const setupUrl = staged.securitySetupUrl as string | undefined;

            let launchOk = false;
            let launchIssue: 'no-link' | 'blocked' | null = null;

            if (setupUrl) {
                if (setupWindow) {
                    setupWindow.location.href = setupUrl;
                    launchOk = true;
                } else {
                    const retry = window.open(setupUrl, '_blank');
                    if (retry) {
                        launchOk = true;
                    } else {
                        launchIssue = 'blocked';
                    }
                }
            } else {
                if (setupWindow) setupWindow.close();
                launchIssue = 'no-link';
            }

            const omAttached = !!omFile;
            const omFailed = omAttached && staged?.omUploaded === false;

            const omState: ChipState = !omAttached ? 'na' : omFailed ? 'bad' : 'ok';
            const launchState: ChipState = launchOk ? 'ok' : 'warn';

            const chips: StatusChip[] = [
                { label: 'Details', state: 'ok' },
                { label: 'OM', state: omState },
                { label: 'Launch', state: launchState },
            ];

            if (launchOk && !omFailed) {
                setStatus({
                    tone: 'success',
                    label: 'Request submitted',
                    summary: 'Security Setup opened in a new tab',
                    chips,
                });
                message.success('Security setup request submitted');
            } else {
                const parts: string[] = [];

                if (omFailed) {
                    parts.push(
                        staged.omError
                            ? `Offering Memorandum upload failed: ${staged.omError}.`
                            : 'Offering Memorandum upload failed.'
                    );
                }

                if (launchIssue === 'no-link') {
                    parts.push(
                        'The request was submitted successfully, but the Security Setup ' +
                            'app could not be opened because no setup link was provided by the service.'
                    );
                } else if (launchIssue === 'blocked') {
                    parts.push(
                        'The request was submitted successfully, but your browser blocked the ' +
                            'Security Setup pop-up. Please allow pop-ups for this site and try the link again.'
                    );
                }

                let summary: string;
                let popoverTitle: string;

                if (launchIssue === 'no-link') {
                    summary = 'Setup app not opened — no link provided';
                    popoverTitle = 'Security Setup not opened';
                } else if (launchIssue === 'blocked') {
                    summary = 'Setup app blocked by browser pop-up settings';
                    popoverTitle = 'Security Setup blocked';
                } else {
                    summary = 'Request submitted — Offering Memorandum upload failed';
                    popoverTitle = 'Offering Memorandum not uploaded';
                }

                setStatus({
                    tone: 'warning',
                    label: 'Request submitted',
                    summary,
                    detail: parts.join(' '),
                    popoverTitle,
                    copyable: true,
                    chips,
                });
                message.warning(summary);
            }

            uiActions?.openWorkflow?.({
                context: buildAssetStagingLaunchContext({
                    contextSnapshot: baseLaunchContext,
                    extId,
                    assumptions,
                }),
            });
        } catch (err: unknown) {
            if (setupWindow) setupWindow.close();
            const msg = err instanceof Error ? err.message : 'Request failed — please try again';
            setStatus({
                tone: 'error',
                label: 'Submission failed',
                summary: msg,
                detail: msg,
                popoverTitle: 'Submission failed',
                copyable: true,
                chips: [{ label: 'Details', state: 'bad' }],
            });
            message.error(msg);
        } finally {
            setSubmitting(false);
        }
    }, [
        baseLaunchContext,
        extId,
        cusipOverride,
        cusipRequired,
        collateralType,
        assumptions,
        uiActions,
        widgetDefId,
        isDesigner,
        omFile,
        prepaymentType,
        prepaymentValue,
        defaultType,
        defaultValue,
        payloadFields,
        validationErrors,
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

    const submitted = status?.tone === 'success' || status?.tone === 'warning';

    return (
        <WidgetCardShell>
            <div
                className={clsx(styles.widgetBody, {
                    [styles.wealth]: isWealthTheme,
                    [styles.wealthLight]: isWealthLight,
                    [styles.wealthDark]: isWealthDark,
                })}
            >
                {alreadySetUp && (
                    <div className={styles.centerState}>
                        <div className={styles.centerIcon}>
                            <CheckCircleOutlined
                                style={{ fontSize: 20, color: token.colorSuccess }}
                            />
                        </div>

                        <div className={styles.centerText}>
                            <Text className={styles.centerTitle}>Tranche already in system</Text>

                            <Text className={styles.centerDescription}>
                                {`${selectedTrancheHeld?.trancheName} (${selectedTrancheHeld?.cusip}) is already set up` +
                                    '. Asset setup is not required.'}
                            </Text>
                        </div>
                    </div>
                )}

                {!alreadySetUp && !dealName && (
                    <div className={styles.centerStateCompact}>
                        <div className={styles.centerIcon}>
                            <InboxOutlined
                                style={{ fontSize: 20, color: token.colorTextQuaternary }}
                            />
                        </div>

                        <Text className={styles.emptyDescription}>
                            Upload a CDI file or search for a security that is not yet in the system
                            to begin asset staging
                        </Text>
                    </div>
                )}

                {!loading && dealName && !alreadySetUp && (
                    <>
                        {initializingPayload ? (
                            <div className={styles.centerStateCompact}>
                                <div className={styles.centerIcon}>
                                    <InboxOutlined
                                        style={{ fontSize: 20, color: token.colorPrimary }}
                                    />
                                </div>

                                <Text className={styles.emptyDescription}>
                                    Loading deal structure…
                                </Text>
                            </div>
                        ) : (
                            <>
                                <div className={styles.headerRow}>
                                    <SectionHeader
                                        icon={
                                            <InboxOutlined
                                                style={{ fontSize: 12, color: token.colorPrimary }}
                                            />
                                        }
                                        title="New asset staging"
                                    />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {prefilling && (
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    color: token.colorTextTertiary,
                                                }}
                                            >
                                                Prefilling…
                                            </span>
                                        )}

                                        <PayloadPreview fields={payloadFields} />
                                    </div>
                                </div>

                                <div className={styles.dividerLine} />

                                <div>
                                    <div className={styles.readinessHeader}>
                                        <Text className={styles.readinessLabel}>Readiness</Text>

                                        <Text
                                            className={clsx(
                                                styles.readinessValue,
                                                readiness.canLaunch
                                                    ? styles.readinessSuccess
                                                    : styles.readinessWarning
                                            )}
                                        >
                                            {readiness.requiredDone} / {readiness.requiredTotal}{' '}
                                            required
                                        </Text>
                                    </div>

                                    <Progress
                                        percent={readiness.percent}
                                        size="small"
                                        showInfo={false}
                                        strokeColor={
                                            readiness.canLaunch
                                                ? token.colorSuccess
                                                : token.colorWarning
                                        }
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

                                <div className={styles.headerRow}>
                                    <SectionHeader
                                        icon={
                                            <CalculatorOutlined
                                                style={{
                                                    fontSize: 12,
                                                    color: token.colorPrimary,
                                                }}
                                            />
                                        }
                                        title="Input Assumptions"
                                    />
                                    {acceptedCashflows && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 8,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            <div style={{ color: acceptedCashflows?.color }}>
                                                Cashflows Attached
                                            </div>
                                            <div>
                                                <CloseOutlined
                                                    style={{
                                                        color: token.colorError,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => {
                                                        setAcceptedCashflows(null);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isScenarioMatrixPending ? (
                                    <PendingInputDialogue
                                        scenarioRunSummary={scenarioRunSummary}
                                        cashflow={scenarioCashflows}
                                        onPendingInputAccept={onAssumptionsAccept}
                                        onPendingInputDismiss={closePendingModal}
                                    />
                                ) : (
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
                                )}

                                {status && (
                                    <StatusLine
                                        tone={status.tone}
                                        label={status.label}
                                        summary={status.summary}
                                        detail={status.detail}
                                        popoverTitle={status.popoverTitle}
                                        chips={status.chips}
                                        copyable={status.copyable}
                                    />
                                )}

                                <div className={styles.launchContainer}>
                                    <Button
                                        type="primary"
                                        icon={<ArrowRightOutlined />}
                                        disabled={!readiness.canLaunch || submitted || submitting}
                                        loading={submitting}
                                        onClick={handleLaunch}
                                        style={{ width: '100%' }}
                                    >
                                        {submitted ? 'Submitted' : 'Launch asset setup'}
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
