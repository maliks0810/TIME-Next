import { useEditor, EditorContent, Extensions } from '@tiptap/react';

import Mention from '@tiptap/extension-mention';
import StarterKit from '@tiptap/starter-kit';
import styles from './TextEditor.module.scss';

import suggestion from './Suggestion';
import { Ref, useImperativeHandle } from 'react';
export type EditorCommands = {
    clear: () => void;
};
export type EditorRef = Ref<EditorCommands>;
export const TextEditor = ({
    initial,
    mentionOptions,
    onChange,
    mentionEnabled = false,
    className,
    ref,
}: {
    ref?: EditorRef;
    onChange: (key: string) => void;
    initial: string;
    className?: string;
    mentionOptions?: string[];
    mentionEnabled: boolean;
}) => {
    const extensions: Extensions = [StarterKit];

    if (mentionEnabled) {
        extensions.push(
            Mention.configure({
                HTMLAttributes: {
                    class: 'variable',
                },
                suggestions: [{ ...suggestion, char: '#', items: () => mentionOptions || [] }],
            })
        );
    }
    const editor = useEditor({
        extensions: extensions,
        onUpdate: (e) => onChange(e.editor.getHTML()),
        content: initial,
    });
    useImperativeHandle(ref, () => ({
        clear: () => {
            editor.commands.clearContent();
        },
    }));
    return (
        <div className={styles.container}>
            <EditorContent editor={editor} className={`${className} ${styles.editor}`} />
        </div>
    );
};

export default TextEditor;
