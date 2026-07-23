import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message, Modal, Input } from 'antd';
import { rejectAsset } from '../../UtilityBar/lib/services';

export const RejectAssetModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
    assetAnalyticsSetupId?: number | null | undefined;
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const handleResetForm = () => {
        setNotes('');
    };

    const handleOk = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const assetId = searchParams.get('assetId');
            const assetAnalyticsSetupId = assetId ? +assetId : -1;
            await rejectAsset({
                assetAnalyticsSetupId,
                noteText: notes ? notes : '',
            });

            messageApi.success('Asset Rejected successfully.');
            onClose();
            setSearchParams('');
            handleResetForm();
        } catch (e) {
            console.log(e);
            messageApi.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (loading) return;
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
                title="Are you sure you want to Reject the asset? This cannot be undone."
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isOpen}
                onOk={handleOk}
                okText={'Reject'}
                onCancel={handleCancel}
                okButtonProps={{ disabled: okDisabled || loading, loading }}
            >
                <Input.TextArea
                    style={{ width: '95%', height: '200px' }}
                    value={notes}
                    onChange={handleChange}
                    placeholder="Please Provide a reason here to Reject."
                    disabled={loading}
                />
            </Modal>
        </>
    );
};