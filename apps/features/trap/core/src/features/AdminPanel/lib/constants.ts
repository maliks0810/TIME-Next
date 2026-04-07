export const defaultEditorOptions = {
    fontSize: 13,
    fontLigatures: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    tabSize: 2,
    padding: { top: 12, bottom: 12 },
    renderLineHighlight: 'gutter',
    overviewRulerBorder: false,
    scrollbar: {
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6,
    },
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    bracketPairColorization: { enabled: true },
};

export const defaultQuery = 'SELECT TOP 50 * FROM c';
