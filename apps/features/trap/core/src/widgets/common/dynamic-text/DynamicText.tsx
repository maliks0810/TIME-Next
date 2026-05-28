/* eslint-disable  @typescript-eslint/no-explicit-any */
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { WidgetComponentProps } from '../../../types/widget';

import styles from './DynamicText.module.scss';
import { useGetWidgetValue, useGetAllContext } from '../../../state/Widgets/hooks';
import { DYNAMIC_TEXT_KEY } from '../../constants';
import { useEffect, useState } from 'react';
export const DynamicText = ({ widgetInstance }: WidgetComponentProps) => {
    // Widget config values
    const { config = {} } = widgetInstance;
    const channelId = config.params?.channel;
    const content = config?.params?.content || '';

    // State communication
    const dynamicTextValue = useGetWidgetValue({
        channelId: channelId,
        key: DYNAMIC_TEXT_KEY,
    });

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

    return (
        <WidgetCardShell>
            <div className={styles.wrapper} dangerouslySetInnerHTML={{ __html: output }}></div>
        </WidgetCardShell>
    );
};
