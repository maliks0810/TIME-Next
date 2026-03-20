/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import { Modal, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

export default function JsonInfoModal(props: { title: string; data: any; tooltip?: string }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <Tooltip title={props.tooltip ?? 'View Raw JSON'} placement="left">
                <InfoCircleOutlined
                    style={{ cursor: 'pointer', opacity: 0.65 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                    }}
                />
            </Tooltip>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                title={props.title}
                width={760}
            >
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {JSON.stringify(props.data ?? {}, null, 2)}
                </pre>
            </Modal>
        </>
    );
}
