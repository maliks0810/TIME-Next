import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import styles from './Portfolio.module.scss';
import { useGetWidgetValue } from '../../../state/Widgets/hooks';
import { useEffect } from 'react';
import { COMMON_TREE_KEY } from '../../constants';

export const PortfolioInfo = ({ result, widgetInstance, execute }: WidgetComponentProps) => {
    const { config = {} } = widgetInstance;

    const inceptionDate =
        (result?.portfolioInfo as Record<string, string>)?.['inceptionDate'] || 'uknown';
    const perfStartDate =
        (result?.portfolioInfo as Record<string, string>)?.['perfStartDate'] || 'uknown';

    const portfolio = useGetWidgetValue({
        channelId: config.params?.channel,
        key: COMMON_TREE_KEY,
    });

    const warning = (result?.warning as string) || '';

    useEffect(() => {
        execute?.({ portfolioNumber: portfolio });
    }, [portfolio]);

    if (!portfolio) {
        return <WidgetCardShell>To see more info, please select a portfolio</WidgetCardShell>;
    }

    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                <div className={styles.name}>{result?.name as string} </div>
                <div className={styles.divider}></div>
                <div className={styles.dates}>
                    <div className={styles.info}>
                        <span>Inception Dt</span>
                        <div>{inceptionDate}</div>
                    </div>
                    <div className={styles.info}>
                        <span>Perf Start Dt</span>
                        <div>{perfStartDate}</div>
                    </div>
                </div>

                <div className={styles.warning} dangerouslySetInnerHTML={{ __html: warning }}></div>
            </div>
        </WidgetCardShell>
    );
};
