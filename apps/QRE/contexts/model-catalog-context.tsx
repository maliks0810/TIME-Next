import { createContext, Dispatch, ReactNode, useCallback, useContext, useState } from 'react';
import * as tlog from '@tcw/tlog';
import {
    ModelCatalogEntry,
    ModelCatalogFilterByValues,
    ModelCategorizationMap,
} from '../types/model-catalog-types';
import { SortableFields } from '../data/model-catalog-data';

const ModelCatalogSortContext = createContext<
    [
        { sortBy: SortableFields; sortDesc: boolean },
        Dispatch<{ sortBy: SortableFields; sortDesc: boolean }>,
    ]
>(null!);
const ModelCatalogFilterContext = createContext<
    [
        { value: string; field: string; userOwnedOnly: boolean },
        Dispatch<{ value: string; field: string; userOwnedOnly: boolean }>,
    ]
>(null!);
const ModelCatalogEntriesContext = createContext<
    [ModelCatalogEntry[], Dispatch<ModelCatalogEntry[]>]
>(null!);
const ModelCategorizationsContext = createContext<
    [ModelCategorizationMap, Dispatch<ModelCategorizationMap>]
>(null!);
const ModelCatalogLoadingContext = createContext<boolean>(false);
const SetModelCatalogLoadingContext = createContext<Dispatch<boolean>>(null!);
const ModelCatalogEntryCountsContext = createContext<
    [
        { entries: number; filteredEntries: number },
        Dispatch<{ entries: number; filteredEntries: number }>,
    ]
>(null!);
const ModelCatalogReloadTriggerContext = createContext<[() => void, Dispatch<() => void>]>(null!);

export const useModelCatalogSortContext = () => useContext(ModelCatalogSortContext);
export const useModelCatalogFilterContext = () => useContext(ModelCatalogFilterContext);
export const useModelCatalogEntriesContext = () => useContext(ModelCatalogEntriesContext);
export const useModelCategorizationsContext = () => useContext(ModelCategorizationsContext);
export const useModelCatalogLoadingContext = () => useContext(ModelCatalogLoadingContext);
export const useSetModelCatalogLoadingContext = () => useContext(SetModelCatalogLoadingContext);
export const useModelCatalogEntryCountsContext = () => useContext(ModelCatalogEntryCountsContext);
export const useModelCatalogReloadTriggerContext = () =>
    useContext(ModelCatalogReloadTriggerContext);

export const ModelCatalogProvider = (props: { children: ReactNode }) => {
    const { children } = props;
    const [loading, setLoading] = useState<boolean>(false);
    const [reloadTrigger, setReloadTrigger] = useState<{ cb: () => void }>({ cb: () => {} });
    const entryCounts = useState<{ entries: number; filteredEntries: number }>({
        entries: 0,
        filteredEntries: 0,
    });
    const entries = useState<ModelCatalogEntry[]>([]);
    const categorizations = useState<ModelCategorizationMap>({});
    const sorting = useState<{ sortBy: SortableFields; sortDesc: boolean }>({
        sortBy: '',
        sortDesc: false,
    });
    const filtering = useState<{ value: string; field: string; userOwnedOnly: boolean }>({
        value: '',
        field: ModelCatalogFilterByValues[ModelCatalogFilterByValues.Name],
        userOwnedOnly: false,
    });

    const callSetReloadTrigger = useCallback((cb: () => void) => {
        setReloadTrigger({ cb: cb });
    }, []);

    const callReloadTrigger = useCallback(() => {
        reloadTrigger.cb();
    }, [reloadTrigger]);

    return (
        <ModelCatalogSortContext.Provider value={sorting}>
            <ModelCatalogFilterContext.Provider value={filtering}>
                <ModelCatalogEntriesContext.Provider value={entries}>
                    <ModelCategorizationsContext.Provider value={categorizations}>
                        <ModelCatalogLoadingContext.Provider value={loading}>
                            <SetModelCatalogLoadingContext.Provider value={setLoading}>
                                <ModelCatalogEntryCountsContext.Provider value={entryCounts}>
                                    <ModelCatalogReloadTriggerContext.Provider
                                        value={[callReloadTrigger, callSetReloadTrigger]}
                                    >
                                        {children}
                                    </ModelCatalogReloadTriggerContext.Provider>
                                </ModelCatalogEntryCountsContext.Provider>
                            </SetModelCatalogLoadingContext.Provider>
                        </ModelCatalogLoadingContext.Provider>
                    </ModelCategorizationsContext.Provider>
                </ModelCatalogEntriesContext.Provider>
            </ModelCatalogFilterContext.Provider>
        </ModelCatalogSortContext.Provider>
    );
};
