import React, { useState } from 'react';
import { Input, Space, theme, Typography, Divider } from 'antd';
const { Text } = Typography;
import { CloudUploadOutlined, DownloadOutlined } from '@ant-design/icons';
import styles from './Dropzone.module.scss';
import { WidgetComponentProps } from '../../../../types/widget';
export const Dropzone = ({
    handleUpload,
    execute,
}: {
    handleUpload: (file: File) => void;
    execute: ({ dealName, passcode }: { dealName: string; passcode: string }) => void;
}) => {
    const { token } = theme.useToken();
    const fileRef = React.useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = React.useState(false);

    const [dealName, setDealName] = useState<string>('');
    const [passcode, setPasscode] = useState<string>('');
    const handleFiles = (files: FileList | null) => {
        const file = files?.[0];
        if (file) handleUpload(file);
    };

    const handleExecute = () => {
        if (dealName && passcode) {
            execute?.({ dealName, passcode });
        }
    };
    return (
        <div className={styles.container}>
            <Text
                className={styles.label}
                style={{
                    color: token.colorTextTertiary,
                }}
            >
                Fetch from intext
            </Text>
            <Space.Compact size="middle">
                <Input
                    placeholder="Deal name"
                    style={{ flex: 1 }}
                    value={dealName}
                    onChange={(e) => setDealName(e.target.value)}
                />
                <Input
                    placeholder="Passcode"
                    style={{ flex: 0, minWidth: 120 }}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                />
                <Space.Addon onClick={handleExecute} className={styles.download}>
                    <DownloadOutlined />
                </Space.Addon>
            </Space.Compact>
            <Divider style={{ margin: 2, color: token.colorTextTertiary }}>or</Divider>
            <Text
                className={styles.label}
                style={{
                    color: token.colorTextTertiary,
                }}
            >
                Upload file
            </Text>
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
        </div>
    );
};
