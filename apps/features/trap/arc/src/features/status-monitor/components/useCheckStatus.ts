import { useState, useCallback, useEffect } from 'react';
// import { NotificationPlacement } from 'antd/es/notification/interface';
import { notification } from 'antd';
import { Deal, NIStatusData } from '../../../lib/types';
import { fetchStatus } from '../../../lib/services';

const downloadFileUrl = import.meta.env.VITE_PRISM_URL + '/api/v1/document/download-file/session/';
// const REFETCH_INTERVAL = 20000; //ms

export const useCheckStatus = () => {
    const [activeKey, setActiveKey] = useState<string>('processing');
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [timeline, setTimeline] = useState<Deal['details']>([]);
    const [api, contextHolder] = notification.useNotification();
    const [trackingId, setTrackingId] = useState<Deal['trackingId']>();

    const openNotification = useCallback(() => {
        api.info({
            message: 'Status updated',
            placement: 'top',
        });
    }, [api]);

    const closeTimeline = () => {
        setTimeline([]);
        setIsTimelineOpen(false);
        setTrackingId(undefined);
    };

    const [niStatusData, setNIStatusData] = useState<NIStatusData>({
        processing: [],
        completed: [],
        failed: [],
    });

    const handleKeyChange = (key: string[]) => {
        setActiveKey(key.pop() as string);
    };

    const reduceApiData = (acc: NIStatusData, cur: Deal) => {
        if (cur.status === 'Processing') {
            return { ...acc, processing: [...acc.processing, cur] };
        }
        if (cur.status === 'Completed') {
            return { ...acc, completed: [...acc.completed, cur] };
        }

        if (cur.status === 'Failed') {
            return { ...acc, failed: [...acc.failed, cur] };
        }
        return acc;
    };

    const fetchAndSetStatusData = useCallback(async () => {
        const { data } = await fetchStatus();

        const { results } = data;

        const reducedData = results.reduce(reduceApiData, {
            processing: [],
            completed: [],
            failed: [],
        } as NIStatusData);
        setNIStatusData(reducedData);

        // openNotification();
    }, [openNotification]);

    const openTimeline = (trackingId: Deal['trackingId'], details: Deal['details']) => {
        setIsTimelineOpen(true);
        setTimeline(details);
        setTrackingId(trackingId);
    };

    useEffect(() => {
        fetchAndSetStatusData();

        // const refetch = setInterval(() => {
        //     fetchAndSetStatusData();
        // }, REFETCH_INTERVAL);

        // return () => {
        //     clearInterval(refetch);
        // };
    }, [fetchAndSetStatusData]);

    const onHandleDownload = async () => {
        try {
            const response = await fetch(
                downloadFileUrl + `${trackingId}`,
                // 'https://localhost:44336/api/v1/document/download-file/session/BDEF7991-21E7-4215-A884-B411EF8A87FE',
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;

            // Try to extract filename from headers
            const disposition = response.headers.get('content-disposition');
            let fileName = 'downloaded-file';

            if (disposition && disposition.includes('filename=')) {
                fileName = disposition.split('filename=')[1].replace(/"/g, '');
            }

            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return {
        activeKey,
        handleKeyChange,
        niStatusData,
        openTimeline,
        timeline,
        timelineOpen: isTimelineOpen,
        closeTimeline,
        contextHolder,
        onHandleDownload,
    };
};
