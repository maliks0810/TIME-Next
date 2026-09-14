import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { Button } from 'antd';
import { useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { COMMON_BUTTON_KEY } from '../../constants';
import styles from './Button.module.scss';
type ButtonAction = 'emitKey' | 'export' | 'redirect';
export const ButtonWidget = ({ widgetInstance }: WidgetComponentProps) => {
    //Communication
    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();

    // Config
    const { config } = widgetInstance;
    const label = config?.params?.label;
    const buttonAction: ButtonAction = config?.params?.buttonAction || 'emitKey';
    const emitsKeys = config?.params?.emitsKeys || COMMON_BUTTON_KEY;

    const type = config?.params?.type;
    const channelId = config?.params?.channel;

    const handleButtonClick = () => {
        switch (buttonAction) {
            case 'emitKey': {
                const emitValue = config?.params?.emitValue;
                setWidgetValueToChannel({
                    activeTab,
                    channelId,
                    key: emitsKeys,
                    value: emitValue,
                    widgetId: widgetInstance.id,
                });
                return null;
            }

            default:
                return null;
        }
    };

    return (
        <WidgetCardShell>
            <Button onClick={handleButtonClick} className={styles.button} type={type}>
                {label}
            </Button>
        </WidgetCardShell>
    );
};
