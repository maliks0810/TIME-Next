import { serviceRequest } from '../../../lib/serviceUtils';
import { WorkflowConfig, WorkflowConfigRequest } from '../../../lib/types';
import { MetaDataResponse, WorkflowsCollection } from './types';

// Follows the exact pattern in src/lib/services.ts: a full URL built off the ARC service env var
// passed to serviceRequest(url)(), then a post/get with an empty relative path.
const getConfigsUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/configuration/get-all-configurations';
const getConfigHistoryByIdUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/configuration/get-configuration-history';
const createConfigUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/configuration/add-configuration';
const updateConfigUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/configuration/update-configuration';
const deleteConfigUrl =
    import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/configuration/delete';
const getMetaDataUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/reference-data/metaData';
const getWorkflowMetaDataUrl = import.meta.env.VITE_R2_TRAP_ARC_SERVICE + '/api/v1/reference-data/get-workflows';

export const getWorkflowConfigs = (): Promise<{ data: { response: WorkflowConfig[] } }> =>
    serviceRequest(getConfigsUrl)().post('');

export const getWorkflowConfigHistoryById = (
    id: number,
): Promise<{ data: { response: unknown } }> =>
    serviceRequest(getConfigHistoryByIdUrl)().post('', { configurationId: id });

export const createWorkflowConfig = (
    payload: WorkflowConfigRequest
): Promise<{ data: { response: WorkflowConfig } }> =>
    serviceRequest(createConfigUrl)().post('', payload);

export const updateWorkflowConfig = (
    id: number,
    payload: WorkflowConfigRequest
): Promise<{ data: { response: WorkflowConfig } }> =>
    serviceRequest(updateConfigUrl)().post('', { configurationId: id, ...payload });

export const deleteWorkflowConfig = (id: number): Promise<void> =>
    serviceRequest(deleteConfigUrl)().post('', { configurationId: id });

export const getMetaData = (
): Promise<{ data: MetaDataResponse }> =>
    serviceRequest(getMetaDataUrl)().post('');

export const getWorkflowMetaData = (
): Promise<{ data: WorkflowsCollection }> =>
    serviceRequest(getWorkflowMetaDataUrl)().post('');

