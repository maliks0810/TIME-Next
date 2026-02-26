/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { Alert } from 'antd';

import { AnalyticsForm } from './components/AnalyticsForm';

import { NewAsset, NewAssetAnalytics, NoteType } from '../../lib/types';
import { getAnalyticsById } from '../../lib/services';

function normalizeApiResponse(src: NewAssetAnalytics): NewAssetAnalytics {
    return {
        analyticsOverrideId: Number(src.analyticsOverrideId),
        assetAnalyticsSetupId: Number(src.assetAnalyticsSetupId),
        aladdinId: String(src.aladdinId ?? ''),
        newRequestId: String(src.newRequestId ?? ''),
        krdBenchCusip: String(src.krdBenchCusip ?? ''),

        riskDate: String(src.riskDate ?? ''),
        krdDate: String(src.krdDate ?? ''),
        assetIdType: String(src.assetIdType ?? ''),
        currency: String(src.currency ?? ''),
        curveType: String(src.curveType ?? ''),
        krdSource: String(src.krdSource ?? ''),

        // Nullable numerics — DO NOT default to 0
        oad: src.oad,
        modDur: src.modDur,
        modDurToWorst: src.modDurToWorst,
        oac: src.oac,
        oas: src.oas,
        oas1: src.oas1,
        price: src.price,
        spdDur: src.spdDur,
        spreadToWorst: src.spreadToWorst,
        wal: src.wal,
        walToWorst: src.walToWorst,
        yieldToMaturity: src.yieldToMaturity,
        yieldToWorst: src.yieldToWorst,
        zvWal: src.zvWal,
        zvYield: src.zvYield,

        fileProcessingStatus: String(src.fileProcessingStatus ?? ''),
        lastAttemptDate: String(src.lastAttemptDate ?? ''),
        brsFileName: String(src.brsFileName ?? ''),
        createdBy: String(src.createdBy ?? ''),
        createdDate: String(src.createdDate ?? ''),
        lastModifiedBy: String(src.lastModifiedBy ?? ''),
        lastModifiedDate: String(src.lastModifiedDate ?? ''),
        status: String(src.status ?? ''),
        retryCount: src.retryCount,

        krd3M: src.krd3M,
        krd1Y: src.krd1Y,
        krd2Y: src.krd2Y,
        krd3Y: src.krd3Y,
        krd5Y: src.krd5Y,
        krd7Y: src.krd7Y,
        krd10Y: src.krd10Y,
        krd15Y: src.krd15Y,
        krd20Y: src.krd20Y,
        krd25Y: src.krd25Y,
        krd30Y: src.krd30Y,
        krd40Y: src.krd40Y,
        krd50Y: src.krd50Y,

        staticYield: src.staticYield,
        modelOad: src.modelOad,
        modelOac: src.modelOac,
        volDur: src.volDur,
        assetId: src.assetId,
        claimedBy: src.claimedBy,
        claimedAt: src.claimedAt,
        oav: src.oav,
        inflDuration: src.inflDuration,
        realDuration: src.realDuration,
        sprdOffWal: src.sprdOffWal,
        volatility: src.volatility,
        volConv: src.volConv,
        realYield: src.realYield,
        rorCbe: src.rorCbe,
    };
}

export function Analytics({ selectedRow }: { selectedRow: NewAsset | null }) {
    const [analyticsData, setAnalyticsData] = useState<NewAssetAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [latestNote, setLatestNote] = useState<NoteType | null>(null);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const { data } = await getAnalyticsById(selectedRow?.assetAnalyticsSetupId as number);
            if (!data.response) {
                setErrorMsg('Analytics have not been produced yet');
            } else {
                setAnalyticsData(normalizeApiResponse(data?.response as NewAssetAnalytics));
                setLatestNote(data.notes.response[0]);
            }
        } catch (err: any) {
            setErrorMsg(err?.response.data || err?.message || 'Failed to load analytics.');
            setAnalyticsData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedRow) {
            fetchAnalytics();
        }
        else {
            setAnalyticsData(null);
        }
    }, [selectedRow]);

    return (
        <div className="AnalyticsContainer">
            {errorMsg && <Alert message={errorMsg} type="info" />}
            {!errorMsg && (
                <div className="AnalyticsInfo">
                    {isLoading ? (
                        'Loading...'
                    ) : (
                        <AnalyticsForm
                            asset={analyticsData}
                            selectedRow={selectedRow}
                            latestNote={latestNote}
                            onRefresh={fetchAnalytics}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
