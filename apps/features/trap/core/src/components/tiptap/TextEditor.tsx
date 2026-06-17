import { useEditor, EditorContent, Extensions } from '@tiptap/react';

import Mention from '@tiptap/extension-mention';
import StarterKit from '@tiptap/starter-kit';
import styles from './TextEditor.module.scss';

import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Color, TextStyle, BackgroundColor, FontSize } from '@tiptap/extension-text-style';
import suggestion from './Suggestion';
import { Ref, useImperativeHandle } from 'react';
import { MenuBar } from './MenuBar';
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
    const extensions: Extensions = [
        StarterKit,
        Document,
        Paragraph,
        Text,
        TextStyle,
        Color,
        BackgroundColor,
        FontSize,
    ];

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
            <MenuBar editor={editor} />
            <div
                className={styles.editoContainer}
                onClick={() => {
                    editor.chain().focus();
                }}
            >
                <EditorContent editor={editor} className={`${className} ${styles.editor}`} />
            </div>
        </div>
    );
};

export default TextEditor;
