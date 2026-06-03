import React from "react";
import { Button, Divider, Progress, theme, Typography } from "antd";
import {
    ArrowRightOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import clsx from "clsx";

import WidgetCardShell from '../../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../../types/widget';
import { useGetWidgetValue } from '../../../../state/Widgets/hooks';

import { buildAssetStagingLaunchContext } from './utils/buildLaunchContext'
import { SectionHeader } from './components/SectionTitle'
import { StagedItemsPanel } from './components/StagedIemsPanel'
import { InputAssumptionsPanel } from './components/InputAssumptionsPanel';
import { calculateAssetStagingReadiness } from './utils/readiness';
import type { CallableType, InputAssumptionsState, StagingItem } from './types';
import type { Dayjs } from 'dayjs';
import styles from './AssetStagingWidget.module.scss';

const { Text } = Typography;

const ITEMS: StagingItem[] = [
    { label: "Deal", ctxKey: "deal.id", required: true },
    { label: "Tranche", ctxKey: "asset.staged.trancheId", required: true },
    // Scenario result intentionally hidden for now.
    // { label: "Scenario result", ctxKey: "scenario.selectedResultId", required: false },
    { label: "External ID", ctxKey: "__extId__", required: false, isInput: true },
];

export default function AssetStagingWidget({
    widgetInstance,
    uiActions,
    loading,
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

    const channelId = widgetInstance?.config?.params?.channel;

    const dealId = useGetWidgetValue({
        channelId,
        key: "deal.id",
    }) as string | undefined;

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

    const baseLaunchContext = React.useMemo<Record<string, unknown>>(() => {
        const context: Record<string, unknown> = {};

        if (dealId) context["deal.id"] = dealId;
        if (dealName) context["deal.name"] = dealName;
        if (trancheId) context["asset.staged.trancheId"] = trancheId;
        if (trancheName) context["asset.staged.trancheName"] = trancheName;
        if (scenarioId) context["scenario.selectedResultId"] = scenarioId;
        if (assetIsNew) context["asset.isNew"] = assetIsNew;

        return context;
    }, [dealId, dealName, trancheId, trancheName, scenarioId, assetIsNew]);


    const stagingApplicable = assetIsNew === "true";
    const stagingExplicitlyNA = assetIsNew === "false";

    const doneMap: Record<string, boolean> = {
        "deal.id": !!dealId,
        "asset.staged.trancheId": !!trancheId,
        "scenario.selectedResultId": !!scenarioId,
        "__extId__": !!extId.trim(),
    };

    const displayVal: Record<string, string | undefined> = {
        "deal.id": dealName ?? dealId,
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

    const handleLaunch = React.useCallback(() => {
        uiActions?.openWorkflow?.({
            context: buildAssetStagingLaunchContext({
                contextSnapshot: baseLaunchContext,
                extId,
                assumptions,
            }),
        });
    }, [baseLaunchContext, extId, assumptions, uiActions]);

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
                {!stagingExplicitlyNA && !stagingApplicable && !dealId && (
                    <div className={styles.centerStateCompact}>
                        <div className={styles.centerIcon}>
                            <InboxOutlined style={{ fontSize: 20, color: token.colorTextQuaternary }} />
                        </div>

                        <Text className={styles.emptyDescription}>
                            Upload a CDI file or search for a security that is not yet in the system to begin asset staging
                        </Text>
                    </div>
                )}

                {!loading && (stagingApplicable || dealId) && !stagingExplicitlyNA && (
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
                        />

                        {/* Launch */}
                        <div className={styles.launchContainer}>
                            <Button
                                type="primary"
                                icon={<ArrowRightOutlined />}
                                disabled={!readiness.canLaunch}
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