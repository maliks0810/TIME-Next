import React from 'react';
import { theme, Typography } from 'antd';
const { Text } = Typography;
import { CloudUploadOutlined } from '@ant-design/icons';
import styles from './Dropzone.module.scss';
export const Dropzone = ({ handleUpload }: { handleUpload: (file: File) => void }) => {
    const { token } = theme.useToken();
    const fileRef = React.useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = React.useState(false);

    const handleFiles = (files: FileList | null) => {
        const file = files?.[0];
        if (file) handleUpload(file);
    };

    return (
        <>
            <input
                ref={fileRef}
                type="file"
                accept=".cdi,.zip"
                style={{ display: 'none' }}
                onChange={(e) => handleFiles(e.target.files)}
            />
            <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                }}
                className={styles.input}
                style={{
                    border: `2px dashed ${dragOver ? token.colorPrimary : token.colorBorderSecondary}`,
                    borderRadius: token.borderRadius,
                    background: dragOver ? token.colorPrimaryBg : token.colorFillAlter,
                }}
            >
                <CloudUploadOutlined
                    style={{
                        fontSize: 28,
                        color: dragOver ? token.colorPrimary : token.colorTextQuaternary,
                        transition: 'color 0.15s',
                    }}
                />
                <div className={styles.text}>
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 600,
                            color: token.colorTextSecondary,
                        }}
                    >
                        Drop CDI or ZIP here
                    </Text>
                    <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>
                        or click to browse · .cdi · .zip
                    </Text>
                </div>
            </div>
        </>
    );
};
