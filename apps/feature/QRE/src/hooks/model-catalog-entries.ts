import * as tlog from '@tcw/tlog';
import { useCallback } from 'react';
import axios from 'axios';
import {
    AnyData,
    ModelCatalogEntry,
    ModelCategorizationMap,
    ModelStates,
    SyncTypes,
} from '../types/model-catalog-types';
import { NoTrailingForwardSlash } from '../utils/url-utils';
import {
    flattenCatMap,
    toCatMap,
    toModelCatalogEntries,
    toModelCatalogEntry,
} from '../utils/model-catalog-utils';
import { useModelCatalogAxiosContext } from '../contexts/model-catalog-axios-context';

export const QRE_CONTENT_MGMT_URL = NoTrailingForwardSlash(import.meta.env.VITE_CONTENT_MGMT);
export const MODELS_URL = QRE_CONTENT_MGMT_URL + '/catalog/models';
export const CONFIG_URL = QRE_CONTENT_MGMT_URL + '/configurations/model';
export const SYNC_SUFFIX = 'synchronize';

if (!QRE_CONTENT_MGMT_URL) {
    tlog.fatal('The base url for QRE Content Mgmt was not found.', 'model-catalog-entries');
}

export const useGetAllConfigs = (): (() => Promise<AnyData>) => {
    return useCallback(async () => {
        return axios
            .get(CONFIG_URL)
            .then(async (response) => {
                return response.data;
            })
            .catch((err) => {
                tlog.error(
                    err,
                    'Unexpected Error while fetching model catalogue configs.',
                    'useGetAllConfigs',
                    undefined,
                    { url: CONFIG_URL }
                );
                //Allow the UI to do something with the error
                throw err;
            });
    }, []);
};

export const useUpdateAllConfigs = (): ((configs: AnyData) => Promise<void>) => {
    const axios = useModelCatalogAxiosContext();
    return useCallback(
        async (configs: AnyData) => {
            return axios()
                .post(CONFIG_URL, configs)
                .then(async () => {}) //nothing else to do here
                .catch((err) => {
                    tlog.error(
                        err,
                        'Unexpected Error while updating model catalogue configs.',
                        'useUpdateAllConfigs',
                        undefined,
                        { url: CONFIG_URL }
                    );
                    //Allow the UI to do something with the error
                    throw err;
                });
        },
        [axios]
    );
};

export const useGetModelCategorizationMap = (): (() => Promise<ModelCategorizationMap>) => {
    //NOTE: This function fetches the entire configuration structure from the back end but only
    //returns the categorization data. If more types of data are added to the configuration,
    //it may be more efficient to make this function more generic to configuration instead of
    //specific to categorization within the configuration.
    const getConfigs = useGetAllConfigs();
    return useCallback(async () => {
        return getConfigs()
            .then((configs) => {
                return toCatMap(configs) ?? {};
            })
            .catch((err) => {
                tlog.error(
                    err,
                    'Unexpected Error while fetching model catalog categorizations.',
                    'useGetModelCategorizationMap',
                    undefined,
                    { url: CONFIG_URL }
                );
                //Allow the UI to do something with the error
                throw err;
            });
    }, [getConfigs]);
};

export const useSaveModelCategorizationMap = (): ((
    map: ModelCategorizationMap
) => Promise<void>) => {
    //NOTE: This function fetches the entire configuration structure from the back end first
    //so that it only updates the categorizations section.
    const getConfigs = useGetAllConfigs();
    const updateConfigs = useUpdateAllConfigs();

    return useCallback(
        async (map: ModelCategorizationMap) => {
            getConfigs()
                .then((configs) => {
                    configs.categorizations = flattenCatMap(map);
                    //let the catch block handle AnyData other errors
                    updateConfigs(configs);
                })
                .catch((err) => {
                    tlog.error(
                        err,
                        'Unexpected Error while updating model catalog categorizations.',
                        'useSaveModelCategorizationMap',
                        undefined,
                        { url: CONFIG_URL }
                    );
                    //Allow the UI to do something with the error
                    throw err;
                });
        },
        [getConfigs, updateConfigs]
    );
};

export const useGetModelCatalogEntries = (): (() => Promise<ModelCatalogEntry[]>) => {
    return useCallback(async () => {
        return axios
            .get(MODELS_URL)
            .then(async (response) => {
                const entries = toModelCatalogEntries(response.data) ?? {};
                console.info(entries);
                return entries;
            })
            .catch((err) => {
                tlog.error(
                    err,
                    'Unexpected Error while fetching catalog.',
                    'useGetModelCatalogEntries',
                    undefined,
                    { url: MODELS_URL }
                );
                //Allow the UI to do something with the error
                throw err;
            });
    }, []);
};

//NOTE: this calls a different http method based on the entry having an id or not
//No Id indicates a new entry so put will be used to create a new entry
export const useSaveEntry = (): ((entry: ModelCatalogEntry) => Promise<ModelCatalogEntry>) => {
    const axios = useModelCatalogAxiosContext();
    return useCallback(
        async (entry: ModelCatalogEntry) => {
            const createNew = !entry.id;
            const idMsg = createNew ? 'new model' : entry.id;
            const method = createNew ? axios().put : axios().post;
            const url = `${MODELS_URL}${createNew ? '' : '/' + entry.id}`;
            tlog.info(`Saving model to catalog. id: ${idMsg}`, 'useSaveEntry');
            const body = {
                name: entry.name,
                kind: entry.kind,
                purpose: entry.purpose,
                apiUrl: entry.apiUrl,
                state: ModelStates[entry.state],
                permissions: entry.permissions,
                notes: entry.notes,
            };

            return method(url, body)
                .then(async (response) => {
                    //Updating an entry will not return AnyData new data for the entry
                    return createNew ? toModelCatalogEntry(response.data) : entry;
                })
                .catch((err) => {
                    tlog.error(
                        err,
                        `Unexpected Error while saving model to catalog. id: ${idMsg}`,
                        'useSaveEntry',
                        undefined,
                        { url: url }
                    );
                    //Allow the UI to do something with the error
                    throw err;
                });
        },
        [axios]
    );
};

export const useCopyEntry = (): ((
    entry: ModelCatalogEntry,
    sourceProject: ModelCatalogEntry
) => Promise<ModelCatalogEntry>) => {
    const axios = useModelCatalogAxiosContext();
    return useCallback(
        async (entry: ModelCatalogEntry, sourceProject: ModelCatalogEntry) => {
            const url = `${MODELS_URL}/${sourceProject.id}/copy`;
            tlog.info(
                `Copying model project ${sourceProject.name}, id: ${sourceProject.id}`,
                'useCopyEntry'
            );
            const body = {
                target: sourceProject.repository.id,
                name: entry.name,
                kind: entry.kind,
                purpose: entry.purpose,
                apiUrl: entry.apiUrl,
                state: ModelStates[entry.state],
                permissions: entry.permissions,
                notes: entry.notes,
            };

            return axios()
                .post(url, body)
                .then(async (response) => {
                    //Updating an entry will not return AnyData new data for the entry
                    return toModelCatalogEntry(response.data);
                })
                .catch((err) => {
                    tlog.error(
                        err,
                        `Unexpected Error while copying model project ${sourceProject.name}, id: ${sourceProject.id}`,
                        'useCopyEntry',
                        undefined,
                        { url: url }
                    );
                    //Allow the UI to do something with the error
                    throw err;
                });
        },
        [axios]
    );
};

export const useDeleteModelCatalogEntry = (): ((entry: ModelCatalogEntry) => Promise<void>) => {
    const axios = useModelCatalogAxiosContext();
    return useCallback(
        async (entry: ModelCatalogEntry) => {
            const url = `${MODELS_URL}/${entry.id}`;
            return axios()
                .delete(url)
                .then(() => {}) //Nothing to do in the .then block
                .catch((err) => {
                    tlog.error(
                        err,
                        `Unexpected Error while deleting model ${entry.id}`,
                        'useGetModelCatalogEntries',
                        undefined,
                        { url: url }
                    );
                    //Allow the UI to do something with the error
                    throw err;
                });
        },
        [axios]
    );
};

export const useSynchronize = (): ((
    entry: ModelCatalogEntry,
    syncType: SyncTypes
) => Promise<void>) => {
    const axios = useModelCatalogAxiosContext();
    return useCallback(
        async (entry: ModelCatalogEntry, syncType: SyncTypes) => {
            const direction = syncType == SyncTypes.ToJupyter ? 'hub' : 'velocity';

            tlog.info(`Syncing notebook. Direction: ${direction}`, 'useSynchronize');

            const body = {
                direction: direction,
                instance: entry.instance,
                gitlabProjectId: entry.repository.id,
                gitlabRepositoryUrl: entry.repository.url,
            };
            const url = `${MODELS_URL}/${entry.id}/${SYNC_SUFFIX}`;

            return axios()
                .post(url, body)
                .then(() => {}) //Nothing to do in the .then block
                .catch((err) => {
                    tlog.error(
                        err,
                        `Unexpected Error while synchronizing. Direction: ${direction}`,
                        'useSynchronize',
                        undefined,
                        { url: url }
                    );
                    //Allow the UI to do something with the error
                    throw err;
                });
        },
        [axios]
    );
};
