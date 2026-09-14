/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { BankOutlined } from '@ant-design/icons';
import clsx from 'clsx';

import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { useWidgetSize, WidgetSizeBands } from '../../../components/layout/useWidgetSize';
import { WidgetComponentProps } from '../../../types/widget';
import { executeWidget } from '../../../api/trap';
import { DealFromIntex, RecentDeal, UploadState } from './../types';
import { RecetlyIngested } from './components/RecentlyIngested';
import { StateRow } from './components/StateRow';
import { Uploading } from './components/Uploading';
import { ActionRow } from './components/ActionRow';
import { Dropzone } from './components/Dropzone';
import { planCDIUpload } from './components/planLayout';
import styles from './CDIUploadWidget.module.scss';
import { ANALYSIS_SESSION_ID_KEY, DEAL_NAME_KEY } from '../../constants';
import { useSetWidgetValue, useGetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { useTheme } from '../../../theme/ThemeContext';

const CDI_BANDS: WidgetSizeBands = {
    width: { wb: 6, wc: 9 },
    height: { h2: 110, h3: 160, h4: 210 },
};

export default function CDIUploadWidget({
    widgetInstance,
    result,
    widgetDefinition,
    mode,
    execute: baseWidgetExecute,
}: WidgetComponentProps) {
    const { ref, cols, heightPx } = useWidgetSize(CDI_BANDS);
    const { themeName } = useTheme();

    const isWealthTheme = themeName === 'wealthLight' || themeName === 'wealthDark';

    const isWealthLight = themeName === 'wealthLight';

    const isWealthDark = themeName === 'wealthDark';

    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [fromIntex, setFromIntex] = useState<DealFromIntex | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loadedDeal, setLoadedDeal] = useState<RecentDeal | null>(null);
    const [fromRecent, setFromRecent] = useState(false);
    const [deletedDeals, setDeletedDeals] = useState<string[]>([]);
    // Optimistically-added deals (just uploaded/fetched) so they show in the
    // Recently Ingested list IMMEDIATELY, before the server list round-trips.
    const [addedDeals, setAddedDeals] = useState<RecentDeal[]>([]);

    const widgetDefId = String(
        widgetInstance?.composedWidgetId ??
            widgetInstance?.widgetDefinitionId ??
            widgetDefinition?.id ??
            ''
    );

    const isDesigner = mode === 'designer';
    const channelId = widgetInstance?.config?.params?.channel;
    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();

    const channelDealName = useGetWidgetValue({ channelId, key: DEAL_NAME_KEY }) as
        | string
        | undefined;
    const lastPublishedDealRef = useRef<string | null>(null);

    useEffect(() => {
        if (
            channelDealName &&
            lastPublishedDealRef.current &&
            channelDealName !== lastPublishedDealRef.current
        ) {
            setUploadState('idle');
            setFileName('');
            setProgress(0);
            setLoadedDeal(null);
            setFromRecent(false);
            setFromIntex(null);
            setErrorMsg('');
            lastPublishedDealRef.current = null;
        }
    }, [channelDealName]);

    const recentDeals = useMemo(() => {
        const executeResult =
            result && Array.isArray((result as any).recentDeals)
                ? ((result as any).recentDeals as RecentDeal[])
                : [];

        // Merge optimistic adds on top; server list wins on dedupe (by dealName)
        // so once the backend returns the deal we don't show a duplicate.
        const serverNames = new Set(executeResult.map((d) => d.dealName));
        const merged = [
            ...addedDeals.filter((d) => !serverNames.has(d.dealName)),
            ...executeResult,
        ];

        if (deletedDeals.length === 0) return merged;
        return merged.filter((deal) => !deletedDeals.includes(deal.dealName));
    }, [deletedDeals, result, addedDeals]);

    // Insert a deal into the optimistic list immediately + clear any prior
    // delete of the same name (re-upload of a deleted deal should reappear).
    const addRecentOptimistic = useCallback((deal: RecentDeal) => {
        setAddedDeals((prev) => [deal, ...prev.filter((d) => d.dealName !== deal.dealName)]);
        setDeletedDeals((prev) => prev.filter((name) => name !== deal.dealName));
    }, []);

    const publishDeal = (deal: { dealName: string; sessionId: string }) => {
        lastPublishedDealRef.current = deal.dealName;
        setWidgetValueToChannel({
            channelId,
            key: DEAL_NAME_KEY,
            value: deal.dealName,
            activeTab,
            widgetId: widgetInstance.id,
        });
        setWidgetValueToChannel({
            channelId,
            key: ANALYSIS_SESSION_ID_KEY,
            value: deal.sessionId,
            activeTab,
            widgetId: widgetInstance.id,
        });
    };

    const handleFetch = async ({ dealName, passcode }: { dealName: string; passcode: string }) => {
        setUploadState('uploading');
        setProgress(20);
        setErrorMsg('');
        try {
            setProgress(60);
            const { result } = await executeWidget({
                widgetDefinitionId: widgetDefId,
                params: { action: 'fetch', passcode, dealName },
                context: {},
                mode: isDesigner ? 'MOCK' : 'LIVE',
            });
            setProgress(100);
            const newDeal = {
                dealName: result.dealName,
                uploadedAt: result.uploadedAt ?? new Date().toLocaleString(),
                uploadedBy: result.uploadedBy ?? '',
                packagePath: result.packagePath ?? '',
                ...result,
            };
            setFromIntex(newDeal);
            setFromRecent(false);
            setUploadState('success');
            publishDeal(result);

            // Show the fetched deal in Recently Ingested right away.
            addRecentOptimistic({
                dealId: `r_${result.dealName}`,
                dealName: result.dealName,
                sourceType: (result.sourceType as 'cdi' | 'zip') ?? 'cdi',
                uploadedAt: result.uploadedAt ?? new Date().toLocaleString(),
                uploadedBy: result.uploadedBy ?? '',
                packagePath: result.packagePath ?? '',
                sessionId: result.sessionId,
            });
            // Background refresh so the list reconciles with the server.
            baseWidgetExecute?.();
        } catch (err: any) {
            setUploadState('error');
            setErrorMsg(err?.message ?? 'Download failed — check network and try again');
            setProgress(0);
        }
    };

    const handleUpload = useCallback(
        async (file: File) => {
            const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
            if (!['.cdi', '.zip'].includes(ext)) return;
            setFileName(file.name);
            setUploadState('uploading');
            setProgress(20);
            setErrorMsg('');
            try {
                const fileBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = () => reject(new Error('File read failed'));
                    reader.readAsDataURL(file);
                });
                setProgress(60);
                const out = await executeWidget({
                    widgetDefinitionId: widgetDefId,
                    params: { action: 'upload', fileName: file.name, fileBase64 },
                    context: {},
                    mode: isDesigner ? 'MOCK' : 'LIVE',
                });
                setProgress(100);
                const deal = out?.result as any;
                if (!deal?.dealName)
                    throw new Error('Upload succeeded but no deal metadata returned');
                const newDeal: RecentDeal = {
                    dealId: `r_${deal.dealName}`,
                    dealName: deal.dealName,
                    sourceType: ext === '.zip' ? ('zip' as const) : ('cdi' as const),
                    uploadedAt: deal.uploadedAt ?? new Date().toLocaleString(),
                    uploadedBy: deal.uploadedBy ?? '',
                    packagePath: deal.packagePath ?? '',
                    sessionId: deal.sessionId,
                };
                setLoadedDeal(newDeal);
                setFromRecent(false);
                setUploadState('success');
                publishDeal(deal);

                // Show the uploaded deal in Recently Ingested right away…
                addRecentOptimistic(newDeal);
                // …then refresh from the server so the canonical list syncs.
                baseWidgetExecute?.();
            } catch (err: any) {
                setUploadState('error');
                setErrorMsg(err?.message ?? 'Upload failed — check network and try again');
                setProgress(0);
            }
        },
        [widgetDefId, isDesigner, addRecentOptimistic, baseWidgetExecute]
    );

    const handleDownload = async (dealName: string) => {
        if (!dealName) return;
        const { result } = await executeWidget({
            widgetDefinitionId: widgetDefId,
            params: { action: 'download', dealName },
            context: {},
            mode: isDesigner ? 'MOCK' : 'LIVE',
        });
        const byteCharacters = atob(result.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++)
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
            type: result.contentType || 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleFileDelete = async (dealName: string) => {
        await executeWidget({
            widgetDefinitionId: widgetDefId,
            params: { action: 'remove', dealName },
            context: {},
            mode: isDesigner ? 'MOCK' : 'LIVE',
        });
        setDeletedDeals((prev) => [...prev, dealName]);
        // Also drop it from the optimistic list if it was just added.
        setAddedDeals((prev) => prev.filter((d) => d.dealName !== dealName));
    };

    const reset = () => {
        setUploadState('idle');
        setFileName('');
        setProgress(0);
        setLoadedDeal(null);
        setFromRecent(false);
        setFromIntex(null);
        setErrorMsg('');
        [DEAL_NAME_KEY, ANALYSIS_SESSION_ID_KEY].forEach((key) =>
            setWidgetValueToChannel({ channelId, key, activeTab, value: null })
        );
        baseWidgetExecute?.();
    };

    const plan = planCDIUpload(cols, heightPx);

    // ── Left pane: title always, then state-driven body ──
    const title = (
        <div className={styles.title}>
            <BankOutlined className={styles.titleIcon} />
            <span className={styles.titleText}>CDI Extraction</span>
        </div>
    );

    let leftBody: React.ReactNode;
    if (uploadState === 'uploading') {
        leftBody = <Uploading progress={progress} fileName={fileName} />;
    } else if (uploadState === 'success') {
        leftBody = (
            <StateRow
                kind="success"
                rich={plan.richState}
                title="Package ingested"
                detail={fromIntex?.dealName ?? loadedDeal?.dealName ?? ''}
                onAction={reset}
            />
        );
    } else if (uploadState === 'error') {
        leftBody = (
            <StateRow
                kind="error"
                rich={plan.richState}
                title="Upload failed"
                detail={errorMsg}
                onAction={reset}
            />
        );
    } else {
        // idle
        leftBody = (
            <>
                <ActionRow
                    showUploadBtn={plan.showUploadBtn}
                    onUpload={handleUpload}
                    onFetch={handleFetch}
                />
                {plan.dropzone && <Dropzone heightPx={heightPx} onUpload={handleUpload} />}
            </>
        );
    }

    const leftPane = (
        <div className={styles.left}>
            {title}
            {leftBody}
        </div>
    );

    const recentEl = (lanes: 'two' | 'one' | 'multi') => (
        <RecetlyIngested
            lanes={lanes}
            handelDownload={handleDownload}
            fromIntex={fromIntex}
            uploadState={uploadState}
            loadedDeal={loadedDeal}
            recentDeals={recentDeals}
            onFileDelete={handleFileDelete}
            fileName={fileName}
            progress={progress}
            fromRecent={fromRecent}
            errorMsg={errorMsg}
            setLoadedDeal={setLoadedDeal}
            setFromRecent={setFromRecent}
            reset={reset}
            publishDeal={publishDeal}
            config={widgetInstance.config}
        />
    );

    return (
        <WidgetCardShell overflow="hidden">
            <div
                ref={ref}
                className={clsx(styles.root, {
                    [styles.wealth]: isWealthTheme,
                    [styles.wealthLight]: isWealthLight,
                    [styles.wealthDark]: isWealthDark,
                })}
            >
                {plan.split ? (
                    <div className={styles.twoPane}>
                        <div className={styles.leftHalf}>{leftPane}</div>
                        <div className={styles.recentPane}>{recentEl(plan.recentLanes)}</div>
                    </div>
                ) : (
                    <div className={styles.single}>
                        {leftPane}
                        {plan.recentBelow && (
                            <div className={styles.recentBelow}>{recentEl('two')}</div>
                        )}
                    </div>
                )}
            </div>
        </WidgetCardShell>
    );
}
