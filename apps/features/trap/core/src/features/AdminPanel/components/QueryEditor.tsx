/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from 'antd';
import styles from '../styles.module.scss';
import { defaultEditorOptions, defaultQuery } from '../lib/constants';

type CodeEditorProps = {
    onQuery?: (query: string, params: any) => void;
    editorOptions?: any;
    readOnly?: boolean;
};

export const QueryEditor = ({ onQuery, editorOptions, readOnly }: CodeEditorProps) => {
    const sqlEditorRef = useRef<any>(null);
    const jsonEditorRef = useRef<any>(null);

    const handleMountSqlEditor = useCallback((editor: any) => {
        sqlEditorRef.current = editor;
    }, []);

    const handleMountJsonEditor = useCallback((editor: any) => {
        jsonEditorRef.current = editor;
    }, []);

    const getSQLValue = useCallback(() => sqlEditorRef.current?.getValue() ?? '', []);
    const getJSONValue = useCallback(() => jsonEditorRef.current?.getValue() ?? '', []);

    const handleQuery = useCallback(() => {
        const sqlValue = getSQLValue();
        const jsonValue = getJSONValue();

        if (onQuery) {
            onQuery(sqlValue, jsonValue);
        } else {
            console.warn(`Action: Query`, { sqlValue, jsonValue });
        }
    }, [onQuery]);

    return (
        <div>
            <label>SQL</label>
            <Editor
                height="100px"
                language="sql"
                theme="vs-light"
                defaultValue={defaultQuery}
                onMount={handleMountSqlEditor}
                className={styles.editorHighlight}
                path="inmemory://sqlEditor.sql"
                options={{
                    ...defaultEditorOptions,
                    readOnly,
                    ...editorOptions,
                }}
            />

            <label>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                Parameters (JSON array: [{'{'}"name": "@id", "value": "x"{'}'}])
            </label>
            <Editor
                height="100px"
                language="json"
                theme="vs-light"
                onMount={handleMountJsonEditor}
                className={styles.editorHighlight}
                path="inmemory://parametersJson.json"
                options={{
                    ...defaultEditorOptions,
                    readOnly,
                    ...editorOptions,
                }}
            />
            <div style={{ display: 'flex', justifyContent: 'end', gap: 8 }}>
                <Button onClick={handleQuery} disabled={readOnly}>
                    Query
                </Button>
            </div>
        </div>
    );
};
