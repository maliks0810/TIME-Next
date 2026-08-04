import { Typography, Space } from 'antd';

import WidgetsPanel from './WidgetsPanel';
import { useActiveCanvas } from '../shell/activeCanvas';

export default function WidgetsPanelWrapper() {
    const activeCanvas = useActiveCanvas();

    const drawerPanelRender = () => {
        switch (true) {
            case !activeCanvas?.isDraft:
                return (
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Widgets can only be added to a Draft.
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            Open a draft — or “Edit — create a draft” on a published tab — to add
                            widgets.
                        </Typography.Text>
                    </Space>
                );
            case !!activeCanvas?.widgets?.length:
                return <WidgetsPanel />;
            case !activeCanvas?.widgets?.length:
                return (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        Loading widgets…
                    </Typography.Text>
                );
            default:
                return null;
        }
    };

    return drawerPanelRender();
}
