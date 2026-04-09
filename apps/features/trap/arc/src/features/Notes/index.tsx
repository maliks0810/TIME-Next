import { useEffect, useState } from 'react';
import { Modal, Space } from 'antd';
import { getNotes } from '../../lib/services';
import { NoteType } from '../../lib/types';
import { convertDateToPST } from '../../lib/helpers';

export function Notes({
    assetAnalyticsSetupId,
    isOpen = false,
    handleClose,
}: {
    assetAnalyticsSetupId: number;
    isOpen: boolean;
    handleClose: (isOpen: boolean) => void;
}) {
    const [notes, setNotes] = useState<NoteType[] | null>(null);

    const fetchNotes = async () => {
        try {
            const { data } = await getNotes(assetAnalyticsSetupId);
            const filteredNotes = (data?.response ?? [])
                .sort((a, b) => {
                    const da = new Date(a.lastModifiedDate).getTime();
                    const db = new Date(b.lastModifiedDate).getTime();
                    return db - da; // newest first
                });
            setNotes(filteredNotes);
        } catch (err) {
            console.warn(err);
            setNotes(null);
        }
    };

    useEffect(() => {
        if (assetAnalyticsSetupId) {
            fetchNotes();
        }
    }, [assetAnalyticsSetupId]);

    return notes?.length && notes?.length > 0 ? (
        <Modal
            width={1000}
            title="Note Audit"
            open={isOpen}
            cancelText="Close"
            onCancel={() => handleClose(false)}
            okButtonProps={{ style: { display: 'none' } }}
        >
            {notes?.map((note, index) => (
                <div
                    style={{ padding: 4, backgroundColor: index % 2 === 0 ? "whitesmoke" : "unset" }}
                    key={note.reviewNoteId + note.anchorId + note.lastModifiedDate}
                >
                    <Space align="start">
                        <div style={{ width: 600 }}>
                            <div style={{ wordWrap: 'break-word' }}>
                                <b>Note:</b> {note.noteText}
                            </div>
                            <div style={{ marginTop: 2, color: '#9ca3af', fontSize: 12 }}>
                                {note.noteType}
                            </div>
                        </div>

                        <div style={{ width: 330, wordBreak: 'break-all' }}>
                            <div><b>Updated By:</b> {note.lastModifiedBy}</div>
                            <div><b>Updated AT:</b> {convertDateToPST(note.lastModifiedDate)}</div>
                        </div>
                    </Space>
                </div>
            ))}
        </Modal>
    ) : null;
}
