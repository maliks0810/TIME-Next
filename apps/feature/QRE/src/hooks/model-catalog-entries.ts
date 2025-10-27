import * as tlog from '@tcw/tlog';
import { useCallback } from 'react';
import axios from 'axios';
import {
    ModelCatalogEntry,
    ModelCategorizationMap,
    ModelStates,
    SyncTypes,
} from '../types/model-catalog-types';
import { NoTrailingForwardSlash } from '../utils/url-utils';
import { ToCatMap, ToModelCatalogEntries, ToModelCatalogEntry } from '../utils/model-catalog-utils';
import { useModelCatalogAxiosContext } from '../contexts/model-catalog-axios-context';

// const categorizationMap: ModelCategorizationMap = {
//     'Regulatory Compliance': [
//         'Unspecified',
//         'Quantitative risk surveillance aligned with regulatory standards and supervisory expectations',
//     ],
//     'Regulatory Reporting': [
//         'Unspecified',
//         'Comprehensive monthly reporting of portfolio risk metrics and position exposures for client transparency and oversight',
//     ],
//     Unknown: ['Unspecified'],
// };

// const mapKeys = Object.keys(categorizationMap);

// let MC_TEST_DATA: ModelCatalogEntry[] = [
//     {
//         id: 'abc',
//         name: 'First Model',
//         kind: mapKeys[0],
//         purpose: categorizationMap[mapKeys[0]][0],
//         notes: 'This is an example of a test model',
//         owner: 'Branden Boucher',
//         permissions: {
//             view: false,
//             create: false,
//             edit: false,
//             clone: false,
//             delete: false,
//         },
//         apiUrl: 'www.tcw.com/this/is/some/really/long/url/to/see/what/happens/when/the/url/is/too/long/to/fit/in/the/area/supplied?junk=andhereisawholebunchmoreextratextthatisnotneededbutwillcausesomethinginterrestingtohappen',
//         state: ModelStates.experimental,
//         repository: { id: 1, url: 'www.abc.com' },
//         hub: { name: 'hub 1', lab: 'https://qrehub.np.tcw.com/user/branden.boucher@tcw.com/lab' },
//     },
//     {
//         id: 'def',
//         name: 'Second Model',
//         kind: mapKeys[0],
//         purpose: categorizationMap[mapKeys[0]][1],
//         notes: 'This is an example of a test model',
//         owner: 'Ryan Barriger',
//         permissions: {
//             view: true,
//             create: true,
//             edit: true,
//             clone: true,
//             delete: true,
//         },
//         apiUrl: 'www.google.com',
//         state: ModelStates.integration,
//         repository: { id: 2, url: 'www.def.com' },
//         hub: { name: 'hub 2', lab: '' },
//         synchronization: {
//             toGitlab: { user: 'bboucher' },
//             toHub: { user: 'mlee', timestamp: '9/29/2024 10:32:44.00Z-7' },
//         },
//     },
//     {
//         id: 'ghi',
//         name: 'Third Model',
//         kind: mapKeys[1],
//         purpose: categorizationMap[mapKeys[1]][0],
//         notes: 'This is an example of a test model',
//         owner: 'R2',
//         permissions: {
//             view: false,
//             create: false,
//             edit: false,
//             clone: false,
//             delete: false,
//         },
//         apiUrl: 'tcw.okta.com',
//         state: ModelStates.non_trading,
//         lastUpdatedBy: 'bouchb',
//         lastUpdated: new Date(),
//         repository: { id: 3, url: 'www.ghi.com' },
//         hub: { name: 'hub 3', lab: 'hub3' },
//         synchronization: { toHub: { user: 'mlee', timestamp: '9/29/2024 10:32:44.00Z-7' } },
//     },
//     {
//         id: 'jkl',
//         name: 'Last Model For Now',
//         kind: mapKeys[1],
//         purpose: categorizationMap[mapKeys[1]][1],
//         notes: 'This is an example of a test model',
//         owner: 'PE',
//         permissions: {
//             view: false,
//             create: false,
//             edit: true,
//             clone: false,
//             delete: false,
//         },
//         apiUrl: 'https://rickrolled.com/?title=Model+Catalog&desc=Verifying+access%E2%80%A6',
//         state: ModelStates.trading,
//         repository: { id: 4, url: 'www.jkl.com' },
//         hub: { name: 'hub 4', lab: 'hub4' },
//         synchronization: { toGitlab: { user: 'bboucher' } },
//     },
// ];

export const QRE_CONTENT_MGMT_URL = NoTrailingForwardSlash(import.meta.env.VITE_QRE_CONTENT_MGMT);
console.log(QRE_CONTENT_MGMT_URL)
export const MODELS_URL = QRE_CONTENT_MGMT_URL + '/catalog/models';
export const CONFIG_URL = QRE_CONTENT_MGMT_URL + '/configurations/model';
export const SYNC_SUFFIX = 'synchronize';

if (!QRE_CONTENT_MGMT_URL) {
    tlog.fatal('The base url for QRE Content Mgmt was not found.', 'model-catalog-entries');
}

export const useGetModelCategorizationMap = (): (() => Promise<ModelCategorizationMap>) => {
    //NOTE: This function fetches the entire configuration structure from the back end but only
    //returns the categorization data. If more types of data are added to the configuration,
    //it may be more efficient to make this function more generic to configuration instead of
    //specific to categorization within the configuration.
    return useCallback(async () => {
        return axios
            .get(CONFIG_URL)
            .then(async (response) => {
                return ToCatMap(response.data) ?? {};
            })
            .catch((err) => {
                tlog.error(
                    err,
                    'Unexpected Error while fetching model configs.',
                    'useGetModelCategorizationMap',
                    undefined,
                    { url: CONFIG_URL }
                );
                //Allow the UI to do something with the error
                throw err;
            });
    }, []);
};

export const useGetModelCatalogEntries = (): (() => Promise<ModelCatalogEntry[]>) => {
    return useCallback(async () => {
        return axios
            .get(MODELS_URL)
            .then(async (response) => {
                const entries = ToModelCatalogEntries(response.data) ?? {};
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
            tlog.info(`Saving model to catalog. id: ${idMsg}`, 'useAddModelCatalogEntry');
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
                    //Updating an entry will not return any new data for the entry
                    return createNew ? ToModelCatalogEntry(response.data) : entry;
                })
                .catch((err) => {
                    tlog.error(
                        err,
                        `Unexpected Error while saving model to catalog. id: ${idMsg}`,
                        'useAddModelCatalogEntry',
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
