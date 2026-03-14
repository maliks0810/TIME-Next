import { useLayoutEffect } from 'react';
import { FormInstance } from 'antd';
import { KRD_FIELDS, MAIN_GRID_FIELDS } from './lib/constants';
import { AnalyticsTableRow } from './AnalyticsTableRow';
import { getValueToPublish } from './lib/helpers';
import { getAnalyticsById } from './lib/services';
import { NewAssetAnalytics } from './lib/types';
import { STATUSES_ENUM } from '../../shared/constants';
import { normalizeStatus } from '../../lib/helpers';

export const AnalyticsTable = ({
    selectedAssetId,
    selectedStatus,
    form,
    latestUpdateTimestamp,
    isActionInprogress,
}: {
    selectedAssetId?: number | null;
    selectedStatus?: string;
    form: FormInstance;
    latestUpdateTimestamp: number;
    isActionInprogress: boolean;
}) => {
    // BE fetch for Anser data
    useLayoutEffect(() => {
        form.resetFields(['rows']);
        if (selectedAssetId) {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const rows: any = {};

            if (
                selectedStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_PENDING_REVIEW) ||
                selectedStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_SENT_TO_ALADDIN) ||
                selectedStatus === normalizeStatus(STATUSES_ENUM.ANALYTICS_VERIFIED_IN_ALADDIN)
            )
                getAnalyticsById(selectedAssetId)
                    .then(({ data }) => {
                        Object.keys(data.response).forEach((datakey) => {
                            /* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
                            rows[datakey]
                                ? (rows[datakey].anser =
                                      data.response[datakey as keyof NewAssetAnalytics])
                                : (rows[datakey] = {
                                      anser: data.response[datakey as keyof NewAssetAnalytics],
                                  });
                        });
                        form.setFieldValue('noteTextArea', data.notes.response[0].noteText);
                    })
                    .catch((e) => {
                        console.warn('Something went wrong', e);
                    })
                    .finally(() => {
                        Object.keys(rows).forEach((rowName) => {
                            rows[rowName].valueToPublish = getValueToPublish(rows[rowName]);
                        });
                        form.setFieldsValue({ rows });
                    });
        }
    }, [form, selectedAssetId, latestUpdateTimestamp, selectedStatus]);

    return (
        <div>
            <div className="analyticsTableContainer">
                <div style={{ display: 'flex', gap: 16 }}>
                    <div className="custom-table-container">
                        <table
                            className="custom-table"
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                textAlign: 'left',
                                height: 400,
                                overflow: 'auto',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Anser</th>
                                    <th>Override</th>
                                    <th>Value to Publish</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MAIN_GRID_FIELDS.map((row, index) => (
                                    <AnalyticsTableRow
                                        key={`main_grid_field-${row.key}`}
                                        row={row}
                                        index={index}
                                        isOverrideAllowed={!isActionInprogress}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="custom-table-container">
                        <table
                            className="custom-table"
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                textAlign: 'left',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Anser</th>
                                    <th>Override</th>
                                    <th>Value to Publish</th>
                                </tr>
                            </thead>
                            <tbody>
                                {KRD_FIELDS.map((row, index) => (
                                    <AnalyticsTableRow
                                        key={`krd_field-${row.key}`}
                                        row={row}
                                        index={index}
                                        isOverrideAllowed={!isActionInprogress}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
