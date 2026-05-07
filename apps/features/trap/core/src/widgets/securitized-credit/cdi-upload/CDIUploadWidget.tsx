/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { theme } from 'antd';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { useTheme, getThemeSurfaceMeta } from '../../../theme/ThemeContext';
import type { WidgetComponentProps } from '../../../types/widget';
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
    onPublishContext,
    widgetInstance,
    result,
}: WidgetComponentProps) {
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    getThemeSurfaceMeta(themeName); // theme surface available if needed

    const [uploadState, setUploadState] = React.useState<UploadState>('idle');
    const [progress, setProgress] = React.useState(0);
    const [fileName, setFileName] = React.useState('');
    const [fromIntex, setFromIntext] = React.useState<DealFromIntex | null>(null);
    const [errorMsg, setErrorMsg] = React.useState('');
    const [loadedDeal, setLoadedDeal] = React.useState<RecentDeal | null>(null);
    const [fromRecent, setFromRecent] = React.useState(false);

    // Recently ingested deals come from the server via the result prop.
    // ds_sc_cdi_upload_01 executor returns { recentDeals: [...] } on mount.
    const recentDeals: RecentDeal[] = React.useMemo(
        () =>
            result && Array.isArray((result as any).recentDeals)
                ? ((result as any).recentDeals as RecentDeal[])
                : [],
        [result]
    );

    const widgetId = widgetInstance?.id;
    const widgetDefId = widgetInstance?.widgetDefinitionId ?? 'cwd_sc_cdi_file_drop_01';
    const isDesigner = widgetInstance?._mode === 'designer';

    const channelId = widgetInstance?.config?.params?.channel;

    const activeTab = useGetActiveTab();
    const setWidgetValueToChannel = useSetWidgetValue();
    const publishDeal = (deal: { dealId: string; dealName: string; sessionId: string }) => {
        setWidgetValueToChannel({ channelId, key: TRANCHE_ID_KEY, value: null, activeTab });
        setWidgetValueToChannel({ channelId, key: TRANCHE_NAME_KEY, value: null, activeTab });

        setWidgetValueToChannel({ channelId, key: DEAL_ID_KEY, value: deal.dealId, activeTab });
        setWidgetValueToChannel({ channelId, key: DEAL_NAME_KEY, value: deal.dealName, activeTab });
        setWidgetValueToChannel({
            channelId,
            key: ANALYSIS_SESSION_ID_KEY,
            value: deal.sessionId,
            activeTab,
        });
        setWidgetValueToChannel({ channelId, key: IS_ASSET_NEW_KEY, value: true, activeTab });
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

            // const deal = out?.result as any;
            // if (!deal?.dealId) throw new Error('Download succeeded but no deal metadata returned');

            setFromIntext({
                dealName: result.dealName,

                uploadedAt: result.uploadedAt ?? new Date().toLocaleString(),
                uploadedBy: result.uploadedBy ?? '',
                packagePath: result.packagePath ?? '',
                ...result,
            });
            setFromRecent(false);
            setUploadState('success');
            publishDeal(result);
        } catch (err: any) {
            setUploadState('error');
            setErrorMsg(err?.message ?? 'Download failed — check network and try again');
            setProgress(0);
        }
    };

    // And this is the flow:
    //   1. Read file as base64 string via FileReader
    //   2. Call executeWidget with params: { action:"upload", fileName, fileBase64 }
    //   3. ds_sc_cdi_upload_01 live executor decodes, calls PRISM, returns deal metadata
    //   4. Widget publishes deal context keys to ContextBus

    const handleUpload = React.useCallback(
        async (file: File) => {
            const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
            if (!['.cdi', '.zip'].includes(ext)) return;

            setFileName(file.name);
            setUploadState('uploading');
            setProgress(20);
            setErrorMsg('');

            try {
                // Read file as base64
                const fileBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = () => reject(new Error('File read failed'));
                    reader.readAsDataURL(file);
                });

                setProgress(60);

                // Single executeWidget call — agql routes to ds_sc_cdi_upload_01
                const out = await executeWidget({
                    widgetDefinitionId: widgetDefId,
                    params: {
                        action: 'upload',
                        fileName: file.name,
                        fileBase64, // base64-encoded file content (~7 KB for typical CDI)
                    },
                    context: {},
                    mode: isDesigner ? 'MOCK' : 'LIVE',
                });

                setProgress(100);

                const deal = out?.result as any;
                if (!deal?.dealId)
                    throw new Error('Upload succeeded but no deal metadata returned');

                setLoadedDeal({
                    dealId: deal.dealId,
                    dealName: deal.dealName,
                    sourceType: ext === '.zip' ? 'zip' : 'cdi',
                    uploadedAt: deal.uploadedAt ?? new Date().toLocaleString(),
                    uploadedBy: deal.uploadedBy ?? '',
                    packagePath: deal.packagePath ?? '',
                    sessionId: deal.sessionId,
                });
                setFromRecent(false);
                setUploadState('success');
                publishDeal(deal);
            } catch (err: any) {
                setUploadState('error');
                setErrorMsg(err?.message ?? 'Upload failed — check network and try again');
                setProgress(0);
            }
        },
        [widgetDefId, isDesigner, widgetId, onPublishContext]
    );

    const handelDownload = async () => {
        if (fromIntex && fromIntex.dealName) {
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
        }
    };
    const reset = () => {
        setUploadState('idle');
        setFileName('');
        setProgress(0);
        setLoadedDeal(null);
        setFromRecent(false);
        setFromIntext(null);
        setErrorMsg('');
        [
            DEAL_ID_KEY,
            DEAL_NAME_KEY,
            ANALYSIS_SESSION_ID_KEY,
            TRANCHE_ID_KEY,
            TRANCHE_NAME_KEY,
            IS_ASSET_NEW_KEY,
        ].forEach((key) => setWidgetValueToChannel({ channelId, key, activeTab, value: null }));
    };

    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                <div className={styles.left}>
                    {uploadState === 'idle' && (
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
                        handelDownload={handelDownload}
                        fromIntex={fromIntex}
                        uploadState={uploadState}
                        loadedDeal={loadedDeal}
                        recentDeals={recentDeals}
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
