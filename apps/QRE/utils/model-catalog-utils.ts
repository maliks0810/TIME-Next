import { SortableFields } from '../data/model-catalog-data';
import {
    ModelCatalogFilterByValues,
    ModelCatalogEntry,
    ModelStates,
    ModelCategorizationMap,
    ModelCategorization,
} from '../types/model-catalog-types';

export const isNameInvalid = (
    entries: ModelCatalogEntry[],
    name?: string
): boolean => {
    return (name ?? '').length < 1 || (entries.filter((e) => e.name == name).length > 0);
};

export const filterEntries = (
    entries: ModelCatalogEntry[] | undefined,
    value: string,
    field: string,
    ownedByEmail?: string,
): ModelCatalogEntry[] => {
    if (!entries) {
        return [];
    }

    if (!value && !ownedByEmail) {
        return entries;
    }

    console.log('filtering ', value, field, ownedByEmail);

    const by = ModelCatalogFilterByValues[field as keyof typeof ModelCatalogFilterByValues];

    const preFiltered = ownedByEmail ? entries.filter((e) => e.owner.email.toLowerCase() == ownedByEmail.toLowerCase()) : entries;

    switch (by) {
        case ModelCatalogFilterByValues.Name:
            return preFiltered?.filter((e) => e.name.toLowerCase().includes(value.toLowerCase()));
        case ModelCatalogFilterByValues.State:
            return preFiltered?.filter((e) =>
                ModelStates[e.state].toLowerCase().includes(value.toLowerCase())
            );
        case ModelCatalogFilterByValues.Kind:
            return preFiltered?.filter((e) => e.kind.toLowerCase().includes(value.toLowerCase()));
        case ModelCatalogFilterByValues.Purpose:
            return preFiltered?.filter((e) => e.purpose.toLowerCase().includes(value.toLowerCase()));
        case ModelCatalogFilterByValues.Owner:
            return ownedByEmail ? preFiltered : preFiltered?.filter((e) => e.owner.fullName.toLowerCase().includes(value.toLowerCase()));
        case ModelCatalogFilterByValues.Notes:
            return preFiltered?.filter((e) => e.notes.toLowerCase().includes(value.toLowerCase()));
        case ModelCatalogFilterByValues['API URL']:
            return preFiltered?.filter((e) => e.apiUrl.toLowerCase().includes(value.toLowerCase()));
        case ModelCatalogFilterByValues.Permissions:
            return preFiltered?.filter(
                (e) =>
                    Object.entries(e.permissions).find(
                        ([k, v]) => k.toLowerCase().includes(value.toLowerCase()) && v
                    ) != undefined
            );
        case ModelCatalogFilterByValues['Updated By']:
            return preFiltered?.filter((e) =>
                // !Boolean(e.lastUpdateBy) ||
                e.lastUpdatedBy?.toLowerCase().includes(value.toLowerCase())
            );
        case ModelCatalogFilterByValues['Updated On']:
            return preFiltered?.filter((e) =>
                // !Boolean(e.lastUpdatedOn) ||
                e.lastUpdated?.toLocaleDateString().startsWith(value.toLowerCase())
            );
        default:
            return preFiltered;
    }
};

export const sortEntries = (
    entries: ModelCatalogEntry[] | null | undefined,
    sortBy: SortableFields | null,
    sortDesc?: boolean
): ModelCatalogEntry[] => {
    if (!entries) {
        return [];
    }

    return entries?.sort((a, b) => {
        const _a = sortDesc ? b : a;
        const _b = sortDesc ? a : b;

        switch (sortBy) {
            case 'Name':
                return _a.name.localeCompare(_b.name);
            case 'Owner':
                return _a.owner.fullName.localeCompare(_b.owner.fullName);
            case 'Kind':
                return _a.kind.localeCompare(_b.kind);
            case 'Purpose':
                return _a.purpose.localeCompare(_b.purpose);
            case 'State':
                return ModelStates[_a.state].localeCompare(ModelStates[_b.state]);
            default:
                return 0;
        }
    });
};

export const ToCatMap = (data?: any): ModelCategorizationMap => {
    const catMap: ModelCategorizationMap = {};

    if (!data) {
        return catMap;
    }

    (data.categorizations as ModelCategorization[]).forEach((c) => {
        if (!catMap[c.kind]) {
            catMap[c.kind] = [];
        }

        catMap[c.kind].push(c.purpose);
    });

    return catMap;
};

export const ToModelCatalogEntries = (data?: any): ModelCatalogEntry[] => {
    if (!data?.results) {
        return [];
    }

    return (data.results as any[]).map((r) => ToModelCatalogEntry(r));
};

export const ToModelCatalogEntry = (data?: any): ModelCatalogEntry => {
    return {
        ...data,
        state: data.state == 'experiment' ? ModelStates.experimental : ModelStates[data.state],
        lastUpdated: new Date(data.lastUpdated),
    } as ModelCatalogEntry;
};
