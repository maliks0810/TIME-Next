import { Form, Input } from 'antd';
import { RowDataType } from './lib/types';

const customeStyles = {
    backgroundColor: '#f5f5f5',
    color: 'rgba(0, 0, 0, 0.88)',
    WebkitTextFillColor: 'rgba(0, 0, 0, 0.88)'
};

export const AnalyticsTableRow = ({ row, index, isOverrideAllowed = true }: { row: RowDataType; index: number; isOverrideAllowed?: boolean }) => {
    const rowClassName = index % 2 === 0 ? 'row-even' : 'row-odd';

    const rowStyle = {
        background: row.override ? '#fffdf0' : row.anser ? '#f8faff' : 'transparent',
    };

    return (
        <tr key={row.key} className={rowClassName} style={rowStyle}>
            <td>
                <span>{row.label}</span>
            </td>
            <td style={customeStyles}>
                <Form.Item name={['rows', row.key, 'anser']} noStyle>
                    <Input size="small" disabled />
                </Form.Item>
            </td>
            <td>
                <Form.Item name={['rows', row.key, 'override']} noStyle>

                    <Input size="small" disabled={isOverrideAllowed ? row.isEditingDisabled : true} />
                </Form.Item>
            </td>
            <td style={customeStyles}>
                <Form.Item name={['rows', row.key, 'valueToPublish']} noStyle>
                    <Input size="small" disabled />
                </Form.Item>
            </td>
        </tr>
    );
};
