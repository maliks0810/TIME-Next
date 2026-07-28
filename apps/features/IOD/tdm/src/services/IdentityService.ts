import { getApiBaseUrl } from '../constants/environments';
import { IUserIdentity } from './domain-objects/UserIdentityResponse';

const API_BASE_URL = getApiBaseUrl();


export const IdentityService = {
  fetchUserIdentity: async (
    userFullName: string,
    userEmail: string,
    userToken: string)
  : Promise<IUserIdentity> => {
    const queryParams = new URLSearchParams({ userFullName, userEmail });
    const url = `${API_BASE_URL}/identity?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to fetch user auth (${response.status}): ${errorText}`
      );
    }

    return response.json() as Promise<IUserIdentity>;
  }
}