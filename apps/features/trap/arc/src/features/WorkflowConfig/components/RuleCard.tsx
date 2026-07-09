import { Button, Space, Tooltip } from 'antd';
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { WorkflowRule } from '../lib/types';
import { REVIEW_TYPE_COLORS } from '../lib/constants';

type RuleCardProps = {
    rule: WorkflowRule;
    onEdit: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    disableUp: boolean;
    disableDown: boolean;
};

export const RuleCard = ({
    rule,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
    disableUp,
    disableDown,
}: RuleCardProps) => {
    return (
        <div className="ruleCard">
            <div>
                <div style={{ fontWeight: 700, color: '#888' }}>IF:</div>
                <div style={{ paddingLeft: 12 }}>Callable = {rule.callable}</div>
                <div style={{ paddingLeft: 12 }}>
                    Speed Overrides = {String(rule.speedOverridesExist)}
                </div>
                <div style={{ fontWeight: 700, color: '#888', marginTop: 4 }}>THEN:</div>
                <div style={{ paddingLeft: 12 }}>
                    <span
                        style={{
                            color: REVIEW_TYPE_COLORS[rule.reviewType],
                            fontWeight: 600,
                        }}
                    >
                        {rule.reviewType}
                    </span>
                </div>
            </div>
            <Space direction="vertical" size={4}>
                <Space size={4}>
                    <Tooltip title="Move up">
                        <Button
                            size="small"
                            icon={<ArrowUpOutlined />}
                            onClick={onMoveUp}
                            disabled={disableUp}
                        />
                    </Tooltip>
                    <Tooltip title="Move down">
                        <Button
                            size="small"
                            icon={<ArrowDownOutlined />}
                            onClick={onMoveDown}
                            disabled={disableDown}
                        />
                    </Tooltip>
                </Space>
                <Space size={4}>
                    <Tooltip title="Edit rule">
                        <Button size="small" icon={<EditOutlined />} onClick={onEdit} />
                    </Tooltip>
                    <Tooltip title="Delete rule">
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={onDelete}
                        />
                    </Tooltip>
                </Space>
            </Space>
        </div>
    );
};
