import { useLayoutEffect, useState } from 'react';
import { Button, FormInstance } from 'antd';
import { Switch } from 'antd';
import { getWorkflowExceptionsById, resolveWorkflowExceptionById } from '../../lib/services';
import { WorkflowException } from '../../lib/types';

export const WorkflowExceptionTable = ({
    selectedAssetId,
    form,
    latestUpdateTimestamp,
}: {
    selectedAssetId?: number | null;
    form: FormInstance;
    latestUpdateTimestamp: number;
}) => {
    const [exceptions, setExceptions] = useState<WorkflowException[]>([]);

    useLayoutEffect(() => {
        form.resetFields(['rows']);
        if (selectedAssetId) {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const rows: any = {};

            getWorkflowExceptionsById(selectedAssetId)
                .then(({ data }) => {

                    if (data.response.some(x => x.isResolved == false)) {
                        setExceptions(data.response);
                    } else {
                        setExceptions([]);
                    }
                })
                .catch((e) => {
                    console.warn('Unable to download exception data', e);
                })
                .finally(() => {
                    form.setFieldsValue({ rows });
                });
        } else {
            setExceptions([]);
        }
    }, [form, selectedAssetId, latestUpdateTimestamp]);

    const handleResolve = (anchorId: number, workflowExceptionId: number) => {

        resolveWorkflowExceptionById(anchorId, workflowExceptionId)
            .then(() => {
                setExceptions((prev) =>
                    prev.map((ex) =>
                        ex.workflowExceptionId === workflowExceptionId ? { ...ex, isResolved: true } : ex
                    )
                );
            })
            .catch((e) => {
                console.warn('Unable to resolve workflow exception', e);
            });
    };

    return (<>
        {exceptions.length > 0 && (
            <div className="workflowExceptionTableContainer">
                <div className="workflowExceptionActionBarHeader">Workflow Exceptions</div>
                <div className="custom-table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th className="th-exception-type">Type</th>
                                <th className="th-exception-message">Message</th>
                                <th className="th-exception-resolved">Resolved?</th>
                                <th className="th-exception-resolved">Action</th> {/* New column */}
                            </tr>
                        </thead>
                        <tbody>
                            {exceptions?.map((ex) => {
                                const rowClass = ex.isResolved ? 'tr-resolved' : 'tr-unresolved';

                                return (
                                    <tr
                                        key={`${ex.anchorType}-${ex.anchorId}-${ex.workflowId}`}
                                        className={rowClass}
                                    >
                                        <td className="td-exception-type">{ex.exceptionType}</td>
                                        <td className="td-exception-message">{ex.exceptionMessage}</td>
                                        <td className="td-exception-resolved">
                                            <Switch checked={ex.isResolved} disabled />
                                        </td>
                                        <td className="td-exception-resolved">
                                            {!ex.isResolved && (
                                                <Button
                                                    type="primary"
                                                    className="resolve-button"
                                                    onClick={() => handleResolve(ex.anchorId, ex.workflowExceptionId)}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </>)
};

export default WorkflowExceptionTable;  