import React from 'react';
import { Select, Space, Typography, theme } from 'antd';

import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import type { Template, TemplateVersion } from '../types/landing.types';

type WorkflowTargetWidgetProps = {
    templates: Template[];
    versions: TemplateVersion[];
    targetTemplateId?: string;
    targetTemplateVersionId?: string;
    onChangeTemplate: (value: string) => void;
    onChangeVersion: (value: string) => void;
};

export default function WorkflowTargetWidget(props: WorkflowTargetWidgetProps) {
    const { token } = theme.useToken();

    const templateOptions = props.templates.map((t) => ({
        label: t.name,
        value: t.id,
    }));

    const versionOptions = props.versions.map((v) => ({
        label: `v${v.version} • ${v.status}`,
        value: v.id,
    }));

    return (
        <WidgetCardShell>
            <div
                style={{
                    height: '100%',
                    padding: 16,
                    boxSizing: 'border-box',
                    background: `linear-gradient(180deg, ${token.colorFillAlter} 0%, ${token.colorBgContainer} 100%)`,
                }}
            >
                <Typography.Text strong style={{ color: token.colorText }}>
                    Workflow Target
                </Typography.Text>

                <div style={{ marginTop: 8 }}>
                    <Space wrap size={12}>
                        <Select
                            style={{ width: 320 }}
                            placeholder="Select template"
                            value={props.targetTemplateId}
                            options={templateOptions}
                            onChange={props.onChangeTemplate}
                        />
                        <Select
                            style={{ width: 240 }}
                            placeholder="Select version"
                            value={props.targetTemplateVersionId}
                            options={versionOptions}
                            onChange={props.onChangeVersion}
                        />
                    </Space>
                </div>
            </div>
        </WidgetCardShell>
    );
}
