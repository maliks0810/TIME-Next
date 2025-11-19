import { memo } from 'react';
import {
    Button,
    Link,
    Typography,
    Stack,
    Grid,
    Card,
    IconButton,
    CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import GitLabIcon from '../../../assets/gitlab.svg?react';
import JupyterIcon from '../../../assets/jupyter.svg?react';
import {
    ModelCatalogEntry,
    ModelStates,
    stateColor,
    SyncTypes,
} from '../../../types/model-catalog-types';
import {
    useEntryEditingContext,
    useSetEntryEditingContext,
} from '../../../contexts/model-catalog-entry-context';
import './grid-row.scss';

export const EntryPresentation = memo(
    (props: { entry: ModelCatalogEntry; userOwned?: boolean }) => {
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
            <Grid container columns={30} flexGrow={1}>
                <Grid size={9}>
                    <Card>
                        <CardContent>
                            <Stack direction="column" spacing={1}>
                                {disabled ? (
                                    <Typography variant="button" color="primary">
                                        {entry.name}
                                    </Typography>
                                ) : (
                                    <Button
                                        disabled={disabled}
                                        title={`Navigate to notebook at ${entry.hub.lab}`}
                                        onClick={handleNavToNotebook}
                                        endIcon={<ArrowForwardIcon fontSize="small" />}
                                        size="small"
                                    >
                                        {entry.name}
                                    </Button>
                                )}
                                <Typography color={stateColor[entry.state]}>
                                    {ModelStates[entry.state]}
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={15}>
                    <CardContent>
                        <Stack direction="column" spacing={3}>
                            <Typography variant="body2">{`${entry.kind}: ${entry.purpose}`}</Typography>
                            <Stack direction="row" spacing={1}>
                                <Typography variant="subtitle2" color="primary">
                                    Api:
                                </Typography>
                                <Link href={entry.apiUrl} rel="noreferrer" target="_blank">
                                    {entry.apiUrl}
                                </Link>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Grid>
                <Grid size={6}>
                    <CardContent>
                        <Typography variant="body2">{entry.owner.fullName}</Typography>
                    </CardContent>
                </Grid>
                <Grid size={24}>
                    <Stack direction="row" spacing={1}>
                        <Typography variant="subtitle2" color="primary">
                            Notes:
                        </Typography>
                        <Typography variant="body2">{entry.notes}</Typography>
                    </Stack>
                </Grid>
                <Grid size={6}>
                    {entry.lastUpdatedBy && (
                        <Typography variant="caption" color="success">
                            {`Updated by ${
                                entry.lastUpdatedBy
                            } on ${entry.lastUpdated?.toLocaleDateString?.()} ${entry.lastUpdated?.toLocaleTimeString?.()}`}
                        </Typography>
                    )}
                </Grid>
            </Grid>
        );
    }
);
EntryPresentation.displayName = 'EntryPresentation';

export const EntryActions = memo(
    (props: {
        startEdit: (copying: boolean) => void;
        startDelete: () => void;
        copyOnly?: boolean;
    }) => {
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
            <Stack direction="column" spacing={0}>
                <IconButton
                    className="model-catalog-entry-action-button"
                    title="Edit Model Entry"
                    onClick={handleEdit}
                    hidden={copyOnly}
                    color="secondary"
                    disabled={editing}
                >
                    <DriveFileRenameOutlineIcon fontSize="small" />
                </IconButton>
                <IconButton
                    className="model-catalog-entry-action-button"
                    title="Copy Model Entry"
                    onClick={handleCopy}
                    color="secondary"
                    disabled={editing}
                >
                    <CopyAllIcon fontSize="small" />
                </IconButton>
                <IconButton
                    className="model-catalog-entry-action-button"
                    title="Delete Model Entry"
                    onClick={handleDelete}
                    hidden={copyOnly}
                    color="secondary"
                    disabled={editing}
                >
                    <DeleteForeverIcon fontSize="small" />
                </IconButton>
            </Stack>
        );
    }
);

EntryActions.displayName = 'EntryActions';

export const EntrySync = memo(
    (props: { startSync: (syncType: SyncTypes) => void; hidden?: boolean }) => {
        const { startSync, hidden } = props;
        const disabled = useEntryEditingContext();

        const handleSyncToJupyter = () => {
            startSync(SyncTypes.ToJupyter);
        };

        const handleSyncToGitlab = () => {
            startSync(SyncTypes.ToGitlab);
        };

        console.debug('EntrySync rendering');
        return (
            <Stack direction="column" spacing={2}>
                <IconButton
                    className="model-catalog-entry-action-button"
                    color="secondary"
                    title="Sync To Gitlab"
                    onClick={handleSyncToGitlab}
                    disabled={disabled}
                    hidden={hidden}
                >
                    <ArrowForwardIcon fontSize="small" />
                    <GitLabIcon className="model-catalog-entry-action-icon" />
                </IconButton>
                <IconButton
                    className="model-catalog-entry-action-button"
                    color="secondary"
                    title="Sync To JupyterLab"
                    onClick={handleSyncToJupyter}
                    disabled={disabled}
                    hidden={hidden}
                >
                    <JupyterIcon className="model-catalog-entry-action-icon" />
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
            </Stack>
        );
    }
);

EntrySync.displayName = 'EntrySync';
