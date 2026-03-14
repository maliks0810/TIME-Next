import { Card } from 'antd';
import { convertDateToPST } from '../../lib/helpers';
import { NoteType } from '../../lib/types';

export const NoteAudit = ({ note }: { note: NoteType | null }) => {
    return (
        <div>
            <h4>Note Audit</h4>
            <div style={{ padding: 4 }} key={note?.reviewNoteId}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ wordWrap: 'break-word', maxWidth: 700 }}>
                                Note: {note?.noteText}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: 12 }}>{note?.noteType}</div>
                        </div>

                        <div>
                            <div>Updated By: {note?.lastModifiedBy}</div>
                            <div>Updated AT: {convertDateToPST(note?.lastModifiedDate)}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
