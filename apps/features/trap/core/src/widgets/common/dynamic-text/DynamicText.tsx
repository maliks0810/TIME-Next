/* eslint-disable  @typescript-eslint/no-explicit-any */
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { WidgetComponentProps } from '../../../types/widget';

import styles from './DynamicText.module.scss';
import {
    useGetWidgetValue,
    useGetAllContext,
    useGetWidgetValueArray,
} from '../../../state/Widgets/hooks';
import { DYNAMIC_TEXT_KEY } from '../../constants';
import { useEffect, useMemo, useState } from 'react';
export const DynamicText = ({
    widgetInstance,
    execute,
    result,
    widgetDefinition,
}: WidgetComponentProps) => {
    // Widget config values
    const { config = {} } = widgetInstance;
    const channelId = config.params?.channel;
    const opacity = config.params?.opacity || 100;
    const content = config?.params?.content || '';

    const listensToKeys = config?.params?.listensToKeys;
    // State communication
    const dynamicTextValue = useGetWidgetValue({
        channelId: channelId,
        key: DYNAMIC_TEXT_KEY,
    });

    const keysContext = useGetWidgetValueArray({
        channelId: config.params?.channel,
        keys: listensToKeys,
    });

    const subscribedValues = useMemo(
        () =>
            listensToKeys
                ? listensToKeys.reduce(
                      (acc: any, cur: string) => ({ ...acc, [cur]: keysContext?.[cur] || null }),
                      {}
                  )
                : {},
        [keysContext, listensToKeys]
    );
    useEffect(() => {
        if (subscribedValues && listensToKeys) {
            execute?.({ ...subscribedValues });
        }
    }, [subscribedValues, listensToKeys]);

    // Needs to be replaces with useGetWidgetValueArray. First parse content to get what keys need to removed, then pass those keys.
    const context = useGetAllContext({ channelId }) || {};

    // Widget state
    const [value, setValue] = useState<string | null>();

    useEffect(() => {
        if (dynamicTextValue !== value) {
            setValue(dynamicTextValue as string | null);
        }
    }, [dynamicTextValue]);

    const variableParseRegex = /<span[^>]*data-id="([^"]+)"[^<]*>[^<]*<\/span>/g;

    const output = content.replace(variableParseRegex, (_: any, key: string) =>
        JSON.stringify(context[key])
    );

    const configSchema = widgetDefinition?.configSchema;
    const properties = configSchema?.properties || {};
    const widgetColor = useMemo(() => {
        const { params = {} } = config;

        switch (params['themeMode']) {
            case 'customSolid':
                return { backgroundColor: params['customColor'] ?? '#FFFFFF', background: '' };
            case 'customGradient':
                return {
                    background: `linear-gradient(45deg, ${params['customGradientStart'] ?? '#2563eb'}, ${params['customGradientEnd'] ?? '#60a5fa'})`,
                    backgroundColor: '',
                };
            default:
                return {
                    backgroundColor: '',
                    background: '',
                };
        }
    }, [config, properties]);
    const resultContent = result?.content || '';
    return (
        <WidgetCardShell style={{ opacity: `${opacity / 100}`, ...widgetColor }}>
            <div
                className={styles.wrapper}
                dangerouslySetInnerHTML={{ __html: `${output} ${resultContent}` }}
            ></div>
        </WidgetCardShell>
    );
};
