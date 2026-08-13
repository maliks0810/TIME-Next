import StarterKit from "@tiptap/starter-kit";
import {
    MenuButtonBold,
    MenuButtonBulletedList,
    MenuButtonItalic,
    MenuButtonOrderedList,
    MenuButtonRedo,
    MenuButtonUnderline,
    MenuButtonUndo,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditor,
    RichTextEditorRef,
    MenuButtonTextColor,
    MenuSelectTextAlign
} from "mui-tiptap";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/core";




import { useEffect, useRef } from "react";

interface AppRichTextEditorProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function AppRichTextEditor({
    value,
    onChange,
    disabled,
}: AppRichTextEditorProps) {
    const rteRef = useRef<RichTextEditorRef>(null);

    // Sync RHF -> Editor
    useEffect(() => {
        const editor = rteRef.current?.editor;

        if (!editor) return;

        const currentHtml = editor.getHTML();

        if ((value ?? "") !== currentHtml) {
            editor.commands.setContent(value ?? "");
        }
    }, [value]);
    const handleUpdate = (event: { editor: Editor }) => {
        onChange(event.editor.getHTML());
    };

    return (
        <RichTextEditor
            ref={rteRef}
            editable={!disabled}
            extensions={[
                StarterKit,
                Underline,
                TextStyle,
                Color

            ]}
            content={value ?? ""}
            onUpdate={handleUpdate}
            renderControls={() => (
                <MenuControlsContainer>
                    <MenuSelectHeading />
                    <MenuDivider />

                    <MenuButtonBold />
                    <MenuButtonItalic />
                    <MenuButtonUnderline />

                    <MenuDivider />

                    <MenuButtonBulletedList />
                    <MenuButtonOrderedList />

                    <MenuDivider />

                    <MenuSelectTextAlign />
                    <MenuButtonTextColor />

                    <MenuDivider />

                    <MenuButtonUndo />
                    <MenuButtonRedo />
                </MenuControlsContainer>
            )}
        />
    );
}