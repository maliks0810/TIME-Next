import * as tlog from '@tcw/tlog';
import { memo, useState } from 'react';
import { Button, CardContent, Grid, Paper } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { QreBulkAuthorizations } from '../../../types/qre-authorization-types';
import { ModelCatalogEntry, SyncTypes } from '../../../types/model-catalog-types';
import {
    useEntryEditingContext,
    useSetEntryEditingContext,
} from '../../../contexts/model-catalog-entry-context';
import { useUserInfo } from '@platform/utils';
import { ModelCatalogEntryEditor } from './entry-editor';
import './grid-row.scss';
import { EntryActions, EntryPresentation, EntrySync } from './grid-row-parts';
import { BusyOverlay } from '../../../components/busy-overlay';

const SYNC_RESOURCE = 'catalog';
const SYNC_ACTION = 'synchronize';

enum EditModes {
    None,
    Edit,
    Copy,
}

export const ModelCatalogGridRow = memo(
    (props: {
        entry: ModelCatalogEntry;
        // the onSync... methods and onDelete are expected to return immediately and do not
        //affect the state of the UI
        onSyncToGitlab: (entry: ModelCatalogEntry) => void;
        onSyncToJupyter: (entry: ModelCatalogEntry) => void;
        onDelete: (entry: ModelCatalogEntry) => void;
        //onSave is an async function that returns a bool. The bool indicates if the editor can close
        onSave: (entry: ModelCatalogEntry, copying: boolean) => Promise<boolean>;
        userAuth: QreBulkAuthorizations;
    }) => {
        const { entry, onSyncToGitlab, onSyncToJupyter, onDelete, onSave, userAuth } = props;
        const user = useUserInfo();
        const setEditing = useSetEntryEditingContext();
        const [mode, setMode] = useState<EditModes>(EditModes.None);
        const [busyTitle, setBusyTitle] = useState<string | null>(null);
        const [busyMessage, setBusyMsg] = useState<string | null>(null);
        const userOwned = true || entry.owner.email.toLowerCase() == user.email.toLowerCase();
        const canSync =
            userAuth.results?.find((s) => s.resource == SYNC_RESOURCE && s.action == SYNC_ACTION)
                ?.authorized ?? false;

        console.log('ModelCatalogGridRow rendering');

        const handleCancel = () => {
            setEditing(false);
            setMode(EditModes.None);
        };

        const handleSave = async (e: ModelCatalogEntry) => {
            const copying = mode == EditModes.Copy;
            setBusyMsg(copying ? `Creating new model '${e.name}'` : `This should not take long`);
            setBusyTitle(
                copying
                    ? `Spawning Jupyter Model project. Cloning Model '${entry.name}'. Starting JupyterLab server. This will take a few minutes. `
                    : `Saving changes to ${entry.name}`
            );
            setBusyTitle(
                copying
                    ? `Spawning Jupyter Model project. Cloning Model '${entry.name}'. Starting JupyterLab server. This will take a few minutes. `
                    : `Saving changes to ${entry.name}`
            );
            onSave(e, copying)
                .then((close) => {
                    if (close) {
                        setEditing(false);
                        setMode(EditModes.None);
                    }
                })
                .catch((err) => {
                    console.log('Very unexpected error:', err);
                    tlog.error(
                        err,
                        'An unexpected error occurred while saving a model catalog entry row',
                        'handleSave'
                    );
                })
                .finally(() => {
                    setBusyMsg(null);
                    setBusyTitle(null);
                });
        };

        const handleStartEdit = (copying: boolean) => {
            setMode(copying ? EditModes.Copy : EditModes.Edit);
        };

        const handleDelete = () => {
            onDelete(entry);
        };

        const handleStartSync = (syncType: SyncTypes) => {
            const sync = syncType == SyncTypes.ToGitlab ? onSyncToGitlab : onSyncToJupyter;
            sync(entry);
        };

        const Editor = (
            <ModelCatalogEntryEditor
                entry={entry}
                copying={mode == EditModes.Copy}
                onCancel={handleCancel}
                onSave={handleSave}
            />
        );

        return (
            <>
                <BusyOverlay
                    open={(busyMessage?.length ?? 0) > 0}
                    title={busyTitle}
                    message={busyMessage}
                />
                <Paper className="row-base">
                    <CardContent>
                        {mode == EditModes.Edit ? (
                            Editor
                        ) : (
                            <Grid container columns={32}>
                                <Grid size={1}>
                                    <EntryActions
                                        startEdit={handleStartEdit}
                                        startDelete={handleDelete}
                                        copyOnly={!userOwned}
                                    />
                                </Grid>
                                <Grid size={30}>
                                    <EntryPresentation entry={entry} userOwned={userOwned} />
                                </Grid>
                                <Grid size={1}>
                                    <EntrySync
                                        startSync={handleStartSync}
                                        hidden={!userOwned || !canSync}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </CardContent>
                </Paper>

                {mode == EditModes.Copy && Editor}
            </>
        );
    }
);

ModelCatalogGridRow.displayName = 'ModelCatalogGridRow';

export const ModelCatalogNewEntryRow = (props: {
    //onSave is an async function that returns a bool. The bool indicates if the editor can close
    onSave: (entry: ModelCatalogEntry) => Promise<boolean>;
}) => {
    const { onSave } = props;
    const setEditing = useSetEntryEditingContext();
    const editing = useEntryEditingContext();
    const [busyMessage, setBusyMsg] = useState<string | null>(null);
    const [busyTitle, setBusyTitle] = useState<string | null>(null);
    //Need this active flag to show the edit component, instead of editing flag,
    //because other things change the editing flag.
    const [active, setActive] = useState<boolean>(false);
    const handleNewEntryClick = () => {
        setEditing(true);
        setActive(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setActive(false);
    };

    const handleSave = async (entry: ModelCatalogEntry) => {
        setBusyMsg(`Creating new model '${entry.name}'`);
        setBusyTitle(
            'Spawning Jupyter Model project. Generating Model. Starting JupyterLab server. This will take a few minutes.'
        );
        onSave(entry)
            .then((success) => {
                if (success) {
                    setEditing(false);
                    setActive(false);
                }
            })
            .catch((err) => {
                console.log('Very unexpected error:', err);
            })
            .finally(() => {
                setBusyMsg(null);
                setBusyTitle(null);
            });
    };

    return (
        <>
            {' '}
            <BusyOverlay
                open={(busyMessage?.length ?? 0) > 0}
                title={busyTitle}
                message={busyMessage}
            />
            <CardContent>
                {active ? (
                    <div className="model-catalog-entry-editor">
                        <ModelCatalogEntryEditor onCancel={handleCancel} onSave={handleSave} />
                    </div>
                ) : (
                    <Button
                        fullWidth={false}
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={handleNewEntryClick}
                        disabled={editing}
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                    >
                        Add new Model Catalog entry
                    </Button>
                )}
            </CardContent>
        </>
    );
};
