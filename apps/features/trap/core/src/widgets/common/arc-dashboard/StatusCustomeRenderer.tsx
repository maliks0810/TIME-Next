/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Tag } from 'antd';

import { STATUSES_ENUM } from '../../../../../arc/src/shared/constants';

const colorMapping = {
    [STATUSES_ENUM.INPUT_PENDING_REVIEW.toUpperCase()]: '#013D7D',
    [STATUSES_ENUM.INPUT_SENT_TO_ALADDIN.toUpperCase()]: '#4B773D',
    [STATUSES_ENUM.CALCUALTION_IN_PROGRESS.toUpperCase()]: '#DB9F00',
    [STATUSES_ENUM.ANALYTICS_PENDING_REVIEW.toUpperCase()]: '#6C1444',
    [STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN.toUpperCase()]: '#654D88',
    [STATUSES_ENUM.ANALYTICS_VERIFIED_IN_ALADDIN.toUpperCase()]: '#2B5876',
    [STATUSES_ENUM.ABANDONED.toUpperCase()]: '#CE1F00',
    [STATUSES_ENUM.INVALID_REQUEST.toUpperCase()]: '#FF637F',
    MANUAL: '#EDE574',
    'ANALYTICS REQUESTED': '#4E4376',
    'ANALYTICS INPUT VERIFIED IN ALADDIN': '#AA076B',
};

export const statusCustomCellRenderer = ({ data }: { data: any }) => (
    <Tag color={colorMapping[data.status]}>{data.status}</Tag>
);
