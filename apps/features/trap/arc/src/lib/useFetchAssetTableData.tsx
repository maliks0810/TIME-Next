/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { extractResponseArray, toRows, formatIso } from './helpers';
import * as signalR from '@microsoft/signalr';
import { NewAsset, TableRow } from './types';
import { useRequestUserAttention } from './useRequestUserAttention';

const WS_BASE_URL = import.meta.env.VITE_R2_TRAP_ARC_SERVICE;

const RECEIVE_DATA_METHOD = 'ReceiveData';
const NOTIFY_USER_METHOD = 'NotifyUser';

export const useFetchAssetTableData = (endpoint: string) => {
    const [assetTableData, setAssetTableDate] = useState<TableRow<NewAsset>[]>([]);
    const [latestUpdateTimestamp, setLatestUpdateTimestamp] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { shouldNotify, requestUserAttention } = useRequestUserAttention();
    const shouldNotifyRef = useRef(shouldNotify);

    useEffect(() => {
        shouldNotifyRef.current = shouldNotify;
    }, [shouldNotify]);

    const connectionRef = useRef<signalR.HubConnection>(null);

    useEffect(() => {
        const connect = async () => {
            try {
                const connection = new signalR.HubConnectionBuilder()
                    .withUrl(WS_BASE_URL + endpoint, {
                        skipNegotiation: true,
                        transport: signalR.HttpTransportType.WebSockets,
                    })
                    .withAutomaticReconnect()
                    .build();

                connectionRef.current = connection;

                connection.on(RECEIVE_DATA_METHOD, (data) => {
                    try {
                        const candidates = extractResponseArray(JSON.parse(data).response);

                        const items: NewAsset[] = candidates.map((itemObj: any) => ({
                            assetAnalyticsSetupId: Number(itemObj.assetAnalyticsSetupId ?? 0),
                            newAssetRequestId: String(itemObj.newAssetRequestId ?? ''),
                            aladdinId: String(itemObj.aladdinId ?? ''),
                            price: Number(itemObj.price ?? 0),
                            assetType: String(itemObj.assetType ?? ''),
                            status: String(itemObj.status ?? ''),
                            createdBy: String(itemObj.createdBy ?? ''),
                            createdDate: String(itemObj.createdDate ?? ''),
                            lastModifiedBy: String(itemObj.lastModifiedBy ?? ''),
                            lastModifiedDate: formatIso(String(itemObj.lastModifiedDate ?? '')),
                            cdiCduBlob: String(itemObj.cdiCduBlob ?? ''),
                            payload: String(itemObj.payload ?? ''),
                            claimedBy: String(itemObj.claimedBy ?? ''),
                            claimedAt: formatIso(itemObj.claimedAt),
                            assetClass: String(itemObj.assetClass ?? ''),
                            instrumentType: String(itemObj.instrumentType ?? ''),
                            analysisDate: String(itemObj.analysisDate ?? ''),
                        }));

                        const rows = toRows(items);
                        setAssetTableDate(rows);
                        setLatestUpdateTimestamp(Date.now());
                    } catch (err) {
                        console.warn(err);
                        setErrorMessage('Failed to process data');
                    }
                });

                connection.on(NOTIFY_USER_METHOD, (data) => {
                    if (shouldNotifyRef.current) {
                        requestUserAttention({
                            message: data,
                            url: '/risk/arc',
                        });
                    }
                });

                connection.onreconnecting((err) => {
                    console.warn(err);
                    setErrorMessage('Trying to reconnect ...');
                });

                connection.onreconnected(() => {
                    setErrorMessage(null);
                });

                connection.onclose((event) => {
                    connectionRef.current = null;
                    console.warn('Connection closed', event);
                });

                await connection.start();
                // await connection.invoke('JoinWorkflow', '80');
                setErrorMessage(null);
            } catch (err) {
                console.warn(err);
            }
        };

        // connect on component mount
        connect();

        // cleanup on component unmount
        return () => {
            if (connectionRef.current) {
                connectionRef.current
                    .stop()
                    .then(() => {
                        console.log('Signal R Connection Stopped due to component unmount');
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        };
    }, []); // empty deps to run on mount/dismount only

    return { assetTableData, errorMessage, latestUpdateTimestamp };
};
