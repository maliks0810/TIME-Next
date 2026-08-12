import React, { useEffect } from 'react';
import { App as AntdApp } from 'antd';
import { setCoreGlobalMessageApi } from '../../utils/message';

export const MessageInitializer: React.FC = () => {
    const { message } = AntdApp.useApp();

    useEffect(() => {
        setCoreGlobalMessageApi(message);
    }, [message]);

    return null;
};
