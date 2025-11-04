import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRef, useState } from 'react';
import { BlockContainer } from '../../components/block-container';
import './model-catalog.scss';
import { FilterInput } from '../../components/filter';
import { ModelCatalogFilterByValues } from '../../types/model-catalog-types';
import {
    ModelCatalogProvider,
    useModelCatalogEntryCountsContext,
    useModelCatalogFilterContext,
    useModelCatalogLoadingContext,
    useModelCatalogReloadTriggerContext,
} from '../../contexts/model-catalog-context';
import {
    ModelCatalogEntryProvider,
    useEntryBusyContext,
    useEntryEditingContext,
} from '../../contexts/model-catalog-entry-context';
import { ModelCatalogAxiosContextProvider } from '../../contexts/model-catalog-axios-context';
import { QREAuthorization } from '../../components/qre-authorization';
import { useQreUserAuthorizationsContext } from '../../contexts/qre-user-authorizations';
import { EnumSelect } from './selects/selects';
import { ModelCatalogGrid } from './grid/grid';
import { SettingsDialog } from './dialogs/settings-dialog';

const APP_RESOURCE = 'application';
const ADMIN_ACTION = 'admin';

const ModelCatalogRowCount = () => {
    const counts = useModelCatalogEntryCountsContext()[0];
    const loading = useModelCatalogLoadingContext();

    console.debug('ModelCatalogRowCount rendering');

    return (
        <div className="model-catalog-entry-counts">
            {loading ? '' : `Showing ${counts.filteredEntries} of ${counts.entries}`}
        </div>
    );
};

const ModelCatalogRefresh = (props: { disabled?: boolean }) => {
    const trigger = useModelCatalogReloadTriggerContext()[0];
    const loading = useModelCatalogLoadingContext();
    const disabled = props.disabled || loading;

    console.debug('ModelCatalogRefresh rendering', disabled);

    return (
        <button
            onClick={trigger}
            className="model-catalog-refresh-button"
            disabled={disabled}
            title="Refresh Model Catalog"
        >
            <RefreshIcon className="model-catalog-refresh-icon" />
        </button>
    );
};

const ModelCatalogSettings = (props: { disabled?: boolean; hidden?: boolean }) => {
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const loading = useModelCatalogLoadingContext();
    const disabled = props.disabled || loading;

    console.debug('ModelCatalogSettings rendering', disabled);

    const handleSettingsClicked = () => {
        setSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setSettingsOpen(false);
    };

    return (
        <>
            <SettingsDialog open={settingsOpen} onClose={handleSettingsClose} />
            <button
                aria-hidden={props.hidden}
                className="model-catalog-settings-button"
                title="Click here to manage settings like: Categorizations"
                onClick={handleSettingsClicked}
                disabled={disabled}
            >
                <SettingsIcon className="model-catalog-settings-icon" />
            </button>
        </>
    );
};

const ModelCatalogFilter = (props: { disabled?: boolean }) => {
    const values = Object.keys(ModelCatalogFilterByValues).filter((key) => isNaN(Number(key)));
    const [filter, setFilter] = useModelCatalogFilterContext();
    const loading = useModelCatalogLoadingContext();
    const disabled = props.disabled || loading;
    const userOwnedRef = useRef<HTMLInputElement>(null);

    console.debug('ModelCatalogFilter rendering', disabled);

    const handleValueChange = (value: string) => {
        console.log('val changed', value);
        setFilter({ ...filter, value: value });
    };
    const handleFieldChange = (value: string) => {
        console.log('field changed', value);
        setFilter({ ...filter, field: value });
    };
    const handleUserOwnedClicked = () => {
        if (disabled) {
            return;
        }
        console.log('field changed', userOwnedRef.current?.checked);
        setFilter({ ...filter, userOwnedOnly: userOwnedRef.current?.checked ?? false });
    };

    return (
        <div className="model-catalog-filter">
            <div className="model-catalog-filter-title">Filter:</div>
            <FilterInput
                filter={filter.value}
                onFilterChanged={handleValueChange}
                placeholder="Filter value"
                disabled={disabled}
            />
            <div className="model-catalog-filter-title">By:</div>
            <EnumSelect
                values={values}
                defaultSelected="Name"
                onSelected={handleFieldChange}
                disabled={disabled}
            />
            <div
                className="model-catalog-filter-user-owned"
                onClick={handleUserOwnedClicked}
                aria-disabled={disabled}
            >
                <label htmlFor="userOwnedOnlyCheckbox">Show only my models</label>
                <input
                    type="checkbox"
                    title="Show only the models that I own"
                    id="userOwnedOnlyCheckbox"
                    disabled={disabled}
                    ref={userOwnedRef}
                />
            </div>
        </div>
    );
};

const ModelCatalogHeader = () => {
    const entryBusy = useEntryBusyContext();
    const entryEditing = useEntryEditingContext();
    const auths = useQreUserAuthorizationsContext()[0];
    const disabled = entryBusy || entryEditing;
    const isAdmin =
        auths.results?.find((s) => s.resource == APP_RESOURCE && s.action == ADMIN_ACTION)
            ?.authorized ?? false;

    console.debug('ModelCatalogHeader rendering');

    return (
        <div className="model-catalog-header">
            <div className="model-catalog-header-title block-title">Model Catalog</div>
            <ModelCatalogSettings disabled={disabled || !isAdmin} hidden={!isAdmin} />
            <ModelCatalogFilter disabled={disabled} />
            <ModelCatalogRowCount />
            <ModelCatalogRefresh disabled={disabled} />
        </div>
    );
};

const ModelCatalog = () => {
    console.debug('ModelCatalog rendering');

    return (
        <ModelCatalogProvider>
            <ModelCatalogEntryProvider>
                <ModelCatalogAxiosContextProvider>
                    <QREAuthorization>
                        <BlockContainer
                            title={<ModelCatalogHeader />}
                            className="full-screen-block"
                        >
                            <ModelCatalogGrid />
                        </BlockContainer>
                    </QREAuthorization>
                </ModelCatalogAxiosContextProvider>
            </ModelCatalogEntryProvider>
        </ModelCatalogProvider>
    );
};

export default ModelCatalog;