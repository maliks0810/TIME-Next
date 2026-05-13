import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import TextEditor, { EditorCommands, EditorRef } from '../../../components/tiptap/TextEditor';
import { Button, Tooltip } from 'antd';
import styles from './CommentWidget.module.scss';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUserInfo } from '../../../../../../../../packages/utils/src/hooks/Authentication/user-info-context';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { DRAM_ENTITY_ID_KEY, DRAM_NOTE_TYPE_KEY } from '../../constants';
import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';
const EMPTY_EDITOR = `<p></p>`;

export type Note = {
    noteText: string; //html
    entityType: string;
    entityId: string;
    createdBy: string;
};
export const CommentWidget = ({ mode, result, execute, widgetInstance }: WidgetComponentProps) => {
    // Widget context

    const selectedEntityId = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: DRAM_ENTITY_ID_KEY,
    });
    const selectedNoteType = useGetWidgetValue({
        channelId: widgetInstance?.config?.params?.channel,
        key: DRAM_NOTE_TYPE_KEY,
    });
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
        if (!notes || notes.length === 0) return 'No history available';

        return notes.map((el) => (
            <div className={styles.note}>
                <div dangerouslySetInnerHTML={{ __html: el.noteText }}></div>
            </div>
        ));
    }, [notes]);

    if (!selectedEntityId) {
        <WidgetCardShell>
            <WidgetErrorState message={'Entity not selected'} />
        </WidgetCardShell>;
    }
    if (!selectedNoteType) {
        <WidgetCardShell>
            <WidgetErrorState message={'Not type not set'} />
        </WidgetCardShell>;
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
                <Tooltip title={history} placement="bottom" color="#ffffff">
                    <QuestionCircleOutlined />
                </Tooltip>
            </div>
        </WidgetCardShell>
    );
};
