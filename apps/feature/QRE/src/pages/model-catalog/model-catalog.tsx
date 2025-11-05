import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { ChangeEvent, useState } from 'react';
import { Button, Card, Checkbox, FormControlLabel, Typography } from '@mui/material';
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
        <Typography className="model-catalog-entry-counts">
            {loading ? '' : `Showing ${counts.filteredEntries} of ${counts.entries}`}
        </Typography>
    );
};

const ModelCatalogRefresh = (props: { disabled?: boolean }) => {
    const trigger = useModelCatalogReloadTriggerContext()[0];
    const loading = useModelCatalogLoadingContext();
    const disabled = props.disabled || loading;

    console.debug('ModelCatalogRefresh rendering', disabled);

    return (
        <Button
            onClick={trigger}
            className="model-catalog-refresh-button"
            disabled={disabled}
            title="Refresh Model Catalog"
        >
            <RefreshIcon className="model-catalog-refresh-icon" />
        </Button>
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
            <Button
                aria-hidden={props.hidden}
                className="model-catalog-settings-button"
                title="Click here to manage settings like: Categorizations"
                onClick={handleSettingsClicked}
                disabled={disabled}
            >
                <SettingsIcon className="model-catalog-settings-icon" />
            </Button>
        </>
    );
};

const ModelCatalogFilter = (props: { disabled?: boolean }) => {
    const values = Object.keys(ModelCatalogFilterByValues).filter((key) => isNaN(Number(key)));
    const [filter, setFilter] = useModelCatalogFilterContext();
    const loading = useModelCatalogLoadingContext();
    const disabled = props.disabled || loading;

    console.debug('ModelCatalogFilter rendering', disabled);

    const handleValueChange = (value: string) => {
        console.log('val changed', value);
        setFilter({ ...filter, value: value });
    };
    const handleFieldChange = (value: string) => {
        console.log('field changed', value);
        setFilter({ ...filter, field: value });
    };
    const handleUserOwnedClicked = (_e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        if (disabled) {
            return;
        }
        console.log('checked changed', checked);
        setFilter({ ...filter, userOwnedOnly: checked });
    };
//TODO: change EnumSelect to Mui
    return (
        <div className="model-catalog-filter">
            <Typography className="model-catalog-filter-title">Filter:</Typography>
            <FilterInput
                filter={filter.value}
                onFilterChanged={handleValueChange}
                placeholder="Filter value"
                disabled={disabled}
            />
            <Typography className="model-catalog-filter-title">By:</Typography>
            <EnumSelect
                values={values}
                defaultSelected="Name"
                onSelected={handleFieldChange}
                disabled={disabled}
            />
            <div className="model-catalog-filter-user-owned" aria-disabled={disabled}>
                <FormControlLabel
                    required
                    control={<Checkbox onChange={handleUserOwnedClicked} />}
                    label="Show only my models"
                    labelPlacement="start"
                    title="Show only the models that I own"
                    disabled={disabled}
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
            <Typography>Model Catalog</Typography>
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
                        <Card>
                            <ModelCatalogHeader />
                            <ModelCatalogGrid />
                        </Card>
                    </QREAuthorization>
                </ModelCatalogAxiosContextProvider>
            </ModelCatalogEntryProvider>
        </ModelCatalogProvider>
    );
};

export default ModelCatalog;
