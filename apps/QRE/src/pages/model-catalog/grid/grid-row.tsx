import * as tlog from '@tcw/tlog';
import { memo, useState } from 'react';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ModelCatalogEntry, SyncTypes } from '../../../types/model-catalog-types';
import {
    useEntryEditingContext,
    useSetEntryEditingContext,
} from '../../../contexts/model-catalog-entry-context';
import { useUserInfo } from '@platform/utils';
import { ModelCatalogEntryEditor } from './entry-editor';
import './grid-row.scss';
import { EntryActions, EntryPresentation, EntrySync } from './grid-row-parts';

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
        onSave: (entry: ModelCatalogEntry, newModel: boolean) => Promise<boolean>;
    }) => {
        const { entry, onSyncToGitlab, onSyncToJupyter, onDelete, onSave } = props;
        const user = useUserInfo();
        const setEditing = useSetEntryEditingContext();
        const [mode, setMode] = useState<EditModes>(EditModes.None);
        const [busyMsg, setBusyMsg] = useState<string | null>(null);
        const userOwned = entry.owner.email.toLowerCase() == user.email.toLowerCase();

        console.log('ModelCatalogGridRow rendering');
        
        const handleCancel = () => {
            setEditing(false);
            setMode(EditModes.None);
        };

        const handleSave = async (e: ModelCatalogEntry) => {
            const copying = mode == EditModes.Copy;
            setBusyMsg(
                copying
                    ? `Creating new model from ${entry.name}`
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
                    tlog.error(err, 'An unexpected error occurred while saving a model catalog entry row', 'handleSave');
                })
                .finally(() => {
                    setBusyMsg(null);
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
                busyMessage={busyMsg}
            />
        );

        return (
            <>
                <div className="model-catalog-grid-row-container">
                    {mode == EditModes.Edit ? (
                        Editor
                    ) : (
                        <>
                            <EntryActions startEdit={handleStartEdit} startDelete={handleDelete} copyOnly={!userOwned}/>
                            <EntryPresentation entry={entry} userOwned={userOwned}/>
                            <EntrySync startSync={handleStartSync} hidden={!userOwned} />
                        </>
                    )}
                </div>
                {mode == EditModes.Copy && Editor}
            </>
        );
    }
);

ModelCatalogGridRow.displayName = 'ModelCatalogGridRow';

export const ModelCatalogNewEntryRow = (props: {
    //onSave is an async function that returns a bool. The bool indicates if the editor can close
    onSave: (entry: ModelCatalogEntry, newModel: boolean) => Promise<boolean>;
}) => {
    const { onSave } = props;
    const setEditing = useSetEntryEditingContext();
    const editing = useEntryEditingContext();
    const [busyMsg, setBusyMsg] = useState<string | null>(null);
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
        onSave(entry, true)
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
            });
    };

    return (
        <div className="model-catalog-edit-new-row">
            {active ? (
                <div className="model-catalog-entry-editor">
                    <ModelCatalogEntryEditor
                        onCancel={handleCancel}
                        onSave={handleSave}
                        busyMessage={busyMsg}
                    />
                </div>
            ) : (
                <button
                    className="model-catalog-add-entry-button"
                    onClick={handleNewEntryClick}
                    disabled={editing}
                >
                    {/* <AddCircleOutlineIcon className="model-catalog-add-entry-icon" /> */}
                    Add new Model Catalog entry
                </button>
            )}
        </div>
    );
};
