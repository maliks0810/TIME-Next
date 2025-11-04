//NOTE: Attempting to use MUI components to make switching to these easier when moving to TIME 2
import { Button, Card, CardHeader, Dialog, List, ListItem, TextField } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCallback, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { useModelCategorizationsContext } from '../../../contexts/model-catalog-context';
import { WaitingEllipses } from '../../../components/waiting-ellipses';
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

    const handleAddKind = (_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setLastAddedKindIndex(-1);
        setKinds([{ kind: '', purposes: [''] }, ...kinds]);
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
        <>
            {' '}
            <Button className="cat-settings-list-item-add-button kind" onClick={handleAddKind}>
                <AddCircleOutlineIcon className="cat-settings-list-add-icon kind" />
                Add Kind
            </Button>
            <List className="cat-settings-list kind">
                {kinds.map((k, ki) => (
                    <ListItem key={ki} className="cat-settings-list-item kind">
                        <div className="cat-settings-list-item-container kind">
                            <Button
                                className="cat-settings-list-item-delete-button kind"
                                onClick={(e) => handleDeleteKind(e, ki)}
                                disabled={k.purposes.filter((p) => p.trim().length > 0).length > 0}
                                title="Delete this Kind"
                            >
                                <DeleteOutlineIcon className="cat-settings-list-item-delete-icon kind" />
                            </Button>
                            <TextField
                                value={k.kind}
                                onChange={(e) => handleKindChange(e, ki)}
                                className="cat-settings-list-item-text kind"
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
                                className="cat-settings-list-item-add-button purpose"
                                onClick={(e) => handleAddPurpose(e, ki)}
                            >
                                <AddCircleOutlineIcon className="cat-settings-list-add-icon purpose" />
                                Add Purpose
                            </Button>
                        </div>
                        <List className="cat-settings-list purpose">
                            {k.purposes.map((p, pi) => (
                                <ListItem key={pi} className="cat-settings-list-item purpose">
                                    <div className="cat-settings-list-item-container purpose">
                                        <Button
                                            className="cat-settings-list-item-delete-button purpose"
                                            onClick={(e) => handleDeletePurpose(e, pi, ki)}
                                            title="Delete this Purpose"
                                        >
                                            <DeleteOutlineIcon className="cat-settings-list-item-delete-icon purpose" />
                                        </Button>
                                        <TextField
                                            value={p}
                                            onChange={(e) => handlePurposeChange(e, pi, ki)}
                                            className="cat-settings-list-item-text purpose"
                                            placeholder="purpose"
                                            variant="standard"
                                            inputRef={(e) => {
                                                if (pi == 0 && ki == lastAddedKindIndex) {
                                                    e?.focus();
                                                }
                                            }}
                                        />
                                    </div>
                                </ListItem>
                            ))}
                        </List>
                    </ListItem>
                ))}
            </List>
        </>
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
            onClose();
        } else {
            saveKinds();
        }
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

    return (
        <Dialog open={open} className="mod-cat-settings-dialog">
            {busy && (
                <div className="mod-cat-settings-busy-container">
                    <div className="mod-cat-settings-busy-text">
                        <WaitingEllipses
                            prefix="Saving Model Categorizations"
                            maintainWidth={true}
                        />
                    </div>
                    {/* couldn't get the 'track' prop to work on CircularProgress, so this is a work-around */}
                    <div className="mod-cat-settings-busy-progress">
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            id="background-progress"
                        />
                        <CircularProgress id="foreground-progress" />
                    </div>
                </div>
            )}
            <div className="mod-cat-settings-dialog-header popup-header">
                Model Catalog Settings
            </div>
            <div className="mod-cat-settings-dialog-content">
                <Card className="mod-cat-settings-container">
                    <div className="block-top" />
                    <CardHeader title="Model Categorizations"></CardHeader>
                    {/* <KindList map={tempMap} ref={kindListRef} /> */}
                    <CatList kinds={kinds} setKinds={setKinds} />
                </Card>
                <div className="mod-cat-settings-buttons">
                    <Button
                        className="mod-cat-settings-button responsive-button"
                        onClick={() => onClick(true)}
                        disabled={disableSave}
                    >
                        Save
                    </Button>
                    <Button
                        className="mod-cat-settings-button responsive-button"
                        onClick={() => onClick(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
