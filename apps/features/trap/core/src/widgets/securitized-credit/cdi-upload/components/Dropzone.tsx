import React, { useRef, useState } from 'react';
import { CloudUploadOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import styles from './Dropzone.module.scss';

type Props = {
    heightPx: number;      // widget height — drives text adaptation
    onUpload: (file: File) => void;
};

export const Dropzone = ({ heightPx, onUpload }: Props) => {
    const { token } = theme.useToken();
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    // Dropzone gets roughly (usable − title − actionRow − gaps). Squashed → minimal text.
    const dzSlice = heightPx - 24 - 20 - 40 - 20;
    const squashed = dzSlice < 90;

    const pick = (files: FileList | null) => {
        const f = files?.[0];
        if (f) onUpload(f);
    };

    return (
        <>
            <input
                ref={fileRef}
                type="file"
                accept=".cdi,.zip"
                style={{ display: 'none' }}
                onChange={(e) => pick(e.target.files)}
            />
            <div
                className={styles.drop}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files); }}
                style={{
                    borderColor: dragOver ? token.colorPrimary : token.colorBorderSecondary,
                    background: dragOver ? token.colorPrimaryBg : token.colorFillAlter,
                }}
            >
                <CloudUploadOutlined
                    style={{
                        fontSize: squashed ? 20 : 28,
                        color: dragOver ? token.colorPrimary : token.colorTextQuaternary,
                        transition: 'color .15s',
                    }}
                />
                {squashed ? (
                    // Even squashed, the dropzone only shows at ≥200px — always name
                    // the format. Just drop the secondary helper line when tight.
                    <span className={styles.title}>Drop CDI or ZIP here</span>
                ) : (
                    <div className={styles.text}>
                        <span className={styles.title}>Drop CDI or ZIP here</span>
                        <span className={styles.sub}>or click to browse · .cdi · .zip</span>
                    </div>
                )}
            </div>
        </>
    );
};