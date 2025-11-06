//NOTE: Attempting to use MUI components to make switching to these easier when moving to TIME 2
import {
    Button,
    Paper,
    CardHeader,
    Dialog,
    List,
    ListItem,
    TextField,
    Card,
    Stack,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCallback, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useModelCategorizationsContext } from '../../../contexts/model-catalog-context';
import './settings-dialog.scss';
import { useSaveModelCategorizationMap } from '../../../hooks/model-catalog-entries';
import { AlertSeverity } from '../../../types/alert-types';
import { useUpdateAlertInfoContext } from '../../../contexts/alert-context';
import { ModelCategorizationMap } from '../../../types/model-catalog-types';

type CatListItem = { kind: string; purposes: string[] };

const CatList = (props: { kinds: CatListItem[]; setKinds: (kinds: CatListItem[]) => void }) => {
    const { kinds, setKinds } = props;
    const [lastAddedKindIndex, setLastAddedKindIndex] = useState<number | null>(-1);

    const handleKindChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number
    ) => {
        kinds[index].kind = e.target.value;
        setLastAddedKindIndex(null);
        setKinds([...kinds]);
    };

    const handlePurposeChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
        kindIndex: number
    ) => {
        kinds[kindIndex].purposes[index] = e.target.value;
        setLastAddedKindIndex(null);
        setKinds([...kinds]);
    };

    const handleAddPurpose = (
        _e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        kindIndex: number
    ) => {
        kinds[kindIndex].purposes = ['', ...kinds[kindIndex].purposes];
        setLastAddedKindIndex(kindIndex);
        setKinds([...kinds]);
    };

    const handleDeletePurpose = (
        _e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        index: number,
        kindIndex: number
    ) => {
        kinds[kindIndex].purposes.splice(index, 1);
        setKinds([...kinds]);
    };

    const handleDeleteKind = (
        _e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        index: number
    ) => {
        if (kinds[index].purposes.filter((p) => p.trim().length > 0).length > 0) {
            return;
        }

        kinds.splice(index, 1);
        setKinds([...kinds]);
    };

    return (
        <List>
            {kinds.map((k, ki) => (
                <ListItem key={ki} className="cat-settings-item-kind">
                    <Stack direction="column" spacing={0} flexGrow={1}>
                        <Stack direction="row" spacing={1}>
                            <IconButton
                                className="cat-settings-action-kind"
                                onClick={(e) => handleDeleteKind(e, ki)}
                                disabled={k.purposes.filter((p) => p.trim().length > 0).length > 0}
                                title="Delete this Kind"
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>

                            <TextField
                                value={k.kind}
                                onChange={(e) => handleKindChange(e, ki)}
                                size="small"
                                placeholder="kind"
                                inputRef={(e) => {
                                    if (ki == 0 && lastAddedKindIndex != null) {
                                        e?.focus();
                                    }
                                }}
                                error={
                                    k.kind.trim().length == 0 &&
                                    k.purposes.filter((p) => p.trim().length > 0).length > 0
                                }
                                required={true}
                            />

                            <Button
                                className="cat-settings-action-kind"
                                startIcon={<AddCircleOutlineIcon fontSize="small" />}
                                onClick={(e) => handleAddPurpose(e, ki)}
                            >
                                Add Purpose
                            </Button>
                        </Stack>
                        <List>
                            {k.purposes.map((p, pi) => (
                                <ListItem key={pi} className="cat-settings-item-purpose">
                                    <Stack direction="row" spacing={1} flexGrow={1}>
                                        <IconButton
                                            onClick={(e) => handleDeletePurpose(e, pi, ki)}
                                            title="Delete this Purpose"
                                            className="cat-settings-action-purpose"
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>

                                        <TextField
                                            fullWidth
                                            value={p}
                                            onChange={(e) => handlePurposeChange(e, pi, ki)}
                                            size="small"
                                            placeholder="purpose"
                                            variant="standard"
                                            inputRef={(e) => {
                                                if (pi == 0 && ki == lastAddedKindIndex) {
                                                    e?.focus();
                                                }
                                            }}
                                        />
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    </Stack>
                </ListItem>
            ))}
        </List>
    );
};

export const SettingsDialog = (props: { open: boolean; onClose: () => void }) => {
    const { open, onClose } = props;
    const saveMap = useSaveModelCategorizationMap();
    const alerts = useUpdateAlertInfoContext();
    const [map, setMap] = useModelCategorizationsContext();
    const [busy, setBusy] = useState<boolean>(false);
    const [kinds, setKinds] = useState<CatListItem[]>([]);
    //Disable save if there is a Kind with associated Purposes but no name
    const disableSave =
        kinds.filter(
            (k) =>
                k.kind.trim().length == 0 &&
                k.purposes.filter((p) => p.trim().length > 0).length > 0
        ).length > 0;

    console.debug('Rendering SettingsDialog');

    const onClick = (accept: boolean) => {
        if (!accept) {
            //reset on cancel
            loadKinds();
        } else {
            saveKinds();
        }

        onClose();
    };

    const loadKinds = useCallback(() => {
        const newKinds: CatListItem[] = Object.entries(map).map((e) => ({
            kind: e[0],
            purposes: [...e[1]],
        }));
        setKinds(newKinds);
    }, [map]);

    const saveKinds = async () => {
        setBusy(true);

        const newMap: ModelCategorizationMap = {};
        kinds
            .filter(
                (k) =>
                    k.kind.trim().length > 0 &&
                    k.purposes.filter((p) => p.trim().length > 0).length > 0
            )
            .forEach((k) => {
                newMap[k.kind] = k.purposes.filter((p) => p.trim().length > 0);
            });

        saveMap(newMap)
            .then(() => {
                setMap(newMap);
                onClose();
                alerts({
                    severity: AlertSeverity.SUCCESS,
                    title: 'Categorizations updated',
                });
            })
            .catch((err) => {
                alerts({
                    severity: AlertSeverity.ERROR,
                    title: 'An error occurred while saving changes to the categorizations',
                    message: err.message,
                });
            })
            .finally(() => setBusy(false));
    };

    useEffect(() => {
        loadKinds();
    }, [loadKinds, map]);

    const handleAddKind = (_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setKinds([{ kind: '', purposes: [''] }, ...kinds]);
    };

    return (
        <Dialog open={open} maxWidth="xl" fullWidth={true}>
            <DialogTitle variant="h4" color="primary">
                Model Catalog Settings
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" spacing={1}>
                    <Dialog open={busy} maxWidth="sm" fullWidth={true}>
                        <DialogContent>
                            <Stack
                                direction="column"
                                spacing={5}
                                flexGrow={1}
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Typography variant="h5" color="primary">
                                    Saving Model Categorizations. Please wait.
                                </Typography>
                                <CircularProgress enableTrackSlot size={64} />
                            </Stack>
                        </DialogContent>
                    </Dialog>

                    <Paper elevation={3} variant="elevation">
                        <Card variant="outlined">
                            <Stack direction="row" spacing={2}>
                                <CardHeader title="Model Categorizations"></CardHeader>
                                <Button
                                    onClick={handleAddKind}
                                    color="secondary"
                                    startIcon={<AddCircleOutlineIcon fontSize="small" />}
                                >
                                    Add Kind
                                </Button>
                            </Stack>

                            <CatList kinds={kinds} setKinds={setKinds} />
                        </Card>
                    </Paper>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                            onClick={() => onClick(true)}
                            disabled={disableSave}
                            color="primary"
                            variant="outlined"
                        >
                            Save
                        </Button>
                        <Button onClick={() => onClick(false)} color="primary" variant="outlined">
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};
