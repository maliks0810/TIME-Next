import { useEditor, EditorContent } from '@tiptap/react';

import Mention from '@tiptap/extension-mention';
import StarterKit from '@tiptap/starter-kit';
import styles from './TextEditor.module.scss';

import suggestion from './Suggestion';
export const TextEditor = ({
    initial,
    mentionOptions,
    onChange,
}: {
    onChange: (key: string) => void;
    initial: string;
    mentionOptions: string[];
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Mention.configure({
                HTMLAttributes: {
                    class: 'variable',
                },
                suggestions: [{ ...suggestion, char: '#', items: () => mentionOptions }],
            }),
        ],
        onUpdate: (e) => onChange(e.editor.getHTML()),
        content: initial,
    });

    return (
        <div className={styles.container}>
            <EditorContent editor={editor} className={styles.editor} />
        </div>
    );
};

export default TextEditor;
