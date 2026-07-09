import { useState } from 'react';
import { Select, Switch } from 'antd';
import { Callable, ReviewType, WorkflowRule } from '../lib/types';
import { CALLABLE_SELECT_OPTIONS, REVIEW_TYPE_COLORS } from '../lib/constants';
import { evaluateRules } from '../lib/helpers';

type PreviewOutcomeProps = {
    rules: WorkflowRule[];
    defaultReviewType: ReviewType;
};

export const PreviewOutcome = ({ rules, defaultReviewType }: PreviewOutcomeProps) => {
    const [callable, setCallable] = useState<Callable>('Y');
    const [speedOverridesExist, setSpeedOverridesExist] = useState<boolean>(false);

    const result = evaluateRules(rules, defaultReviewType, { callable, speedOverridesExist });

    return (
        <div>
            <div
                style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    marginBottom: '8px',
                    backgroundColor:'#fafafa',
                    border: '1px solid #e8e8e8',
                    padding:'5px'
                }}
            >
                Rule Simulator
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr',
                    gap: 12,
                    alignItems: 'center',
                }}
            >
                <span>
                    <strong>Callable:</strong>
                </span>
                <Select
                    style={{ width: 120 }}
                    value={callable}
                    onChange={(value) => setCallable(value as Callable)}
                    options={CALLABLE_SELECT_OPTIONS}
                />

                <span>
                    <strong>Speed Overrides:</strong>
                </span>
                <Switch
                    style={{
                        width: '20px',
                    }}
                    checked={speedOverridesExist}
                    onChange={setSpeedOverridesExist}
                />

                <span>
                    <strong>Result:</strong>
                </span>
                <span style={{ color: REVIEW_TYPE_COLORS[result], fontWeight: 600 }}>
                    → {result}
                </span>
            </div>
        </div>
    );
};
