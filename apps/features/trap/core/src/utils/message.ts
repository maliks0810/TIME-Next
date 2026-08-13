import { MessageInstance } from 'antd/es/message/interface';

let globalMessageApi: MessageInstance | null = null;

export const setCoreGlobalMessageApi = (api: MessageInstance) => {
    globalMessageApi = api;
};

const activeErrors = new Set<string>();

export const coreGlobalMessage = {
    success: (content: string) => globalMessageApi?.success(content),
    info: (content: string) => globalMessageApi?.info(content),
    warning: (content: string) => globalMessageApi?.warning(content),
    loading: (content: string) => globalMessageApi?.loading(content),
    error: (content: string) => {
        if (activeErrors.has(content)) {
            return;
        }
        activeErrors.add(content);
        globalMessageApi?.error({
            content,
            onClose: () => {
                activeErrors.delete(content);
            },
        });
    },
};
