import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';

import styles from './UploaderComponent.module.scss';

type UploaderProps = {
    onUpload: (file: File) => void;
    accept: string;
    onRemoveFile?: () => void;
    showUploadList?: boolean;
    isRemoveFileAllowed?: boolean;
};

const { Dragger } = Upload;

export const Uploader = ({
    onUpload,
    accept,
    onRemoveFile = () => { },
    showUploadList = true,
    isRemoveFileAllowed = true,
}: UploaderProps) => {
    const [messageApi, contextHolder] = message.useMessage();

    const props: UploadProps = {
        name: 'file',
        accept: accept,
        maxCount:1,
        showUploadList: showUploadList ? { showRemoveIcon: isRemoveFileAllowed } : false,
        onRemove(){
            if (isRemoveFileAllowed) {
                onRemoveFile();
            }
        },
        beforeUpload(file) {
            const isValidFormat = file.name.endsWith(accept);
            if (!isValidFormat) {
                messageApi.error(`File format is not supported. Please upload ${accept} format file only!`);
                return false;
            }
            onUpload(file);
            return false;
        },
    };

    return (
        <>
            {contextHolder}
            <Dragger {...props}>
                <InboxOutlined className={styles.uploadIcon} />
                <div className={styles.uploadHelpText}>
                    <p className={styles.title}>
                        Drop a {accept} file here
                    </p>
                    <p className={styles.sub}>
                        or click to browse a {accept} file
                    </p>
                </div>
            </Dragger>
        </>
    );
};
