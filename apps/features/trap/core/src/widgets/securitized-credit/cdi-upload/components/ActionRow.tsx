import { useRef, useState } from 'react';
import type {
    ChangeEvent,
    KeyboardEvent,
} from 'react';
import {
    DownloadOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';

import { useTheme } from '../../../../theme/ThemeContext';
import styles from './ActionRow.module.scss';

type Props = {
    showUploadBtn: boolean;
    onUpload: (file: File) => void;
    onFetch: (args: {
        dealName: string;
        passcode: string;
    }) => void;
};

export const ActionRow = ({
    showUploadBtn,
    onUpload,
    onFetch,
}: Props) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dealName, setDealName] = useState('');
    const [passcode, setPasscode] = useState('');
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';

    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const doFetch = () => {
        const normalizedDealName = dealName.trim();
        const normalizedPasscode = passcode.trim();

        if (!normalizedDealName || !normalizedPasscode) {
            return;
        }

        onFetch({
            dealName: normalizedDealName,
            passcode: normalizedPasscode,
        });
    };

    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            doFetch();
        }
    };

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (file) {
            onUpload(file);
        }

        event.target.value = '';
    };

    return (
        <div
            className={clsx(styles.row, {
                [styles.wealth]: isWealthTheme,
                [styles.wealthLight]: isWealthLight,
                [styles.wealthDark]: isWealthDark,
            })}
        >
            <div className={styles.fetchGroup}>
                <input
                    className={styles.inpDeal}
                    placeholder="Deal name"
                    aria-label="INTEX deal name"
                    autoComplete="off"
                    value={dealName}
                    maxLength={40}
                    onChange={(event) =>
                        setDealName(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                />

                <input
                    className={styles.inpPass}
                    type="password"
                    placeholder="Passcode"
                    aria-label="INTEX passcode"
                    autoComplete="off"
                    value={passcode}
                    onChange={(event) =>
                        setPasscode(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                />

                <button
                    type="button"
                    className={styles.inpBtn}
                    onClick={doFetch}
                    title="Fetch from INTEX"
                    aria-label="Fetch from INTEX"
                >
                    <DownloadOutlined />
                </button>
            </div>

            {showUploadBtn && (
                <>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".cdi,.zip"
                        className={styles.hiddenFileInput}
                        onChange={handleFileChange}
                    />

                    <button
                        type="button"
                        className={styles.upBtn}
                        onClick={() =>
                            fileRef.current?.click()
                        }
                    >
                        <UploadOutlined />
                        <span>Upload</span>
                    </button>
                </>
            )}
        </div>
    );
};
