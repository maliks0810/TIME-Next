import { useState } from 'react';
import { Button, Empty, List, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { REVIEW_TYPE_OPTIONS } from '../../lib/constants';
import { RuleCard } from '../RuleCard';
import { RuleEditor } from '../RuleEditor';
import { PreviewOutcome } from '../PreviewOutcome';
import { ReviewType, WorkflowConfig, WorkflowRule,WorkflowRuleConfig } from '../../lib/types';

type WorkflowLogicTabProps = {
    draft: WorkflowConfig;
    onRulesChange: (rules: WorkflowRuleConfig) => void;
};

export const WorkflowLogicTab = ({
    draft,
    onRulesChange,
}: WorkflowLogicTabProps) => {
    const [editorOpen, setEditorOpen] = useState(false);
    // null while adding a new rule, otherwise the index of the rule being edited.
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const rulesConfig = draft.workflowRules;

    const openAdd = () => {
        setEditingIndex(null);
        setEditorOpen(true);
    };

    const openEdit = (index: number) => {
        setEditingIndex(index);
        setEditorOpen(true);
    };

    const handleSubmit = (rule: WorkflowRule) => {
        const next =
            editingIndex === null
                ? [...rulesConfig.rules, rule]
                : rulesConfig.rules.map((existing, i) => (i === editingIndex ? rule : existing));
        onRulesChange({
            rules: next,
            defaultRule: rulesConfig.defaultRule
        });
        setEditorOpen(false);
    };

    const handleDelete = (index: number) => {
        onRulesChange({
            rules: rulesConfig.rules.filter((_, i) => i !== index),
            defaultRule: rulesConfig.defaultRule
        });
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= rulesConfig.rules.length) return;
        const next = [...rulesConfig.rules];
        [next[index], next[target]] = [next[target], next[index]];
        onRulesChange(rulesConfig);
    };

    return (
        <div style={{ paddingTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Workflow Rules</strong>
                <Button size="small" icon={<PlusOutlined />} onClick={openAdd}>
                    Add Rule
                </Button>
            </div>

            <div className="ruleCardContainer">
                {rulesConfig.rules.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No rules — the default review type below applies to all assets."
                    />
                ) : (
                    <List
                        dataSource={rulesConfig.rules}
                        renderItem={(rule, index) => (
                            <List.Item style={{ border: 'none', padding: 0 }}>
                                <div style={{ width: '100%' }}>
                                    <RuleCard
                                        rule={rule}
                                        onEdit={() => openEdit(index)}
                                        onDelete={() => handleDelete(index)}
                                        onMoveUp={() => move(index, -1)}
                                        onMoveDown={() => move(index, 1)}
                                        disableUp={index === 0}
                                        disableDown={index === rulesConfig.rules.length - 1}
                                    />
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                <span>
                    <strong>Default (no rule matches):</strong>
                </span>
                <Select
                    style={{ width: 200 }}
                    value={draft.workflowRules.defaultRule}
                    defaultValue={"Full Review"}
                    onChange={(value) => onRulesChange({
                        rules: draft.workflowRules.rules,
                        defaultRule: value as ReviewType
                    })}
                    options={REVIEW_TYPE_OPTIONS}
                />
            </div>

            <PreviewOutcome rules={rulesConfig.rules} defaultReviewType={draft.workflowRules.defaultRule} />

            <RuleEditor
                open={editorOpen}
                initialRule={editingIndex === null ? null : rulesConfig.rules[editingIndex]}
                onSubmit={handleSubmit}
                onCancel={() => setEditorOpen(false)}
            />
        </div>
    );
};
