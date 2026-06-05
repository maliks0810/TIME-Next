/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from 'react';
import { theme } from 'antd';
import clsx from 'clsx';

import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { WidgetComponentProps } from '../../../types/widget';
import { executeWidget } from '../../../api/trap';
import { DealFromIntex, RecentDeal, UploadState } from './../types';
import { RecetlyIngested } from './components/RecentlyIngested';
import { ErrorMessage } from './components/ErrorMessage';
import { SuccessMessage } from './components/SuccessMessage';
import { Uploading } from './components/Uploading';
import { Dropzone } from './components/Dropzone';
import styles from './CDIUploadWidget.module.scss';
import {
    ANALYSIS_SESSION_ID_KEY,
    IS_ASSET_NEW_KEY,
    DEAL_ID_KEY,
    DEAL_NAME_KEY,
    TRANCHE_ID_KEY,
    TRANCHE_NAME_KEY,
} from '../../constants';
import { useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';

export default function CDIUploadWidget({
    widgetInstance,
    result,
    widgetDefinition,
    mode,
    execute: baseWidgetExecute,
}: WidgetComponentProps) {
    const { token } = theme.useToken();

    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [fromIntex, setFromIntex] = useState<DealFromIntex | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loadedDeal, setLoadedDeal] = useState<RecentDeal | null>(null);
    const [fromRecent, setFromRecent] = useState(false);
    const [deletedDeals, setDeletedDeals] = useState<string[]>([]);

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

    // Recently ingested deals come from the server via the result prop.
    // ds_sc_cdi_upload_01 executor returns { recentDeals: [...] } on mount.
    const recentDeals = useMemo(() => {
        const executeResult =
            result && Array.isArray((result as any).recentDeals)
                ? ((result as any).recentDeals as RecentDeal[])
                : [];

        if (deletedDeals.length === 0) {
            return executeResult;
        }

        return executeResult.filter((deal) => !deletedDeals.includes(deal.dealName));
    }, [deletedDeals, result]);

    const publishDeal = (deal: { dealId: string; dealName: string; sessionId: string }) => {
        setWidgetValueToChannel({
            channelId,
            key: TRANCHE_ID_KEY,
            value: null,
            activeTab,
        });

        setWidgetValueToChannel({
            channelId,
            key: TRANCHE_NAME_KEY,
            value: null,
            activeTab,
        });

        setWidgetValueToChannel({
            channelId,
            key: DEAL_ID_KEY,
            value: deal.dealId,
            activeTab,
        });

        setWidgetValueToChannel({
            channelId,
            key: DEAL_NAME_KEY,
            value: deal.dealName,
            activeTab,
        });

        setWidgetValueToChannel({
            channelId,
            key: ANALYSIS_SESSION_ID_KEY,
            value: deal.sessionId,
            activeTab,
        });

        setWidgetValueToChannel({
            channelId,
            key: IS_ASSET_NEW_KEY,
            value: 'true',
            activeTab,
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
                params: {
                    action: 'fetch',
                    passcode,
                    dealName,
                },
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
        } catch (err: any) {
            setUploadState('error');
            setErrorMsg(err?.message ?? 'Download failed — check network and try again');
            setProgress(0);
        }
    };

    const handleUpload = useCallback(
        async (file: File) => {
            const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();

            if (!['.cdi', '.zip'].includes(ext)) {
                return;
            }

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
                    params: {
                        action: 'upload',
                        fileName: file.name,
                        fileBase64,
                    },
                    context: {},
                    mode: isDesigner ? 'MOCK' : 'LIVE',
                });

                setProgress(100);

                const deal = out?.result as any;

                if (!deal?.dealName) {
                    throw new Error('Upload succeeded but no deal metadata returned');
                }

                const newDeal = {
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
            } catch (err: any) {
                setUploadState('error');
                setErrorMsg(err?.message ?? 'Upload failed — check network and try again');
                setProgress(0);
            }
        },
        [widgetDefId, isDesigner]
    );

    const handleDownload = async () => {
        if (!fromIntex?.dealName) {
            return;
        }

        const { result } = await executeWidget({
            widgetDefinitionId: widgetDefId,
            params: {
                action: 'download',
                dealName: fromIntex.dealName,
            },
            context: {},
            mode: isDesigner ? 'MOCK' : 'LIVE',
        });

        const blob = new Blob([result.base64]);
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
            params: {
                action: 'remove',
                dealName,
            },
            context: {},
            mode: isDesigner ? 'MOCK' : 'LIVE',
        });

        setDeletedDeals((prev) => [...prev, dealName]);
    };

    const reset = () => {
        setUploadState('idle');
        setFileName('');
        setProgress(0);
        setLoadedDeal(null);
        setFromRecent(false);
        setFromIntex(null);
        setErrorMsg('');

        [
            DEAL_ID_KEY,
            DEAL_NAME_KEY,
            ANALYSIS_SESSION_ID_KEY,
            TRANCHE_ID_KEY,
            TRANCHE_NAME_KEY,
            IS_ASSET_NEW_KEY,
        ].forEach((key) =>
            setWidgetValueToChannel({
                channelId,
                key,
                activeTab,
                value: null,
            })
        );

        baseWidgetExecute?.();
    };

    return (
        <WidgetCardShell>
            <div
                className={clsx(styles.wrapper, {
                    [styles.previewContainer]: mode === 'preview',
                })}
            >
                <div className={styles.left}>
                    {uploadState === 'idle' && !fromRecent && (
                        <Dropzone handleUpload={handleUpload} execute={handleFetch} />
                    )}

                    {uploadState === 'uploading' && <Uploading progress={progress} />}

                    {(uploadState === 'success' || fromRecent) && (
                        <SuccessMessage
                            reset={reset}
                            text={fromIntex ? 'Package loaded' : 'Package ingested'}
                        />
                    )}

                    {uploadState === 'error' && <ErrorMessage errorMsg={errorMsg} reset={reset} />}
                </div>

                <div
                    style={{
                        background: token.colorBorderSecondary,
                    }}
                    className={styles.vertical}
                />

                <div className={styles.right}>
                    <RecetlyIngested
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
                </div>
            </div>
        </WidgetCardShell>
    );
}
