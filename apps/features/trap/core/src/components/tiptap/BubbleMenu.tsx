import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import styles from './BubbleMenu.module.scss';
import type { EditorStateSnapshot } from '@tiptap/react';
import clsx from 'clsx';
import { Select } from 'antd';

import { BubbleMenu as TipTapBubbleMenu } from '@tiptap/react/menus';

const FONT_SIZES = [4, 6, 8, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 32, 48, 64];
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
        isUnderline: ctx.editor.isActive('underline') ?? false,
        canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
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

export const BubbleMenu = ({ editor }: { editor: Editor }) => {
    const editorState = useEditorState({
        editor,
        selector: menuBarStateSelector,
    });

    if (!editor) {
        return null;
    }
    const handleInputChange = (value: number | null) => {
        editor.chain().focus().setFontSize(`${value}px`).run();
        editor.commands.focus();
    };
    return (
        <TipTapBubbleMenu editor={editor} className={styles.bubble}>
            <div className="control-group">
                <div className={styles.wrapper}>
                    <div className={styles.group}>
                        <Select
                            className={styles.fontSize}
                            onChange={handleInputChange}
                            value={editor.getAttributes('textStyle').fontSize}
                            options={FONT_SIZES.map((el) => ({ value: el, label: `${el}px` }))}
                        />
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
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            disabled={!editorState.canUnderline}
                            className={clsx(styles.button, {
                                [styles.isActive]: editorState.isUnderline,
                            })}
                        >
                            <u>U</u>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={clsx(styles.button, {
                                [styles.isActive]: editor.isActive('strike'),
                            })}
                        >
                            <s> S</s>
                        </button>
                    </div>
                </div>
            </div>
        </TipTapBubbleMenu>
    );
};
