import { useRef, useState } from 'react';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import styles from './ActionRow.module.scss';

type Props = {
    showUploadBtn: boolean;
    onUpload: (file: File) => void;
    onFetch: (args: { dealName: string; passcode: string }) => void;
};

export const ActionRow = ({ showUploadBtn, onUpload, onFetch }: Props) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dealName, setDealName] = useState('');
    const [passcode, setPasscode] = useState('');

    const doFetch = () => {
        if (dealName && passcode) onFetch({ dealName, passcode });
    };

    return (
        <div className={styles.row}>
            <div className={styles.fetchGroup}>
                <input
                    className={styles.inpDeal}
                    placeholder="Deal name"
                    autoComplete="off"
                    value={dealName}
                    maxLength={40}
                    onChange={(e) => setDealName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doFetch()}
                />
                <input
                    className={styles.inpPass}
                    placeholder="Passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doFetch()}
                />
                <button className={styles.inpBtn} onClick={doFetch} title="Fetch from INTEX">
                    <DownloadOutlined />
                </button>
            </div>

            {showUploadBtn && (
                <>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".cdi,.zip"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onUpload(f);
                        }}
                    />
                    <button className={styles.upBtn} onClick={() => fileRef.current?.click()}>
                        <UploadOutlined /> Upload
                    </button>
                </>
            )}
        </div>
    );
};