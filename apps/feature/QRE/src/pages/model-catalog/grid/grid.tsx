import { useCallback, useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
    useModelCatalogEntryCountsContext,
    useModelCatalogEntriesContext,
    useModelCatalogFilterContext,
    useModelCatalogLoadingContext,
    useModelCatalogSortContext,
    useModelCategorizationsContext,
    useSetModelCatalogLoadingContext,
    useModelCatalogReloadTriggerContext,
} from '../../../contexts/model-catalog-context';
import { ModelCatalogEntry } from '../../../types/model-catalog-types';
import {
    useEntryBusyContext,
    useEntryEditingContext,
    useSetEntryBusyContext,
} from '../../../contexts/model-catalog-entry-context';
import {
    useGetModelCatalogEntries,
    useSaveEntry,
    useGetModelCategorizationMap,
    useCopyEntry,
} from '../../../hooks/model-catalog-entries';
import { WaitingEllipses } from '../../../components/waiting-ellipses';
import { DialogTypes, DialogWrapper } from '../dialogs/dialogs';
import { SortableFields } from '../../../data/model-catalog-data';
import { filterEntries, sortEntries } from '../../../utils/model-catalog-utils';
import { AlertSeverity } from '../../../types/alert-types';
import { useUpdateAlertInfoContext } from '../../../contexts/alert-context';
import { useUserInfo } from '@platform/utils';
import { useQreUserAuthorizationsContext } from '../../../contexts/qre-user-authorizations';
import { ModelCatalogGridRow, ModelCatalogNewEntryRow } from './grid-row';
import './grid.scss';

const ModelCatalogGridHeader = () => {
    const [sort, setSort] = useModelCatalogSortContext();
    const DirIcon = sort.sortDesc ? KeyboardArrowDownIcon : KeyboardArrowUpIcon;
    const entryBusy = useEntryBusyContext();
    const entryEditing = useEntryEditingContext();
    const disabled = entryBusy || entryEditing;

    console.debug('ModelCatalogGridHeader rendering');

    const getIcon = (name: string) => (
        <DirIcon className="model-catalog-sort-icon" aria-hidden={sort.sortBy != name} />
    );

    const handleSort = (name: SortableFields) => {
        let newSortDesc = false;
        if (sort.sortBy == name) {
            newSortDesc = !sort.sortDesc;
        }

        setSort({ sortBy: name, sortDesc: newSortDesc });
    };

    const SortButton = (name: SortableFields) => (
        <button
            onClick={() => handleSort(name)}
            className="model-catalog-sort-button"
            disabled={disabled}
        >
            {name}
            {getIcon(name)}
        </button>
    );

    return (
        <div className="model-catalog-grid-header">
            <div className="model-catalog-grid-header-col" aria-label="mod">
                Mod.
            </div>
            <div className="model-catalog-grid-header-col" aria-label="name">
                <div className="model-catalog-grid-header-group">
                    {SortButton('Name')}/{SortButton('State')}
                </div>
            </div>
            <div className="model-catalog-grid-header-col" aria-label="cat">
                <div className="model-catalog-grid-header-group">
                    {SortButton('Kind')}:{SortButton('Purpose')}
                </div>
            </div>
            <div className="model-catalog-grid-header-col" aria-label="owner">
                {SortButton('Owner')}
            </div>
            {/* <div className="model-catalog-grid-header-col" aria-label="permissions">
                <div>Permissions</div>
            </div> */}
            <div className="model-catalog-grid-header-col" aria-label="sync">
                Sync
            </div>
        </div>
    );
};

const LoadMessage = (props: { failed: boolean }) => {
    const { failed } = props;
    return (
        <div className="model-catalog-load-message">
            {failed ? (
                <div className="model-catalog-load-error">
                    An error occurred while loading the Model Catalog
                </div>
            ) : (
                <div className="model-catalog-loading">
                    <WaitingEllipses prefix={'Loading Model Catalog'} />{' '}
                </div>
            )}
        </div>
    );
};

export const ModelCatalogGrid = () => {
    const [entries, setEntries] = useModelCatalogEntriesContext();
    const getEntries = useGetModelCatalogEntries();
    const getCatMap = useGetModelCategorizationMap();
    const setLoading = useSetModelCatalogLoadingContext();
    const setCatMap = useModelCategorizationsContext()[1];
    const loading = useModelCatalogLoadingContext();
    const [loadError, setLoadError] = useState<boolean>(false);
    const [dialogType, setDialogType] = useState<DialogTypes>(DialogTypes.None);
    const [dialogEntry, setDialogEntry] = useState<ModelCatalogEntry | null>(null);
    const setBusy = useSetEntryBusyContext();
    const saveEntry = useSaveEntry();
    const copyEntry = useCopyEntry();
    const sort = useModelCatalogSortContext()[0];
    const filter = useModelCatalogFilterContext()[0];
    const setCounts = useModelCatalogEntryCountsContext()[1];
    const setTrigger = useModelCatalogReloadTriggerContext()[1];
    const user = useUserInfo();
    const userAuth = useQreUserAuthorizationsContext()[0];

    const sortedAndFiltered = sortEntries(
        filterEntries(
            entries,
            filter.value,
            filter.field,
            filter.userOwnedOnly ? user.email : undefined
        ),
        sort.sortBy,
        sort.sortDesc
    );
    const alert = useUpdateAlertInfoContext();

    console.debug('ModelCatalogGrid rendering');

    const handleSyncToGitlab = (entry: ModelCatalogEntry) => {
        setDialogEntry(entry);
        setDialogType(DialogTypes.ToGitlab);
    };
    const handleSyncToJupyter = (entry: ModelCatalogEntry) => {
        setDialogEntry(entry);
        setDialogType(DialogTypes.ToJupyter);
    };

    const handleDelete = (entry: ModelCatalogEntry) => {
        setDialogEntry(entry);
        setDialogType(DialogTypes.Delete);
    };

    const loadCatalog = useCallback(async () => {
        setLoading(true);
        setLoadError(false);
        getEntries()
            .then((entries) => {
                setEntries(entries);
            })
            .catch((err) => {
                alert({
                    severity: AlertSeverity.ERROR,
                    title: 'An error occurred while loading the Model Catalog entries',
                    message: err.message,
                });
                setLoadError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [alert, getEntries, setEntries, setLoading]);

    const loadAll = useCallback(async () => {
        const all = Promise.all([getEntries(), getCatMap()]);
        setLoading(true);
        setLoadError(false);
        all.then((data) => {
            setEntries(data[0]);
            setCatMap(data[1]);
        })
            .catch((err) => {
                alert({
                    severity: AlertSeverity.ERROR,
                    title: 'An error occurred while loading the Model Catalog',
                    message: err.message,
                });
                setLoadError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [alert, getCatMap, getEntries, setCatMap, setEntries, setLoading]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    useEffect(() => {
        setCounts({ entries: entries.length, filteredEntries: sortedAndFiltered.length });
    }, [entries.length, setCounts, sortedAndFiltered.length]);

    useEffect(() => {
        setTrigger(loadCatalog);
    }, [loadCatalog, setTrigger]);

    const handleSave = async (entry: ModelCatalogEntry): Promise<boolean> => {
        setBusy(true);
        return saveEntry(entry)
            .then(() => {
                loadCatalog();
                return true;
            })
            .catch((err) => {
                alert({
                    severity: AlertSeverity.ERROR,
                    title: 'An error occurred while saving the Model',
                    message: err.message,
                });
                return false;
            })
            .finally(() => {
                setBusy(false);
            });
    };

    const handleCopy = async (
        newEntry: ModelCatalogEntry,
        sourceEntry: ModelCatalogEntry
    ): Promise<boolean> => {
        setBusy(true);
        return copyEntry(newEntry, sourceEntry)
            .then(() => {
                loadCatalog();
                return true;
            })
            .catch((err) => {
                alert({
                    severity: AlertSeverity.ERROR,
                    title: 'An error occurred while copying the Model',
                    message: err.message,
                });
                return false;
            })
            .finally(() => {
                setBusy(false);
            });
    };

    const handleDialogFinished = (reload: boolean) => {
        setDialogEntry(null);
        setDialogType(DialogTypes.None);
        if (reload) {
            loadCatalog();
        }
    };

    return (
        <div className="model-catalog-grid-container">
            <ModelCatalogGridHeader />
            {loading ? (
                <LoadMessage failed={loadError} />
            ) : (
                <>
                <ModelCatalogNewEntryRow onSave={handleSave} />
                <div className="model-catalog-grid">
                    
                    {sortedAndFiltered.map((e, i) => (
                        <ModelCatalogGridRow
                            entry={e}
                            key={i}
                            onSyncToGitlab={handleSyncToGitlab}
                            onSyncToJupyter={handleSyncToJupyter}
                            onSave={(newE, c) => (c ? handleCopy(newE, e) : handleSave(newE))}
                            onDelete={handleDelete}
                            userAuth={userAuth}
                        />
                    ))}
                </div>
                </>
            )}
            <DialogWrapper
                dialogType={dialogType}
                entry={dialogEntry}
                onFinished={handleDialogFinished}
            />
        </div>
    );
};
