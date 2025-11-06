import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { ChangeEvent, useState } from 'react';
import {
    Paper,
    Checkbox,
    FormControlLabel,
    Typography,
    IconButton,
    Stack,
    Card,
    CardContent,
} from '@mui/material';
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
        <Typography>
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
        <IconButton onClick={trigger} disabled={disabled} title="Refresh Model Catalog">
            <RefreshIcon fontSize="small" color="secondary" />
        </IconButton>
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
            <IconButton
                title="Click here to manage settings like: Categorizations"
                onClick={handleSettingsClicked}
                disabled={disabled}
                hidden={props.hidden}
            >
                <SettingsIcon fontSize="small" color="secondary" />
            </IconButton>
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

    return (
        <Stack direction="row" spacing={1} flexGrow={1} justifyContent="center">
            <FilterInput
                filter={filter.value}
                onFilterChanged={handleValueChange}
                placeholder="Filter value"
                disabled={disabled}
                label="Filter"
            />

            <EnumSelect
                values={values}
                defaultSelected="Name"
                onSelected={handleFieldChange}
                disabled={disabled}
                label="By"
            />

            <FormControlLabel
                control={
                    <Checkbox onChange={handleUserOwnedClicked} color="primary" size="medium" />
                }
                label="Show only my models"
                labelPlacement="start"
                title="Show only the models that I own"
                disabled={disabled}
            />
        </Stack>
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
        <Card variant="outlined">
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5" color="primary">
                        Model Catalog
                    </Typography>
                    <ModelCatalogSettings disabled={disabled || !isAdmin} hidden={!isAdmin} />
                    <ModelCatalogFilter disabled={disabled} />
                    <ModelCatalogRowCount />
                    <ModelCatalogRefresh disabled={disabled} />
                </Stack>
            </CardContent>
        </Card>
    );
};

const ModelCatalog = () => {
    console.debug('ModelCatalog rendering');

    return (
        <ModelCatalogProvider>
            <ModelCatalogEntryProvider>
                <ModelCatalogAxiosContextProvider>
                    <QREAuthorization>
                        <Paper
                            elevation={3}
                            variant="elevation"
                            square={false}
                            className="page-base"
                        >
                            <ModelCatalogHeader />
                            <ModelCatalogGrid />
                        </Paper>
                    </QREAuthorization>
                </ModelCatalogAxiosContextProvider>
            </ModelCatalogEntryProvider>
        </ModelCatalogProvider>
    );
};

export default ModelCatalog;
