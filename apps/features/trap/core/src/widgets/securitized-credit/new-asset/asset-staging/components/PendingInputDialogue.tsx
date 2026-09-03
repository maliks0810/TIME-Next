import { Button, Tag, Card } from 'antd';
import clsx from 'clsx';

import styles from '../AssetStagingWidget.module.scss';
import { ScenarioSummary } from '../../scenario-matrix/utils/scenarioSummary';

export const PendingInputDialogue = ({
    scenarioRunSummary,
    onPendingInputAccept,
    onPendingInputDismiss,
    cashflow,
}: {
    scenarioRunSummary: ScenarioSummary;
    onPendingInputAccept: () => void;
    onPendingInputDismiss: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cashflow: any;
}) => {
    const tagColor = scenarioRunSummary?.color || cashflow?.color;
    const scenario = scenarioRunSummary?.scenario || cashflow?.scenario;
    const tranche = scenarioRunSummary?.tranche || cashflow?.tranche;
    return (
        <div className={clsx(styles.assumptionPanel, styles.assumptionPendingBody)}>
            <Card style={{ maxWidth: 385 }}>
                <Tag color={tagColor}>{scenario}</Tag>
                <div
                    style={{
                        fontSize: 12,
                        marginTop: 8,
                        marginBottom: 8,
                    }}
                >
                    <b>{tranche}</b>
                    {scenarioRunSummary && ` · ${scenarioRunSummary?.pendingAssumptionsMessage}`}
                    {!!cashflow && (
                        <div className={styles.cashflowAttachedContainer}>Cash flow attached</div>
                    )}
                </div>
                <div className={styles.assumptionPendingActions}>
                    <Button
                        variant="solid"
                        color="primary"
                        size="small"
                        onClick={onPendingInputAccept}
                    >
                        Accept
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="danger"
                        onClick={onPendingInputDismiss}
                    >
                        Dismiss
                    </Button>
                </div>
            </Card>
        </div>
    );
};
