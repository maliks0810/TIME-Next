/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Tag } from 'antd';

import { STATUSES_ENUM } from '../../../../../arc/src/shared/constants';

const colorMapping = {
    [STATUSES_ENUM.INPUT_PENDING_REVIEW.toUpperCase()]: 'magenta',
    [STATUSES_ENUM.INPUT_SENT_TO_ALADDIN.toUpperCase()]: 'green',
    [STATUSES_ENUM.CALCUALTION_IN_PROGRESS.toUpperCase()]: 'gold',
    [STATUSES_ENUM.ANALYTICS_PENDING_REVIEW.toUpperCase()]: 'cyan',
    [STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN.toUpperCase()]: 'blue',
    [STATUSES_ENUM.ANALYTICS_VERIFIED_IN_ALADDIN.toUpperCase()]: 'purple',
    [STATUSES_ENUM.ABANDONED.toUpperCase()]: 'red',
    [STATUSES_ENUM.INVALID_REQUEST.toUpperCase()]: 'volcano',
    MANUAL: 'lime',
    'ANALYTICS REQUESTED': 'geekblue',
};

export const statusCustomCellRenderer = ({ data }: { data: any }) => (
    <Tag color={colorMapping[data.status]}>{data.status}</Tag>
);
