import { message, Modal, Input } from 'antd';
import { abandonAsset } from '../../../lib/services';
import { useUserInfo } from '@platform/utils';
import { useState } from 'react';


export const AbandonAsset = ({
    isOpen,
    onClose,
    assetAnalyticsSetupId,
    refreshAssetInfo

}: {
    isOpen: boolean;
    onClose: () => void;
    assetAnalyticsSetupId: number | null | undefined;
    refreshAssetInfo: () => void;
}) => {
    const user = useUserInfo();
    const useremail = user.email;
    const [messageApi, contextHolder] = message.useMessage();
    const [notes, setNotes] = useState<string>();


    const handleResetForm = () => {
        setNotes('');
    };

    const handleOk = async () => {
        try {
            await abandonAsset({
                assetAnalyticsSetupId: assetAnalyticsSetupId,
                noteText: notes ? notes : '',
                updatedBy: useremail
            });

            messageApi.success('Asset Abandoned succesfully.');
            refreshAssetInfo();
            onClose();
            handleResetForm();
        } catch (e) {
            console.log(e);
            messageApi.error('An error occured');
        }
    };

    const handleCancel = () => {
        onClose();
        handleResetForm();
    };

    const okDisabled = !(notes?.trim());
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
    };
    return (
        <>
            {contextHolder}
            <Modal
                width="600px"
                height="100px"
                title="Are you sure you want to abandon the asset? This cannot be undone."
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isOpen}
                onOk={handleOk}
                okText={'Abandon'}
                onCancel={handleCancel}
                okButtonProps={{ disabled: okDisabled }}
            >
                <Input.TextArea style={{ width: '95%', height: '200px' }}
                    value={notes}
                    onChange={handleChange}
                    placeholder="Please Provide a reason here to abandon."
                />
            </Modal>
        </>
    );
};
