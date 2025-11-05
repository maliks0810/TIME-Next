import { memo } from 'react';
import { Button, Card, Link, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import GitLabIcon from '../../../assets/gitlab.svg?react';
import JupyterIcon from '../../../assets/jupyter.svg?react';
import { ModelCatalogEntry, ModelStates, SyncTypes } from '../../../types/model-catalog-types';
import {
    useEntryEditingContext,
    useSetEntryEditingContext,
} from '../../../contexts/model-catalog-entry-context';
import './grid-row.scss';

export const EntryPresentation = memo((props: { entry: ModelCatalogEntry, userOwned?: boolean }) => {
    const { entry, userOwned } = props;
    const disabled = entry.hub.lab.length < 1 || !userOwned;
    console.debug('EntryPresentation rendering');
    // const selectedText = entry.permissions.join(', ') || 'No Permissions';

    const handleNavToNotebook = () => {
        if (entry.hub.lab) {
            window.open(entry.hub.lab, '_blank', 'noreferrer');
        }
    };

    return (
        <>
            <div className="model-catalog-grid-row-col" aria-label="entry">
                <div className="model-catalog-entry-details-row">
                    <Card className="model-catalog-entry-name-state">
                        <Button
                            className="model-catalog-entry-name-button"
                            disabled={disabled}
                            title={disabled ? '' : `Navigate to notebook at ${entry.hub.lab}`}
                            onClick={handleNavToNotebook}
                        >
                            {entry.name}
                            <ArrowForwardIcon className="model-catalog-entry-name-icon" />
                        </Button>
                        <Typography className="model-catalog-entry-state" aria-level={entry.state}>
                            {ModelStates[entry.state]}
                        </Typography>
                    </Card>
                    <div className="model-catalog-entry-details-col">
                        <div className="model-catalog-entry-details-row">
                            <Typography className="model-catalog-entry-categorization">
                                {`${entry.kind}: ${entry.purpose}`}
                            </Typography>

                            <Typography className="model-catalog-entry-owner">{entry.owner.fullName}</Typography>
                            {/* <div className="model-catalog-entry-permissions">
                                {selectedText}
                            </div> */}
                        </div>
                        <div className="model-catalog-entry-api model-catalog-entry-with-title">
                            <Typography>Api: </Typography>
                            <Link href={entry.apiUrl} rel="noreferrer" target="_blank">
                                {entry.apiUrl}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="model-catalog-entry-details-row">
                    <div className="model-catalog-entry-notes model-catalog-entry-with-title">
                        <Typography>Notes: </Typography>
                        <Typography>{entry.notes}</Typography>
                    </div>
                    {entry.lastUpdatedBy && (
                        <Typography
                            className="model-catalog-entry-last-updated"
                            aria-hidden={!Boolean(entry.lastUpdatedBy)}
                        >
                            {`Updated by ${
                                entry.lastUpdatedBy
                            } on ${entry.lastUpdated?.toLocaleDateString?.()} ${entry.lastUpdated?.toLocaleTimeString?.()}`}
                        </Typography>
                    )}
                </div>
            </div>
        </>
    );
});
EntryPresentation.displayName = 'EntryPresentation';

export const EntryActions = memo(
    (props: { startEdit: (copying: boolean) => void; startDelete: () => void; copyOnly?: boolean}) => {
        const { startEdit, startDelete, copyOnly } = props;
        const setEditing = useSetEntryEditingContext();
        const editing = useEntryEditingContext();
        
        const handleEdit = () => {
            setEditing(true);
            startEdit(false);
        };

        const handleCopy = () => {
            setEditing(true);
            startEdit(true);
        };

        const handleDelete = () => {
            startDelete();
        };
        console.debug('EntryActions rendering');
        return (
            <div className="model-catalog-grid-row-col" aria-label="mod">
                {!editing && (
                    <>
                        <Button
                            className="model-catalog-entry-action-button"
                            title="Edit Model Entry"
                            onClick={handleEdit}
                            aria-hidden={copyOnly}
                        >
                            <DriveFileRenameOutlineIcon className="model-catalog-entry-action-icon" />
                        </Button>
                        <Button
                            className="model-catalog-entry-action-button"
                            title="Copy Model Entry"
                            onClick={handleCopy}
                        >
                            <CopyAllIcon className="model-catalog-entry-action-icon" />
                        </Button>
                        <Button
                            className="model-catalog-entry-action-button"
                            title="Delete Model Entry"
                            onClick={handleDelete}
                            aria-hidden={copyOnly}
                        >
                            <DeleteForeverIcon className="model-catalog-entry-action-icon" />
                        </Button>
                    </>
                )}
            </div>
        );
    }
);

EntryActions.displayName = 'EntryActions';

export const EntrySync = memo((props: { startSync: (syncType: SyncTypes) => void, hidden?: boolean }) => {
    const { startSync, hidden} = props;
    const disabled = useEntryEditingContext();

    const handleSyncToJupyter = () => {
        startSync(SyncTypes.ToJupyter);
    };

    const handleSyncToGitlab = () => {
        startSync(SyncTypes.ToGitlab);
    };

    console.debug('EntrySync rendering');
    return (
        <div className="model-catalog-grid-row-col" aria-label="sync" aria-hidden={hidden}>
            {!disabled && (
                <>
                    <Button
                        className="model-catalog-entry-action-button"
                        title="Sync To Gitlab"
                        onClick={handleSyncToGitlab}
                    >
                        <ArrowForwardIcon
                            className="model-catalog-entry-action-icon"
                            aria-label="small-arrow-left"
                        />
                        <GitLabIcon className="model-catalog-entry-action-icon" />
                    </Button>
                    <Button
                        className="model-catalog-entry-action-button"
                        title="Sync To JupyterLab"
                        onClick={handleSyncToJupyter}
                    >
                        <JupyterIcon className="model-catalog-entry-action-icon" />
                        <ArrowBackIcon
                            className="model-catalog-entry-action-icon"
                            aria-label="small-arrow-right"
                        />
                    </Button>
                </>
            )}
        </div>
    );
});

EntrySync.displayName = 'EntrySync';
