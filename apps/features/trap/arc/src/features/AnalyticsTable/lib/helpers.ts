import { RowDataType } from './types';

export const getValueToPublish = (row: RowDataType) => {
    switch (true) {
        case row?.override && String(row.override).trim() !== '':
            return row.override;
        case row?.anser && String(row.anser).trim() !== '':
            return row.anser;
        default:
            return '';
    }
};
