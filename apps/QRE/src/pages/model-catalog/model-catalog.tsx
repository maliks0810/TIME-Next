import RefreshIcon from '@mui/icons-material/Refresh';
import { useRef } from 'react';
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
import { EnumSelect } from './selects/selects';
import { ModelCatalogGrid } from './grid/grid';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react'

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

const ModelCatalogRefresh = () => {
    const trigger = useModelCatalogReloadTriggerContext()[0];
    const entryBusy = useEntryBusyContext();
    const entryEditing = useEntryEditingContext();
    const loading = useModelCatalogLoadingContext();
    const disabled = entryBusy || entryEditing || loading;

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

const ModelCatalogHeader = () => {
    const values = Object.keys(ModelCatalogFilterByValues).filter((key) => isNaN(Number(key)));
    const [filter, setFilter] = useModelCatalogFilterContext();
    const entryBusy = useEntryBusyContext();
    const entryEditing = useEntryEditingContext();
    const disabled = entryBusy || entryEditing;
    const userOwnedRef = useRef<HTMLInputElement>(null);

    console.debug('ModelCatalogHeader rendering');

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
        setFilter({...filter, userOwnedOnly: userOwnedRef.current?.checked ?? false});
    }

    return (
        <div className="model-catalog-header">
            <div className="model-catalog-header-title block-title">Model Catalog</div>
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
                <div className="model-catalog-filter-user-owned" onClick={handleUserOwnedClicked} aria-disabled={disabled}>
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
            <ModelCatalogRowCount />
            <ModelCatalogRefresh />
        </div>
    );
};

export default function ModelCatalog() {
    console.debug('ModelCatalog rendering');

    return (
        <ModelCatalogProvider>
            <ModelCatalogEntryProvider>
                <BlockContainer title={<ModelCatalogHeader />} className="full-screen-block">
                    <ModelCatalogAxiosContextProvider>
                        <ModelCatalogGrid />
                    </ModelCatalogAxiosContextProvider>
                </BlockContainer>
            </ModelCatalogEntryProvider>
        </ModelCatalogProvider>
    );
};
