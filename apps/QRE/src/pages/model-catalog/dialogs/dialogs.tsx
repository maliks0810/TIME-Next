import { JSX, useEffect, useRef } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReportIcon from '@mui/icons-material/Report';
// import GitLabIcon from '../../../../assets/gitlab.svg?react';
// import JupyterIcon from '../../../../assets/jupyter.svg?react';
import './dialogs.scss';
import { ModelCatalogEntry, SyncTypes } from '../../../../types/model-catalog-types';
import { AcceptDialog } from '../../../../components/accept-dialog';
import {
    useEntryBusyContext,
    useSetEntryBusyContext,
} from '../../../../contexts/model-catalog-entry-context';
import { AlertSeverity } from '../../../../types/alert.d';
import { useUpdateAlertInfoContext } from '../../../../contexts/alert-context';
import { useDeleteModelCatalogEntry, useSynchronize } from '../../../../hooks/model-catalog-entries';

export type ModelCatalogDialogProps = {
    visible: boolean;
    entry: ModelCatalogEntry;
    onAccept: (entry: ModelCatalogEntry) => void;
    onCancel?: () => void;
};

export const ModelDeleteDialog = (props: ModelCatalogDialogProps) => {
    const { visible, entry, onAccept, onCancel } = props;
    const busy = useEntryBusyContext();
    const ref = useRef<HTMLDialogElement>(null);
    const busyMessage = busy && visible ? `Deleting model '${entry.name}'` : null;

    useEffect(() => {
        if (visible) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [visible]);

    const handleClick = (accept: boolean) => {
        if (accept) {
            onAccept(entry);
        } else {
            onCancel?.();
        }
    };

    return (
        <AcceptDialog
            title={
                <div className="popup-inner-header">
                    <div>
                        {'Are you sure you want to delete Model\n'}
                        <span>{entry?.name}</span>
                    </div>
                    <ReportIcon className="model-catalog-delete-dialog-icon" />
                </div>
            }
            ref={ref}
            onClick={handleClick}
            busyMessage={busyMessage}
        >
            This operation cannot be undone!
        </AcceptDialog>
    );
};

export const SyncToJupyterDialog = (props: ModelCatalogDialogProps) => {
    const { visible, entry, onAccept, onCancel } = props;
    const busy = useEntryBusyContext();
    const ref = useRef<HTMLDialogElement>(null);
    const busyTitle = busy && visible ? `Synchronizing notebooks from Gitlab to JupyterLab` : null;
    const busyMessage = busy && visible ? `This could take up to 5 minutes` : null;
    useEffect(() => {
        if (visible) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [visible]);

    const handleClick = (accept: boolean) => {
        if (accept) {
            onAccept(entry);
        } else {
            onCancel?.();
        }
    };

    return (
        <AcceptDialog
            title={
                <div className="popup-inner-header">
                    <div>
                        {'Sync Gitlab to Jupyter?\n'}
                        <span>{entry?.name}</span>
                    </div>

                    {/* <JupyterIcon className="model-catalog-sync-dialog-icon" /> */}
                    <ArrowBackIcon className="model-catalog-sync-dialog-icon" />
                    <HelpOutlineIcon className="model-catalog-sync-dialog-icon" />
                </div>
            }
            ref={ref}
            onClick={handleClick}
            busyMessage={busyMessage}
            busyTitle={busyTitle}
        >
            {`This will synchronize the notebooks associated with model '${entry?.name}' from Gitlab to JupyterLab. Continue?\nBe aware, this operation may take up to five minutes.`}
        </AcceptDialog>
    );
};

export const SyncToGitlabDialog = (props: ModelCatalogDialogProps) => {
    const { visible, entry, onAccept, onCancel } = props;
    const busy = useEntryBusyContext();
    const ref = useRef<HTMLDialogElement>(null);
    const busyMessage =
        busy && visible ? `Synchronizing notebooks from JupyterLab to Gitlab` : null;

    useEffect(() => {
        if (visible) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [visible]);

    const handleClick = (accept: boolean) => {
        if (accept) {
            onAccept(entry);
        } else {
            onCancel?.();
        }
    };

    return (
        <AcceptDialog
            title={
                <div className="popup-inner-header">
                    <div>
                        {'Sync Jupyter to Gitlab?\n'}
                        <span>{entry?.name}</span>
                    </div>
                    <ArrowForwardIcon className="model-catalog-sync-dialog-icon" />
                    {/* <GitLabIcon className="model-catalog-sync-dialog-icon" /> */}
                    <HelpOutlineIcon className="model-catalog-sync-dialog-icon" />
                </div>
            }
            ref={ref}
            onClick={handleClick}
            busyMessage={busyMessage}
        >
            {`This will synchronize the notebooks associated with model '${entry?.name}' from JupyterLab to Gitlab. Continue?`}
        </AcceptDialog>
    );
};

export enum DialogTypes {
    None,
    Delete,
    ToJupyter,
    ToGitlab,
}

const Dialogs: { [key in DialogTypes]: (props: ModelCatalogDialogProps) => JSX.Element } = {
    [DialogTypes.None]: () => <></>,
    [DialogTypes.Delete]: ModelDeleteDialog,
    [DialogTypes.ToJupyter]: SyncToJupyterDialog,
    [DialogTypes.ToGitlab]: SyncToGitlabDialog,
};

export const DialogWrapper = (props: {
    dialogType: DialogTypes;
    entry: ModelCatalogEntry | null;
    onFinished: (reload: boolean) => void;
}) => {
    const { dialogType, entry, onFinished } = props;
    const setBusy = useSetEntryBusyContext();
    const alert = useUpdateAlertInfoContext();
    const synchronize = useSynchronize();
    const Dialog = Dialogs[dialogType];
    const actions: { [key in DialogTypes]: [(entry: ModelCatalogEntry) => Promise<void>, string] } =
        {
            [DialogTypes.None]: [async () => {}, ''],
            [DialogTypes.Delete]: [
                useDeleteModelCatalogEntry(),
                'An error occurred while deleting the model',
            ],
            [DialogTypes.ToJupyter]: [
                (e: ModelCatalogEntry) => synchronize(e, SyncTypes.ToJupyter),
                'An error occurred while synchronizing from Gitlab to JupyterHub',
            ],
            [DialogTypes.ToGitlab]: [
                (e: ModelCatalogEntry) => synchronize(e, SyncTypes.ToGitlab),
                'An error occurred while synchronizing from JupyterHub to Gitlab',
            ],
        };
    const visible = dialogType != DialogTypes.None;

    console.debug('DialogWrapper rendering');

    const handleCancel = () => {
        onFinished(false);
    };

    const handleAccept = (e: ModelCatalogEntry) => {
        setBusy(true);
        actions[dialogType][0](e)
            .then(() => {
                if (dialogType == DialogTypes.ToGitlab || dialogType == DialogTypes.ToJupyter) {
                    alert({
                        severity: AlertSeverity.SUCCESS,
                        title: `Synchronization to ${dialogType == DialogTypes.ToGitlab ? 'Gitlab' : 'JupyterHub'} completed successfully!`,
                    });
                }
                onFinished(dialogType == DialogTypes.Delete);
            })
            .catch((err) => {
                alert({
                    severity: AlertSeverity.ERROR,
                    title: actions[dialogType][1],
                    message: err.message,
                });
            })
            .finally(() => {
                setBusy(false);
            });
    };

    return (
        dialogType != DialogTypes.None &&
        entry != null &&
        Boolean(entry) && (
            <Dialog
                visible={visible}
                entry={entry}
                onCancel={handleCancel}
                onAccept={handleAccept}
            />
        )
    );
};
