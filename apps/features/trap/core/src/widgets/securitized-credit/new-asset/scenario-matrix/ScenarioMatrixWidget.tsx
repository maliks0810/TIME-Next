import React from 'react';
import clsx from 'clsx';

import WidgetCardShell from '../../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../../components/widget-shell/WidgetLoadingState';
import WidgetErrorState from '../../../../components/widget-shell/WidgetErrorState';
import { useWidgetPixels } from '../../../../components/widget-shell/WidgetSizeContext';
import type { WidgetComponentProps } from '../../../../types/widget';
import { useGetWidgetValue, useSetWidgetValue } from '../../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../../state/Tabs/hooks';
import { useTheme } from '../../../../theme/ThemeContext';
import { executeWidget } from '../../../../api/trap';
import { DEAL_NAME_KEY, TRANCHE_ID_KEY, TRANCHE_NAME_KEY } from '../../../constants';

import styles from './ScenarioMatrixWidget.module.scss';
import {
    CF_DUAL_PANE_MIN,
    SCENARIO_SELECTED_RESULT_ID,
    SCENARIO_SELECTED_SUMMARY,
} from './constants';
import { EMPTY_STATE, matrixReducer } from './state';
import type { CashFlowView } from './types';
import { deriveRunState } from './selectors';
import { usePager } from './hooks/usePager';
import { useMatrixEngine, type MatrixExecute } from './hooks/useMatrixEngine';
import { buildScenarioSummary } from './utils/scenarioSummary';
import { exportCashflowXlsx } from './utils/exportCashflow';
import MatrixHeader from './components/MatrixHeader';
import MatrixTable from './components/MatrixTable';
import CashFlowZone from './components/CashFlowZone';
import PresetBar from './components/PresetBar';
import AuditDrawer from './components/AuditDrawer';
import { useElementWidth } from './hooks/useElementWidth';

export default function ScenarioMatrixWidget(props: WidgetComponentProps) {
    const { widgetInstance, widgetDefinition, loading, error, mode } = props;
    const { themeName } = useTheme();
    const isDark = themeName === 'wealthDark' || String(themeName).toLowerCase().includes('dark');

    const config = widgetInstance?.config?.params ?? {};
    const channelId = config.channel;
    const exportFileName = String(config.exportFileName ?? 'scenario-analysis');
    const initialView = (config.cashFlowDefaultView as CashFlowView) ?? 'chart';
    const widgetDefId = String(
        widgetInstance?.composedWidgetId ??
            widgetInstance?.widgetDefinitionId ??
            widgetDefinition?.id ??
            'cwd_scenario_matrix_01'
    );
    const execMode: 'MOCK' | 'LIVE' = mode === 'designer' ? 'MOCK' : 'LIVE';

    // ── Context ──
    const dealName = useGetWidgetValue({ channelId, key: DEAL_NAME_KEY }) as string | undefined;
    const ctxTrancheId = useGetWidgetValue({ channelId, key: TRANCHE_ID_KEY }) as
        | string
        | undefined;
    const ctxTrancheName = useGetWidgetValue({ channelId, key: TRANCHE_NAME_KEY }) as
        | string
        | undefined;
    const refreshToken = useGetWidgetValue({ channelId, key: 'workflow.refresh' });
    const setValue = useSetWidgetValue();
    const activeTab = useGetActiveTab();

    // ── State + derived tranche in scope ──
    // Resolution: local override → context tranche.id (Tranches widget) →
    // context tranche.name matched to the stack (Security Lookup emits name only) →
    // first of the deal's tranche stack.
    const [state, dispatch] = React.useReducer(matrixReducer, EMPTY_STATE);
    const [trancheOverride, setTrancheOverride] = React.useState<string | undefined>(undefined);
    const ctxNameId = ctxTrancheName
        ? state.tranches.find((t) => t.name === ctxTrancheName)?.id
        : undefined;
    const effectiveTrancheId =
        trancheOverride ?? ctxTrancheId ?? ctxNameId ?? state.tranches[0]?.id;
    const trancheName =
        state.tranches.find((t) => t.id === effectiveTrancheId)?.name ??
        ctxTrancheName ??
        effectiveTrancheId ??
        '';

    // ── Orchestration (GraphQL-backed executor injected into the shared engine) ──
    const execute = React.useCallback<MatrixExecute>(
        async (op, params) => {
            const { result } = await executeWidget({
                widgetDefinitionId: widgetDefId,
                params: { op, ...params },
                context: {},
                mode: execMode,
            });
            return result;
        },
        [widgetDefId, execMode]
    );

    const engine = useMatrixEngine({
        state,
        dispatch,
        execute,
        dealName,
        effectiveTrancheId,
        refreshToken,
        onDealChanged: () => setTrancheOverride(undefined),
    });

    // ── View derivations ──
    const { widthPx } = useWidgetPixels(); // keep: header chrome breakpoints + dual-pane
    const [mxRef, mxWidth] = useElementWidth<HTMLDivElement>();
    const pager = usePager(mxWidth, state.scenarios, state.maxColumns); // measured inner box
    const runState = deriveRunState(state);
    const selScenario = state.scenarios.find((s) => s.key === state.sel) ?? null;
    const [cfView, setCfView] = React.useState<CashFlowView>(initialView);

    // ── Emit selected scenario for downstream (staging) ──
    // ── Emit selected scenario only on send to staging trigger, if it would be required for some scenario - should be discussed first to not break existing behavior ──
    // React.useEffect(() => {
    //     if (mode === 'preview' || !selScenario?.resultId) return;
    //     const summary = buildScenarioSummary(selScenario, trancheName, state.rows, state.unit);
    //     setValue({
    //         channelId,
    //         key: SCENARIO_SELECTED_RESULT_ID,
    //         value: selScenario.resultId,
    //         activeTab,
    //     });
    //     setValue({
    //         channelId,
    //         key: SCENARIO_SELECTED_SUMMARY,
    //         value: JSON.stringify(summary),
    //         activeTab,
    //     });
    // }, [state.sel, state.scenarios]);

    const onExport = React.useCallback(() => {
        if (!selScenario) return;
        void exportCashflowXlsx({
            scenario: selScenario,
            dealName: dealName ?? '',
            trancheName,
            rows: state.rows,
            unit: state.unit,
            fileName: exportFileName,
        });
    }, [selScenario, dealName, trancheName, state.rows, state.unit, exportFileName]);

    const onSend = React.useCallback(() => {
        if (mode === 'preview' || !selScenario?.resultId) return;
        const summary = buildScenarioSummary(selScenario, trancheName, state.rows, state.unit);
        setValue({
            channelId,
            key: SCENARIO_SELECTED_RESULT_ID,
            value: selScenario.resultId,
            activeTab,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue({ channelId, key: SCENARIO_SELECTED_SUMMARY, value: summary as any, activeTab });
    }, [selScenario, trancheName, state.rows, state.unit, channelId, activeTab, mode]);

    // ── Render ──
    if (loading) {
        return (
            <WidgetCardShell overflow="hidden">
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }
    if (error) {
        return (
            <WidgetCardShell overflow="hidden">
                <WidgetErrorState message={error} />
            </WidgetCardShell>
        );
    }

    const showEmpty = !state.ready && !engine.bootstrapping;

    return (
        <WidgetCardShell overflow="hidden">
            <div className={clsx(styles.root, { [styles.dark]: isDark })}>
                <MatrixHeader
                    widthPx={mxWidth}
                    tranche={
                        state.ready
                            ? {
                                  options: state.tranches,
                                  currentId: effectiveTrancheId,
                                  onChange: setTrancheOverride,
                              }
                            : null
                    }
                    pager={
                        state.ready
                            ? {
                                  total: pager.total,
                                  visibleCount: pager.visibleCount,
                                  offset: pager.offset,
                                  widthPx: mxWidth,
                                  onPrev: pager.prev,
                                  onNext: pager.next,
                              }
                            : null
                    }
                    onOpenAudit={engine.openAudit}
                />

                {state.ready && (
                    <PresetBar
                        profileKey={state.profileKey}
                        source={state.presetSrc}
                        hasDefault={engine.hasDefault}
                        justSaved={engine.justSaved}
                        pending={state.pending}
                        onKeepCurrent={engine.keepCurrent}
                        onLoadPending={engine.loadPending}
                        onPublishDefault={engine.publishDefault}
                    />
                )}

                {showEmpty ? (
                    <div className={styles.center}>
                        Select a deal and tranche to price scenarios
                    </div>
                ) : (
                    <>
                        <div ref={mxRef} className={styles.mxWrap}>
                            {state.ready && (
                                <MatrixTable
                                    rows={state.rows}
                                    unit={state.unit}
                                    groups={state.groups}
                                    scenarios={pager.visibleScenarios}
                                    sel={state.sel}
                                    addShown={pager.addShown}
                                    running={engine.running}
                                    runLabel={runState.runLabel}
                                    runDisabled={runState.runDisabled}
                                    allCurrent={runState.allCurrent}
                                    onEditCell={(k, r, v) =>
                                        dispatch({ type: 'EDIT_CELL', key: k, rowId: r, value: v })
                                    }
                                    onEditPrice={(k, v) =>
                                        dispatch({ type: 'EDIT_PRICE', key: k, value: v })
                                    }
                                    onSetUnit={(r, u) =>
                                        dispatch({ type: 'SET_UNIT', rowId: r, unit: u })
                                    }
                                    onToggleRow={(r, on) =>
                                        dispatch({ type: 'TOGGLE_ROW', rowId: r, on })
                                    }
                                    onToggleScenario={(k, on) =>
                                        dispatch({ type: 'TOGGLE_SCENARIO', key: k, on })
                                    }
                                    onRename={(k, n) =>
                                        dispatch({ type: 'RENAME_SCENARIO', key: k, name: n })
                                    }
                                    onRemove={(k) => dispatch({ type: 'REMOVE_SCENARIO', key: k })}
                                    onAdd={() => dispatch({ type: 'ADD_SCENARIO' })}
                                    onBindCF={(k) => dispatch({ type: 'BIND_CF', key: k })}
                                    onRun={engine.run}
                                />
                            )}
                        </div>

                        <CashFlowZone
                            scenario={selScenario}
                            view={cfView}
                            onView={setCfView}
                            onExport={onExport}
                            onSend={onSend}
                            canSend={!!selScenario?.cashflow}
                            dualPane={widthPx >= CF_DUAL_PANE_MIN}
                        />
                    </>
                )}

                <AuditDrawer
                    open={engine.drawerOpen}
                    scope={state.profileKey}
                    rows={engine.auditRows}
                    onClose={engine.closeAudit}
                />
            </div>
        </WidgetCardShell>
    );
}
