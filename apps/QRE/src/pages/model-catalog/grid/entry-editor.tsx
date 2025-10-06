import { CircularProgress } from '@mui/material';
import { useRef, useState } from 'react';
import { WaitingEllipses } from '../../../../components/waiting-ellipses';
import {
    ModelCatalogEntry,
    ModelCategorization,
    ModelStates,
} from '../../../../types/model-catalog-types';
import { isNameInvalid } from '../../../../utils/model-catalog-utils';
import { useUserInfo } from '@platform/utils';
import {
    useModelCatalogEntriesContext,
    useModelCategorizationsContext,
} from '../../../../contexts/model-catalog-context';
import { CategorizationSelect, EnumSelect, PermissionsSelect } from '../selects/selects';
import './entry-editor.scss';

export const ModelCatalogEntryEditor = (props: {
    entry?: ModelCatalogEntry;
    copying?: boolean;
    busyMessage?: string | null;
    onSave?: (entry: ModelCatalogEntry) => void;
    onCancel?: () => void;
}) => {
    const { entry, copying, busyMessage, onSave, onCancel } = props;
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
        nameRef.current = entry.name;
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
        const filteredEntries = copying || !entry ? entries : entries.filter((e) => e.id != entry.id);
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
                owner: {email: user.email, fullName: user.name ?? '', id: user.id ?? ''},
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
        <div className="model-catalog-entry-editor">
            {busyMessage && (
                <div className="model-catalog-busy-container">
                    <div className="model-catalog-busy-text">
                        <WaitingEllipses
                            prefix={busyMessage ?? 'Please wait'}
                            maintainWidth={true}
                        />
                    </div>
                    {/* couldn't get the 'track' prop to work on CircularProgress, so this is a work-around */}
                    <div className="model-catalog-busy-progress">
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            id="background-progress"
                        />
                        <CircularProgress id="foreground-progress" />
                    </div>
                </div>
            )}
            {copying && (
                <div className="model-catalog-entry-copying">{`Copying from model '${entry?.name}'`}</div>
            )}
            <div className="model-catalog-editor-field-group">
                <div className="model-catalog-editor-field" aria-label="name">
                    <div className="model-catalog-editor-field-title">
                        Name
                        <span
                            className="model-catalog-editor-name-invalid"
                            aria-hidden={!nameInvalid}
                        >
                            --Name is require and must be unique--
                        </span>
                    </div>
                    <input
                        name="entryName"
                        type="text"
                        data-form-type="other"
                        className="model-catalog-edit-input"
                        defaultValue={nameRef.current}
                        onChange={(e) => {
                            nameRef.current = e.target.value;
                        }}                   
                        maxLength={56}
                    />
                </div>
                <div className="model-catalog-editor-field" aria-label="state">
                    <div className="model-catalog-editor-field-title">State</div>
                    <EnumSelect
                        values={stateVals}
                        defaultSelected={stateRef.current}
                        onSelected={(v) => {
                            stateRef.current = v;
                        }}
                    />
                </div>
                <div className="model-catalog-editor-field" aria-label="cat">
                    <div className="model-catalog-editor-field-title">Kind/Purpose</div>
                    <CategorizationSelect
                        map={catMap}
                        defaultSelected={catRef.current}
                        onSelected={(m) => {
                            catRef.current = m;
                        }}
                    />
                </div>
                {/* <div className="model-catalog-editor-field" aria-label="permissions">
                    <div className="model-catalog-editor-field-title">Permissions</div>
                    <PermissionsSelect
                        current={permissionsRef.current}
                        onSelected={(p) => (permissionsRef.current = p)}
                    />
                </div> */}
            </div>
            <div className="model-catalog-editor-field-group">
                <div className="model-catalog-editor-field" aria-label="url">
                    <div className="model-catalog-editor-field-title">API URL</div>
                    <input
                        name="entryApi"
                        type="text"
                        data-form-type="other"
                        className="model-catalog-edit-input long"
                        defaultValue={apiRef.current}
                        onChange={(e) => {
                            apiRef.current = e.target.value;
                        }}
                    />
                </div>
                <div className="model-catalog-editor-field" aria-label="notes">
                    <div className="model-catalog-editor-field-title">Notes</div>
                    <input
                        name="entryNotes"
                        type="text"
                        data-form-type="other"
                        className="model-catalog-edit-input long"
                        defaultValue={notesRef.current}
                        onChange={(e) => {
                            notesRef.current = e.target.value;
                        }}
                    />
                </div>
            </div>

            <div className="model-catalog-edit-actions">
                <button className="model-catalog-edit-action-button" onClick={handleSaveClick}>
                    Save
                </button>
                <button className="model-catalog-edit-action-button" onClick={() => onCancel?.()}>
                    Cancel
                </button>
            </div>
        </div>
    );
};
