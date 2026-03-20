import React from 'react';
import { Button, Input, Space, Typography, message } from 'antd';

import type { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';

export default function IdentityWidget(props: WidgetComponentProps) {
    const [cusip, setCusip] = React.useState(
        String(props.contextSnapshot?.['security.cusip'] ?? '')
    );

    React.useEffect(() => {
        setCusip(String(props.contextSnapshot?.['security.cusip'] ?? ''));
    }, [props.contextSnapshot]);

    const publishCusip = () => {
        const value = cusip.trim();
        if (!value) {
            message.error('Enter a CUSIP');
            return;
        }

        props.onPublishContext?.('security.cusip', value, props.widgetInstance?.id);
        message.success('CUSIP published to context');
    };

    return (
        <WidgetCardShell>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text type="secondary">Emits context.security.cusip</Typography.Text>

                <Input
                    value={cusip}
                    placeholder="CUSIP"
                    onChange={(e) => setCusip(e.target.value)}
                    onPressEnter={publishCusip}
                />

                <Button type="primary" onClick={publishCusip}>
                    Publish CUSIP
                </Button>
            </Space>
        </WidgetCardShell>
    );
}
