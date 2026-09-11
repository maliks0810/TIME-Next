import type { MouseEvent } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, Tooltip, Typography } from 'antd';
import type { WidgetMethodology } from './types';
import styles from './MethodologyPopover.module.scss';

type MethodologyPopoverProps = {
    methodology: WidgetMethodology;
};

export function MethodologyPopover({ methodology }: MethodologyPopoverProps) {
    const stopPropagation = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
    };

    const content = (
        <div className={styles.content}>
            <section className={styles.section}>
                <Typography.Text className={styles.sectionTitle}>
                    Definition
                </Typography.Text>
                <Typography.Paragraph className={styles.description}>
                    {methodology.definition}
                </Typography.Paragraph>
            </section>

            {methodology.formula ? (
                <section className={styles.section}>
                    <Typography.Text className={styles.sectionTitle}>
                        Formula
                    </Typography.Text>
                    <div
                        className={styles.formula}
                        aria-label={[
                            methodology.formula.numerator,
                            methodology.formula.denominator
                                ? `divided by ${methodology.formula.denominator}`
                                : '',
                            methodology.formula.multiplier ?? '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <span className={styles.fraction}>
                            <span className={styles.numerator}>
                                {methodology.formula.numerator}
                            </span>
                            {methodology.formula.denominator ? (
                                <span className={styles.denominator}>
                                    {methodology.formula.denominator}
                                </span>
                            ) : null}
                        </span>
                        {methodology.formula.multiplier ? (
                            <span className={styles.multiplier}>
                                {methodology.formula.multiplier}
                            </span>
                        ) : null}
                    </div>
                </section>
            ) : null}

            {methodology.sourceFields?.length ? (
                <section className={styles.section}>
                    <Typography.Text className={styles.sectionTitle}>
                        Source Fields
                    </Typography.Text>
                    <div className={styles.sourceFields}>
                        {methodology.sourceFields.map((field) => (
                            <code key={field} className={styles.sourceField}>
                                {field}
                            </code>
                        ))}
                    </div>
                </section>
            ) : null}

            {methodology.weighting ? (
                <section className={styles.section}>
                    <Typography.Text className={styles.sectionTitle}>
                        Weighting
                    </Typography.Text>
                    <Typography.Paragraph className={styles.detail}>
                        {methodology.weighting}
                    </Typography.Paragraph>
                </section>
            ) : null}

            {methodology.filterBehavior ? (
                <section className={styles.section}>
                    <Typography.Text className={styles.sectionTitle}>
                        Filter Behavior
                    </Typography.Text>
                    <Typography.Paragraph className={styles.detail}>
                        {methodology.filterBehavior}
                    </Typography.Paragraph>
                </section>
            ) : null}
        </div>
    );

    return (
        <Popover
            title={methodology.title}
            content={content}
            placement="bottomRight"
            trigger="click"
            overlayClassName={styles.popover}
        >
            <Tooltip title="View methodology" mouseEnterDelay={0.4}>
                <button
                    type="button"
                    className={styles.trigger}
                    aria-label={`View methodology for ${methodology.title}`}
                    onClick={stopPropagation}
                    onMouseDown={stopPropagation}
                >
                    <InfoCircleOutlined aria-hidden="true" />
                </button>
            </Tooltip>
        </Popover>
    );
}
