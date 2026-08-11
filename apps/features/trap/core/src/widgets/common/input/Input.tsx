import { useSetWidgetValue } from '../../../state/Widgets/hooks';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { WidgetComponentProps } from '../../../types/widget';
import { Input as AntdInput, Button } from 'antd';
import styles from './Input.module.scss';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { useState } from 'react';

export const Input = ({ widgetInstance }: WidgetComponentProps) => {
    const { config = {} } = widgetInstance;
    const submitButton = config.params?.submitButton;
    const channelId = config.params?.channelId;
    const emitsKey = config.params?.emitsKey;

    const [inputValue, setInputValue] = useState<string | null>(null);
    const activeTab = useGetActiveTab();
    const setWidgetValue = useSetWidgetValue();
    const handleSubmit = () => {
        setWidgetValue({ activeTab, value: inputValue, key: emitsKey, channelId });
    };
    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                <AntdInput onChange={(e) => setInputValue(e.target.value)}></AntdInput>
                {submitButton && <Button onClick={handleSubmit}>Submit</Button>}
            </div>
        </WidgetCardShell>
    );
};
