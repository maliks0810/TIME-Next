import { Grid, Stack, TextField } from '@mui/material';
import { useRef, useState } from 'react';
import { Button, Typography } from '@mui/material';
import {
    ModelCatalogEntry,
    ModelCategorization,
    ModelStates,
} from '../../../types/model-catalog-types';
import { isNameInvalid } from '../../../utils/model-catalog-utils';
import { useUserInfo } from '@platform/utils';
import {
    useModelCatalogEntriesContext,
    useModelCategorizationsContext,
} from '../../../contexts/model-catalog-context';
import { CategorizationSelect, EnumSelect } from '../selects/selects';
import './entry-editor.scss';

export const ModelCatalogEntryEditor = (props: {
    entry?: ModelCatalogEntry;
    copying?: boolean;
    onSave?: (entry: ModelCatalogEntry) => void;
    onCancel?: () => void;
}) => {
    const { entry, copying, onSave, onCancel } = props;
    const [nameInvalid, setNameInvalid] = useState<boolean>(false);
    const user = useUserInfo();
    const entries = useModelCatalogEntriesContext()[0];
    const catMap = useModelCategorizationsContext()[0];
    const userId = user.id || user.login || user.name || 'unknown user';
    const nameRef = useRef<string>('');
    const stateRef = useRef<string>(ModelStates[ModelStates.experimental]);
    const catRef = useRef<ModelCategorization>({
        kind: 'Unknown',
        purpose: 'Unspecified',
    });
    const apiRef = useRef<string>('');
    const notesRef = useRef<string>('');
    const permissionsRef = useRef<string[]>([]);

    const stateVals = Object.keys(ModelStates).filter((key) => isNaN(Number(key)));

    console.debug('ModelCatalogEntryEditor render', stateVals);

    if (entry) {
        console.debug('editing entry', entry);
        nameRef.current = entry.name + (copying ? '-copy' : '');
        stateRef.current = ModelStates[entry.state];
        catRef.current = { kind: entry.kind, purpose: entry.purpose };
        apiRef.current = entry.apiUrl;
        notesRef.current = entry.notes;
        permissionsRef.current = entry.permissions;
    }

    const handleSaveClick = () => {
        if (!onSave) {
            return;
        }

        //If we are just editing, filter out the current entry
        //so we don't check for uniqueness against itself
        const filteredEntries =
            copying || !entry ? entries : entries.filter((e) => e.id != entry.id);
        const invalid = isNameInvalid(filteredEntries, nameRef.current);

        if (invalid) {
            setNameInvalid(true);
            return;
        }

        if (!entry || copying) {
            const newEntry: ModelCatalogEntry = {
                id: '',
                instance: '',
                name: nameRef.current,
                state: ModelStates[stateRef.current as keyof typeof ModelStates],
                kind: catRef.current.kind,
                purpose: catRef.current.purpose,
                apiUrl: apiRef.current,
                notes: notesRef.current,
                owner: { email: user.email, fullName: user.name ?? '', id: user.id ?? '' },
                permissions: permissionsRef.current,
                lastUpdatedBy: userId,
                lastUpdated: new Date(),
                repository: { id: -1, url: '' },
                hub: { name: '', lab: '' },
            };
            onSave(newEntry);
            return;
        }

        entry.name = nameRef.current;
        entry.state = ModelStates[stateRef.current as keyof typeof ModelStates];
        entry.kind = catRef.current.kind;
        entry.purpose = catRef.current.purpose;
        entry.apiUrl = apiRef.current;
        entry.notes = notesRef.current;
        entry.permissions = permissionsRef.current;
        entry.lastUpdatedBy = userId;
        entry.lastUpdated = new Date();

        onSave(entry);
    };

    //If entry is undefined, assume new
    return (
        <Grid container spacing={2} columns={18}>
            {copying && (
                <Grid size={12}>
                    <Typography variant="subtitle1">{`Copying from model '${entry?.name}'`}</Typography>
                </Grid>
            )}
            <Grid size={7}>
                <TextField
                    fullWidth
                    label="Name"
                    size="small"
                    color="primary"
                    data-form-type="other"
                    variant="outlined"
                    required={true}
                    placeholder="require and must be unique"
                    defaultValue={nameRef.current}
                    onChange={(e) => {
                        nameRef.current = e.target.value;
                    }}
                    slotProps={{
                        htmlInput: { maxLength: 56 },
                        inputLabel: {
                            shrink: true,
                        },
                    }}
                    error={nameInvalid}
                    helperText={nameInvalid && 'must be unique'}
                />
            </Grid>
            <Grid size={2}>
                <EnumSelect
                    fillWidth={true}
                    values={stateVals}
                    defaultSelected={stateRef.current}
                    onSelected={(v) => {
                        stateRef.current = v;
                    }}
                    label="State"
                />
            </Grid>
            <Grid size={9}>
                <CategorizationSelect
                    map={catMap}
                    defaultSelected={catRef.current}
                    onSelected={(m) => {
                        catRef.current = m;
                    }}
                    label="Kind: Purpose"
                />
            </Grid>
            <Grid size={8}>
                <TextField
                    fullWidth
                    label="API URL"
                    size="small"
                    color="primary"
                    data-form-type="other"
                    variant="outlined"
                    defaultValue={apiRef.current}
                    onChange={(e) => {
                        apiRef.current = e.target.value;
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                    }}
                />
            </Grid>
            <Grid size={10}>
                <TextField
                    fullWidth
                    label="Notes"
                    size="small"
                    color="primary"
                    data-form-type="other"
                    variant="outlined"
                    defaultValue={notesRef.current}
                    onChange={(e) => {
                        notesRef.current = e.target.value;
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                    }}
                />
            </Grid>
            <Grid size={18}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="contained" color="primary" onClick={handleSaveClick}>
                        Save
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => onCancel?.()}>
                        Cancel
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    );
};
