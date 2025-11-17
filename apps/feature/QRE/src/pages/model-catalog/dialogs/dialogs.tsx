import { JSX, useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GitLabIcon from '../../../assets/gitlab.svg?react';
import JupyterIcon from '../../../assets/jupyter.svg?react';
import './dialogs.scss';
import { ModelCatalogEntry, SyncTypes } from '../../../types/model-catalog-types';
import {
    useEntryBusyContext,
    useSetEntryBusyContext,
} from '../../../contexts/model-catalog-entry-context';
import { AlertSeverity } from '../../../types/alert-types';
import { useUpdateAlertInfoContext } from '../../../contexts/alert-context';
import { useDeleteModelCatalogEntry, useSynchronize } from '../../../hooks/model-catalog-entries';
import { DialogBase, DialogIcon } from '../../../components/dialog-base';
import { BusyOverlay } from '../../../components/busy-overlay';

export type ModelCatalogDialogProps = {
    visible: boolean;
    entry: ModelCatalogEntry;
    onAccept: (entry: ModelCatalogEntry, busyTitle: string, busyMessage: string) => void;
    onCancel?: () => void;
};

export const ModelDeleteDialog = (props: ModelCatalogDialogProps) => {
    const { visible, entry, onAccept, onCancel } = props;
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        setOpen(visible);
    }, [visible]);

    const handleClick = (button: string) => {
        if (button == 'yes') {
            onAccept(
                entry,
                'Deleting model',
                `Deleting model '${entry.name}' from the Model Catalog. Please wait.`
            );
        } else {
            onCancel?.();
        }
    };

    return (
        <DialogBase
            title="Delete Catalog Model"
            open={open}
            onButtonClick={handleClick}
            icon={DialogIcon.Alert}
        >
            <Stack direction="column" spacing={1}>
                <Typography variant="subtitle2">
                    {'Are you sure you want to delete Model\n'}
                    <span>{entry?.name}</span>
                </Typography>
                <Typography color="warning">This operation cannot be undone!</Typography>
            </Stack>
        </DialogBase>
    );
};

export const SyncToJupyterDialog = (props: ModelCatalogDialogProps) => {
    const { visible, entry, onAccept, onCancel } = props;
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        setOpen(visible);
    }, [visible]);

    const handleClick = (button: string) => {
        if (button == 'yes') {
            onAccept(
                entry,
                `Synchronizing notebooks from Gitlab to JupyterLab`,
                `Synchronizing notebooks associated with model '${entry?.name}' from Gitlab to JupyterLab. This could take up to 5 minutes. Please wait.`
            );
        } else {
            onCancel?.();
        }
    };

    return (
        <DialogBase title="Sync Gitlab to Jupyter?" open={open} onButtonClick={handleClick}>
            <Stack direction="row" spacing={1}>
                <Stack direction="column" spacing={1}>
                    <Typography color="primary">{`This will synchronize the notebooks associated with model '${entry?.name}' from Gitlab to JupyterLab. Continue?`}</Typography>
                    <Typography color="warning">
                        Be aware, this operation may take up to five minutes.
                    </Typography>
                </Stack>
                <div className="model-catalog-sync-dialog-icon-group">
                    <JupyterIcon className="model-catalog-sync-dialog-icon" />
                    <ArrowBackIcon className="model-catalog-sync-dialog-icon" />
                </div>
            </Stack>
        </DialogBase>
    );
};

export const SyncToGitlabDialog = (props: ModelCatalogDialogProps) => {
    const { visible, entry, onAccept, onCancel } = props;
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        setOpen(visible);
    }, [visible]);

    const handleClick = (button: string) => {
        if (button == 'yes') {
            onAccept(
                entry,
                `Synchronizing notebooks from JupyterLab to Gitlab`,
                `Synchronizing notebooks associated with model '${entry?.name}' from JupyterLab to Gitlab. Please wait.`
            );
        } else {
            onCancel?.();
        }
    };

    return (
        <DialogBase title="Sync Jupyter to Gitlab?" open={open} onButtonClick={handleClick}>
            <Stack direction="row" spacing={1}>
                <Typography color="primary">{`This will synchronize the notebooks associated with model '${entry?.name}' from JupyterLab to Gitlab. Continue?`}</Typography>
                <div className="model-catalog-sync-dialog-icon-group">
                    <ArrowForwardIcon className="model-catalog-sync-dialog-icon" />
                    <GitLabIcon className="model-catalog-sync-dialog-icon" />
                </div>
            </Stack>
        </DialogBase>
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
    const busy = useEntryBusyContext();
    const alert = useUpdateAlertInfoContext();
    const synchronize = useSynchronize();
    const ModelDialog = Dialogs[dialogType];
    const [busyInfo, setBusyInfo] = useState<{ title: string; message: string }>({
        title: '',
        message: '',
    });
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

    const handleAccept = (e: ModelCatalogEntry, busyTitle: string, busyMessage: string) => {
        setBusy(true);
        setBusyInfo({ title: busyTitle, message: busyMessage });
        actions[dialogType][0](e)
            .then(() => {
                if (dialogType == DialogTypes.ToGitlab || dialogType == DialogTypes.ToJupyter) {
                    alert({
                        severity: AlertSeverity.SUCCESS,
                        title: `Synchronization to ${
                            dialogType == DialogTypes.ToGitlab ? 'Gitlab' : 'JupyterHub'
                        } completed successfully!`,
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
            <>
                <BusyOverlay open={busy} title={busyInfo.title} message={busyInfo.message} />
                <ModelDialog
                    visible={visible}
                    entry={entry}
                    onCancel={handleCancel}
                    onAccept={handleAccept}
                />
            </>
        )
    );
};
