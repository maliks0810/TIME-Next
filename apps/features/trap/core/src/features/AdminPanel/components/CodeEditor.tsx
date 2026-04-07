/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from 'antd';
import styles from '../styles.module.scss';
import { defaultEditorOptions } from '../lib/constants';

type CodeEditorProps = {
    readOnly?: boolean;
    height?: string;
    onAdd?: (data: any) => void;
    onUpdate?: (data: any, patchId: string) => void;
    editorOptions?: any;
    path: string;
};

export const CodeEditor = ({
    readOnly,
    height = '400px',
    onAdd,
    onUpdate,
    editorOptions,
    path,
}: CodeEditorProps) => {
    const editorRef = useRef<any>(null);
    const modelPath = `inmemory://${path}.json`;

    const handleMount = useCallback((editor: any) => {
        editorRef.current = editor;
    }, []);

    const getValue = useCallback(() => JSON.parse(editorRef.current?.getValue()) ?? '', []);

    const handleAdd = useCallback(() => {
        const value = getValue();

        if (onAdd) {
            onAdd(value);
        } else {
            console.warn(` Action: Add`, value);
        }
    }, [getValue, onAdd]);

    const handleUpdate = useCallback(() => {
        const value = getValue();

        if (onUpdate) {
            onUpdate(value, value.id);
        } else {
            console.warn(` Action: Update`, value);
        }
    }, [getValue, onAdd]);

    return (
        <div>
            <Editor
                height={height}
                language="json"
                theme="vs-light"
                onMount={handleMount}
                className={styles.editorHighlight}
                path={modelPath}
                options={{
                    ...defaultEditorOptions,
                    ...editorOptions,
                }}
            />
            {!readOnly ? (
                <div style={{ display: 'flex', justifyContent: 'end', gap: 8 }}>
                    <Button onClick={handleAdd}> Add</Button>
                    <Button onClick={handleUpdate}> Update</Button>
                </div>
            ) : null}
        </div>
    );
};
