/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import WidgetCardShell from '../../../../../components/widget-shell/WidgetCardShell';

import styles from './SimpleGrid.module.scss';
import { WidgetComponentProps } from '../../../../../types/widget';
import { useGetWidgetValueArray } from '../../../../../state/Widgets/hooks';

export const SimpleGrid = ({ widgetInstance, result = {}, execute }: WidgetComponentProps) => {
    const { config = {} } = widgetInstance;
    const { columns = [] as any, rows: dataSource = [] as any } = result;

    const listensToKeys = useMemo(
        () =>
            Array.isArray(config?.params?.listensToKeys)
                ? config?.params?.listensToKeys
                : [config?.params?.listensToKeys],
        [config?.params?.listensToKeys]
    );

    const context = useGetWidgetValueArray({
        channelId: config.params?.channel,
        keys: listensToKeys,
    });

    const subscribedValues = useMemo(
        () =>
            listensToKeys
                ? listensToKeys.reduce(
                      (acc: any, cur: string) => ({ ...acc, [cur]: context?.[cur] || null }),
                      {}
                  )
                : {},
        [context, listensToKeys]
    );

    useEffect(() => {
        if (subscribedValues && listensToKeys) {
            execute?.({ ...subscribedValues }, { ...subscribedValues });
        }
    }, [subscribedValues, listensToKeys]);

    const keyExpr = 'id';
    const renderLabel = (row: any, value: any) => {
        return (
            <span
                className={styles.label}
                style={{
                    fontWeight: row.bold ? 700 : 400,
                    fontStyle: row.italics ? 'italic' : 'normal',
                    paddingLeft: row.indent * 11,
                }}
            >
                {value}
            </span>
        );
    };
    const renderCell = (row: any, col: any) => {
        const value = row[col.dataField];
        const isLabel = col.dataField === 'label';

        const content = col.dataField === 'label' ? renderLabel(row, value) : value;

        const tdStyle = isLabel
            ? {
                  color: row.dim ? 'var(--ant-color-text-secondary)' : 'var(--ant-color-text)',
              }
            : {
                  borderRight: col.sectionEnd ? `1px solid var(--ant-color-border)` : '',
                  fontWeight: row.bold ? 700 : 400,
                  fontStyle: row.italics ? 'italic' : 'normal',
                  color: row.dim ? 'var(--ant-color-text-secondary)' : 'var(--ant-color-text)',
              };

        const bordered = row.bordered && !isLabel;
        return (
            <td
                key={col.dataField}
                style={tdStyle}
                className={clsx(styles.td, {
                    [styles.tdLabel]: isLabel,
                    [styles.bordered]: bordered,
                })}
            >
                {content}
            </td>
        );
    };
    const renderColumns = () =>
        columns.map((col: any) => (
            <th
                key={col.dataField}
                className={col.dataField === 'label' ? styles.thLabel : styles.th}
                style={{
                    width: col.width ?? 'auto',
                    borderRight: col.sectionEnd ? `1px solid var(--ant-color-border)` : '',
                }}
            >
                {col.caption}
            </th>
        ));
    const renderSpacer = (row: any) => (
        <tr key={row[keyExpr]} className={styles.spacer}>
            <td className={styles.tdLabel} />
            <td colSpan={columns.length - 1} />
        </tr>
    );
    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.headerRow}>{renderColumns()}</tr>
                    </thead>

                    <tbody>
                        {dataSource.map((row: any) => {
                            if (row.spacer) {
                                return renderSpacer(row);
                            }
                            return (
                                <tr
                                    key={row[keyExpr]}
                                    className={clsx({
                                        [styles.sectionHeader]: row.sectionHeader,
                                    })}
                                >
                                    {columns.map((col: any) => renderCell(row, col))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </WidgetCardShell>
    );
};
