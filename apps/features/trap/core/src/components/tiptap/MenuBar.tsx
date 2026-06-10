import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import styles from './MenuBar.module.scss';
import type { EditorStateSnapshot } from '@tiptap/react';
import clsx from 'clsx';
import { debounce } from 'lodash';
import { InputNumber } from 'antd';
import { useEffect, useState } from 'react';
/**
 * State selector for the MenuBar component.
 * Extracts the relevant editor state for rendering menu buttons.
 */
export function menuBarStateSelector(ctx: EditorStateSnapshot<Editor>) {
    return {
        // Text formatting
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,

        // Block types
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,

        // Lists and blocks
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,

        // History
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,

        // Color
        bgColor: ctx.editor.getAttributes('textStyle').backgroundColor,

        color: ctx.editor.getAttributes('textStyle').color,

        //size
        fontSize: ctx.editor.getAttributes('textStyle').fontSize,
    };
}

export type MenuBarState = ReturnType<typeof menuBarStateSelector>;

export const MenuBar = ({ editor }: { editor: Editor }) => {
    const [fontSize, setFontSize] = useState<number>(14);
    const editorState = useEditorState({
        editor,
        selector: menuBarStateSelector,
    });

    if (!editor) {
        return null;
    }
    const onFontSizeChange = debounce((value) => {
        editor.chain().focus().setFontSize(`${value}px`).run();
    }, 500);
    useEffect(() => onFontSizeChange(fontSize), [fontSize]);

    return (
        <div className="control-group">
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    {' '}
                    Highlight:
                    <input
                        type="color"
                        onInput={(event) =>
                            editor
                                .chain()
                                .focus()
                                .setBackgroundColor(event.currentTarget.value)
                                .run()
                        }
                        value={editorState.bgColor}
                        className={styles.input}
                        data-testid="setBackgroundColor"
                    />
                    Text Color:
                    <input
                        type="color"
                        value={editorState.color}
                        className={styles.input}
                        onInput={(event) =>
                            editor.chain().focus().setColor(event.currentTarget.value).run()
                        }
                        data-testid="setColor"
                    />{' '}
                    Font size:{' '}
                    <InputNumber
                        className={styles.fontSize}
                        type="number"
                        controls={false}
                        onChange={(e) => setFontSize(Number(e))}
                        value={fontSize}
                    />
                </div>
                <div className={styles.group}>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editorState.canBold}
                        className={
                            editorState.isBold
                                ? clsx(styles.button, styles.isActive)
                                : styles.button
                        }
                    >
                        <b>B</b>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editorState.canItalic}
                        className={
                            editorState.isItalic
                                ? clsx(styles.button, styles.isActive)
                                : styles.button
                        }
                    >
                        <i>I</i>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editorState.canStrike}
                        className={
                            editorState.isStrike
                                ? clsx(styles.button, styles.isActive)
                                : styles.button
                        }
                    >
                        <s>S</s>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        disabled={!editorState.canCode}
                        className={
                            editorState.isCode
                                ? clsx(styles.button, styles.isActive)
                                : styles.button
                        }
                    >
                        Code
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={
                            editorState.isBulletList
                                ? clsx(styles.button, styles.isActive)
                                : styles.button
                        }
                    >
                        Bullet list
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={
                            editorState.isOrderedList
                                ? clsx(styles.button, styles.isActive)
                                : styles.button
                        }
                    >
                        Ordered list
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={
                            editorState.isCodeBlock
                                ? clsx(styles.button, styles.isActive)
                                : styles.button
                        }
                    >
                        Code block
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={
                            editorState.isBlockquote
                                ? clsx(styles.button, styles.isActive)
                                : styles.button
                        }
                    >
                        Blockquote
                    </button>
                </div>
            </div>
        </div>
    );
};
