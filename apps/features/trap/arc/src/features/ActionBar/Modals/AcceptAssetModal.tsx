import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message, Modal, Input } from 'antd';
import { acceptAsset } from '../../UtilityBar/lib/services';

export const AcceptAssetModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
    assetAnalyticsSetupId?: number | null | undefined;
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [notes, setNotes] = useState<string>();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleResetForm = () => {
        setNotes('');
    };

    const handleOk = async () => {
        try {
            const assetId = searchParams.get('assetId');
            const assetAnalyticsSetupId = assetId ? +assetId : -1;
            await acceptAsset({
                assetAnalyticsSetupId,
                noteText: notes ? notes : '',
            });

            messageApi.success('Asset Accepted succesfully.');
            onClose();
            setSearchParams('');
            handleResetForm();
        } catch (e) {
            console.log(e);
            messageApi.error('An error occured');
        }
    };

    const handleCancel = () => {
        onClose();
        setSearchParams('');
        handleResetForm();
    };

    const okDisabled = !notes?.trim();
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
    };
    return (
        <>
            {contextHolder}
            <Modal
                width="600px"
                height="100px"
                title="Are you sure you want to Accept the asset? This cannot be undone."
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isOpen}
                onOk={handleOk}
                okText={'Accept'}
                onCancel={handleCancel}
                okButtonProps={{ disabled: okDisabled }}
            >
                <Input.TextArea
                    style={{ width: '95%', height: '200px' }}
                    value={notes}
                    onChange={handleChange}
                    placeholder="Please Provide a reason here to Accept."
                />
            </Modal>
        </>
    );
};
