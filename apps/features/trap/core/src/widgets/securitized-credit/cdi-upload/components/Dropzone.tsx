import { useRef, useState } from 'react';
import type {
    ChangeEvent,
    DragEvent,
    KeyboardEvent,
} from 'react';
import { CloudUploadOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import clsx from 'clsx';

import { useTheme } from '../../../../theme/ThemeContext';
import styles from './Dropzone.module.scss';

type Props = {
    heightPx: number;
    onUpload: (file: File) => void;
};

export const Dropzone = ({
    heightPx,
    onUpload,
}: Props) => {
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    // Approximate the vertical space remaining after the title, action row,
    // and layout gaps. Tight widgets keep the essential format label only.
    const dropzoneSlice = heightPx - 24 - 20 - 40 - 20;
    const squashed = dropzoneSlice < 90;

    const pick = (files: FileList | null) => {
        const file = files?.[0];

        if (file) {
            onUpload(file);
        }
    };

    const openFilePicker = () => {
        fileRef.current?.click();
    };

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        pick(event.target.files);
        event.target.value = '';
    };

    const handleKeyDown = (
        event: KeyboardEvent<HTMLDivElement>,
    ) => {
        if (
            event.key === 'Enter' ||
            event.key === ' '
        ) {
            event.preventDefault();
            openFilePicker();
        }
    };

    const handleDragOver = (
        event: DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (
        event: DragEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();
        setDragOver(false);
        pick(event.dataTransfer.files);
    };

    const idleBorderColor = isWealthLight
        ? 'rgba(120,84,24,0.24)'
        : isWealthDark
          ? 'rgba(230,180,90,0.16)'
          : token.colorBorderSecondary;

    const idleBackground = isWealthLight
        ? 'rgba(120,84,24,0.035)'
        : isWealthDark
          ? 'rgba(230,180,90,0.025)'
          : token.colorFillAlter;

    const activeBackground = isWealthLight
        ? 'rgba(154,107,34,0.10)'
        : isWealthDark
          ? 'rgba(230,180,90,0.10)'
          : token.colorPrimaryBg;

    return (
        <>
            <input
                ref={fileRef}
                type="file"
                accept=".cdi,.zip"
                className={styles.hiddenFileInput}
                onChange={handleFileChange}
            />

            <div
                role="button"
                tabIndex={0}
                aria-label="Upload a CDI or ZIP file"
                className={clsx(styles.drop, {
                    [styles.dragOver]: dragOver,
                    [styles.wealth]: isWealthTheme,
                    [styles.wealthLight]: isWealthLight,
                    [styles.wealthDark]: isWealthDark,
                })}
                onClick={openFilePicker}
                onKeyDown={handleKeyDown}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    borderColor: dragOver
                        ? token.colorPrimary
                        : idleBorderColor,
                    background: dragOver
                        ? activeBackground
                        : idleBackground,
                }}
            >
                <CloudUploadOutlined
                    className={styles.icon}
                    style={{
                        fontSize: squashed ? 20 : 28,
                        color: dragOver
                            ? token.colorPrimary
                            : token.colorTextQuaternary,
                    }}
                />

                {squashed ? (
                    <span className={styles.title}>
                        Drop CDI or ZIP here
                    </span>
                ) : (
                    <div className={styles.text}>
                        <span className={styles.title}>
                            Drop CDI or ZIP here
                        </span>

                        <span className={styles.sub}>
                            or click to browse · .cdi · .zip
                        </span>
                    </div>
                )}
            </div>
        </>
    );
};
