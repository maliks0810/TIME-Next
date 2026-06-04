import { message } from 'antd';

export const showSuccessMessage = (msg: string) => message.success(msg);
export const showErrorMessage = (msg: string) => message.error(msg);
export const showInfoMessage = (msg: string) => message.info(msg);
