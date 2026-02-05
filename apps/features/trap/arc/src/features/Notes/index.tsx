import { useEffect, useState } from 'react';
import { Card } from 'antd';
import { getNotes } from '../../lib/services';
import { NewAsset, NoteType } from '../../lib/types';
import { convertDateToPST } from '../../lib/helpers';

export function Notes({
    selectedRow,
    noteType,
}: {
    selectedRow: NewAsset | null;
    noteType: string | null;
}) {
    const [notes, setNotes] = useState<NoteType[] | null>(null);

    const fetchNotes = async () => {
        try {
            const { data } = await getNotes(selectedRow?.assetAnalyticsSetupId as number);
            const filteredNotes = (data?.response ?? [])
                .filter((n) => n.noteType === noteType)
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
        if (selectedRow) {
            fetchNotes();
        }
    }, [selectedRow]);

    return notes?.length && notes?.length > 0 ? (
        <div>
            <h4>Note Audit</h4>
            {notes?.map((note) => (
                <div
                    style={{ padding: 4 }}
                    key={note.reviewNoteId + note.anchorId + note.lastModifiedDate}
                >
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ wordWrap: 'break-word', maxWidth: 700 }}>
                                    Note: {note.noteText}
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: 12 }}>
                                    {note.noteType}
                                </div>
                            </div>

                            <div>
                                <div>Updated By: {note.lastModifiedBy}</div>
                                <div>Updated AT: {convertDateToPST(note.lastModifiedDate)}</div>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    ) : null;
}
