import { PayloadItem } from "../../lib/types";
import { useState, useEffect } from "react";

type JsonEditorProps = {
    overrides: PayloadItem[];
    onChange: (overrides: PayloadItem[]) => void;
    onError: (message: string) => void;
};

const JsonEditor = ({ overrides, onChange, onError }: JsonEditorProps) => {
    const [text, setText] = useState(() => JSON.stringify(overrides, null, 2));

    useEffect(() => {
        setText(JSON.stringify(overrides, null, 2));
        // Only resync when the underlying overrides change identity (e.g. config switch).
    }, [overrides]);

    const handleBlur = () => {
        try {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) {
                onError('Default overrides must be a JSON array.');
                return;
            }
            onChange(parsed as PayloadItem[]);
        } catch {
            onError('Invalid JSON. Please fix and try again.');
        }
    };

    return (
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            spellCheck={false}
            style={{
                width: '100%',
                minHeight: 360,
                marginTop: 12,
                fontFamily: 'monospace',
                fontSize: 12,
                padding: 8,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
            }}
        />
    );
};
export default JsonEditor;  