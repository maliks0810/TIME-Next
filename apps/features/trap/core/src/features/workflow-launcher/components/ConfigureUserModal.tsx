import { Modal, Input } from 'antd';
import React from 'react';
export const ConfigureUserModal = ({
    open,
    onOk,
    onCancel,
}: {
    open: boolean;
    onOk: (value: string) => void;
    onCancel: () => void;
}) => {
    const [value, setValue] = React.useState<string>('');
    const handleCancel = () => {
        setValue('');
        onCancel();
    };
    const handleOk = () => {
        if (!value) return;
        onOk(value);
    };
    return (
        <Modal
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okButtonProps={{ disabled: !value }}
            title={'Configure user'}
        >
            <Input
                placeholder="Input user ad_samaccountname"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            ></Input>
        </Modal>
    );
};
