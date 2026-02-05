import * as signalR from '@microsoft/signalr';
import { useCallback, useEffect, useRef } from 'react';

// const wsURL = import.meta.env.VITE_PRISM_URL + '/statushub';
const STATUS_UPDATED = 'StatusUpdated';

export const useSignalRConnection = ({
    statusUpdateCallback,
}: {
    statusUpdateCallback: () => void;
}) => {
    const connection = useRef<signalR.HubConnection | null>(null);

    const start = () => {
        if (connection.current) connection.current.start();
    };

    const initConnection = useCallback(() => {
        const connection = new signalR.HubConnectionBuilder().withUrl('/statushub').build();

        connection.on(STATUS_UPDATED, statusUpdateCallback);
        return connection;
    }, [statusUpdateCallback]);

    useEffect(() => {
        connection.current = initConnection();

        return () => {
            connection.current?.off(STATUS_UPDATED);
            connection.current?.stop();
        };
    }, [initConnection]);

    return {
        start,
    };
};
