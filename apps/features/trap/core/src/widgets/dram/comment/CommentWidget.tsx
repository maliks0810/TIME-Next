import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import TextEditor, { EditorCommands } from '../../../components/tiptap/TextEditor';
import { Button, Modal } from 'antd';
import styles from './CommentWidget.module.scss';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUserInfo } from '../../../../../../../../packages/utils/src/hooks/Authentication/user-info-context';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { COMMON_TREE_KEY } from '../../constants';
const EMPTY_EDITOR = `<p></p>`;

export type Note = {
    noteText: string; //html
    entityType: string;
    entityId: string;
    createdBy: string;
};
export const CommentWidget = ({ mode, result, execute, widgetInstance }: WidgetComponentProps) => {
    // Widget context

    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const selectedEntityId = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: COMMON_TREE_KEY,
    });
    const selectedSchemaKey = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: 'schemaKey',
    });
    const selectedNoteType = useMemo(() => {
        switch (selectedSchemaKey) {
            case 'portfolio.gross.history':
                return 'PAGR';
            case 'portfolio.net.history':
                return 'PANET';
            case 'portfolio.benchmark.history':
                return 'PABM';
            default:
                return '';
        }
    }, [selectedSchemaKey]);

    useEffect(() => {
        if (selectedEntityId && selectedNoteType) {
            execute?.(
                {},
                { entityId: selectedEntityId as string, noteType: selectedNoteType as string }
            );
        }
    }, [selectedEntityId, selectedNoteType]);

    // Widget state
    const [notes, setNotes] = useState<Note[]>(() => {
        if (!result) return [];
        if (!result.notes) return [];
        return result.notes as Note[];
    });
    const { name } = useUserInfo();
    const editorRef = useRef<EditorCommands | null>(null);
    const [content, setContent] = useState<string>('');
    const handleChange = (value: string) => {
        setContent(value);
    };

    const handleClear = () => {
        setContent('');

        editorRef.current?.clear();
    };

    const handleSave = () => {
        setContent('');

        editorRef.current?.clear();
        const newComment = {
            noteText: content,
            createdBy: name || 'unknown',
            entityId: selectedEntityId as string,
            entityType: selectedNoteType as string,
        };
        setNotes((prev) => [...prev, newComment]);

        if (mode === 'workflow') {
            execute?.({ ...newComment }, { action: 'save' });
        }
    };

    const areButtonsVisible = content.length > EMPTY_EDITOR.length;

    const history = useMemo(() => {
        if (!notes || notes.length === 0)
            return <div className={styles.note}>No history available</div>;

        return notes.map((el, ind) => (
            <div className={styles.note} key={`note-${ind}`}>
                <b>{el.createdBy}:</b> <div dangerouslySetInnerHTML={{ __html: el.noteText }}></div>
            </div>
        ));
    }, [notes]);

    if (!selectedNoteType || !selectedEntityId) {
        return (
            <WidgetCardShell>
                <div className={styles.error}>To leave notes, please select a portfolio</div>
            </WidgetCardShell>
        );
    }
    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                <TextEditor
                    ref={editorRef}
                    onChange={handleChange}
                    initial={content}
                    mentionEnabled={false}
                    className={styles.editor}
                />
                {areButtonsVisible && (
                    <div className={styles.actions}>
                        <Button size="small" onClick={handleSave}>
                            Save
                        </Button>
                        <Button size="small" color="danger" onClick={handleClear}>
                            Clear
                        </Button>
                    </div>
                )}
                <Modal
                    centered
                    width={'80vh'}
                    open={historyModalOpen}
                    onCancel={() => setHistoryModalOpen(false)}
                    footer={null}
                    title={'Notes history'}
                >
                    <div className={styles.history}>{history}</div>
                </Modal>
                <Button
                    icon={<QuestionCircleOutlined />}
                    onClick={() => setHistoryModalOpen(true)}
                />
            </div>
        </WidgetCardShell>
    );
};
