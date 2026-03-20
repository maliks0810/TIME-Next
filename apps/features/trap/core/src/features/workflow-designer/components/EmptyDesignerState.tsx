import React from 'react';
import { Button, Empty } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';

type EmptyDesignerStateProps = {
    hasRoute: boolean;
    hasWidgets: boolean;
    isPublished: boolean;
    onBack: () => void;
    onOpenLibrary: () => void;
};

export default function EmptyDesignerState(props: EmptyDesignerStateProps) {
    if (!props.hasRoute) {
        return (
            <Empty description="No workflow loaded" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button onClick={props.onBack}>Back to TRAP Landing</Button>
            </Empty>
        );
    }

    if (!props.hasWidgets) {
        return (
            <Empty description="No widgets on canvas yet" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button
                    icon={<AppstoreAddOutlined />}
                    type="primary"
                    onClick={props.onOpenLibrary}
                    disabled={props.isPublished}
                >
                    Open Widget Library
                </Button>
            </Empty>
        );
    }

    return null;
}
