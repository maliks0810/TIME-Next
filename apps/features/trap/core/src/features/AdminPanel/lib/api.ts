/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { gql } from '../../../api/serviceUtils';
import { AdminCreateInput, AdminDeleteInput, AdminPatchInput } from './types';

const DEFAULT_CONTENT_TYPE = 'application/json';
const DEFAULT_TIMEOUT = 120000; // 2 min

export const generateUUID = (): string => crypto.randomUUID();

export const serviceRequest =
    (
        baseURL: string,
        contentType: string = DEFAULT_CONTENT_TYPE,
        timeout: number = DEFAULT_TIMEOUT
    ) =>
    () =>
        axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': contentType,
                'X-Correlation-ID': generateUUID(),
            },
        });

const getCoreAdminUrl = '/api/v1/admin';

export const getModelInputById = async (assetAnalyticsSetupId: number): Promise<{ data: any }> =>
    serviceRequest(getCoreAdminUrl)().post('', { assetAnalyticsSetupId });

export type Container = { id: string; partitionKey: string | null };

export const api = {
    query: (containerId: string, query: string, parameters?: any[]): any =>
        serviceRequest(`${getCoreAdminUrl}/${containerId}/search`)().post('', {
            query,
            parameters,
        }),
    deleteItem: (containerId: string, id: string) =>
        serviceRequest(`${getCoreAdminUrl}/${containerId}/${id}`)().delete(''),
};

export async function createAdminResource(input: { container: string; data: JSON }): Promise<any> {
    const res = await gql<{ CreateAdminResource: AdminCreateInput }>(
        `mutation CreateAdminResource($input: AdminCreateInput!) {
            createAdminResource(input: $input)
        }`,
        { input }
    );
    return res.CreateAdminResource;
}

export async function patchAdminResource(input: {
    container: string;
    id: string;
    patch: JSON;
}): Promise<any> {
    const res = await gql<{ PatchAdminResource: AdminPatchInput }>(
        `mutation PatchAdminResource($input: AdminPatchInput!) {
            patchAdminResource(input: $input)
        }`,
        { input }
    );
    return res.PatchAdminResource;
}

export async function deleteAdminResource(input: { container: string; id: string }): Promise<any> {
    const res = await gql<{ DeleteAdminResource: AdminDeleteInput }>(
        `mutation PatchAdminReDeleteAdminResourcesource($input: AdminDeleteInput!) {
            deleteAdminResource(input: $input)
        }`,
        { input }
    );
    return res.DeleteAdminResource;
}
