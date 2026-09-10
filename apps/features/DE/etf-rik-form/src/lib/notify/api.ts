// emailApi.ts
import axios from 'axios';

const EMAIL_API_URL = import.meta.env.VITE_NOTIFY_BASE_URL ?? 'https://velocity-service-layer-dev.np.tcw.com/pe/notification/v2/api/email'

export interface EmailPayload {
    subject: string;
    name: string;
    to: string[];
    from: string;
    content: string;
    attachment?: File;
}

export const sendEmail = async (payload: EmailPayload) => {
    const formData = new FormData();

    formData.append('subject', payload.subject);
    formData.append('name', payload.name);

    // Match Postman format:
    formData.append('to', JSON.stringify(payload.to));

    formData.append('from', payload.from);
    formData.append('content', payload.content);

    if (payload.attachment) {
        formData.append('attachment', payload.attachment);
    }

    const { data } = await axios.post(EMAIL_API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return data;
};