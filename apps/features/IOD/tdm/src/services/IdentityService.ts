import { getApiBaseUrl } from '../constants/environments';
import { IUserIdentity, IUserAuth, UserAuthResponse } from './domain-objects/UserIdentityResponse';

const API_BASE_URL = getApiBaseUrl();


export const IdentityService = {
  fetchUserIdentity: async (userEmail: string): Promise<IUserIdentity> => {
    const queryParams = new URLSearchParams({ userEmail });
    const url = `${API_BASE_URL}/identity?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to fetch user identity (${response.status}): ${errorText}`

      );
    }

    return response.json() as Promise<IUserIdentity>;
  },

  fetchUserAuth: async (
    userFullName: string,
    userEmail: string,
    userToken: string)
  : Promise<IUserAuth> => {
    const queryParams = new URLSearchParams({ userFullName, userEmail });
    const url = `${API_BASE_URL}/identity/userauth?${queryParams.toString()}`;

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

    const result = await response.json();
    const mapped = transformUserAuthResponse(result);
    return mapped;
  }
}

export const transformUserAuthResponse = (apiData: UserAuthResponse): IUserAuth => {
  return {
    userId: apiData.userAuth?.userId,
    userFullName: apiData.userAuth?.userFullName,
    userEmail: apiData.userAuth?.userEmail,
    permissionsAllowed: {
      cancel_request: apiData.userAuth?.permissionsAllowed?.cancel_request || false,
      cancel_request_after_submission: apiData.userAuth?.permissionsAllowed?.cancel_request_after_submission || false,
      confirm_request: apiData.userAuth?.permissionsAllowed?.confirm_request || false,
      duplicate_request: apiData.userAuth?.permissionsAllowed?.duplicate_request || false,
      explicit_dm_analyst_assignment: apiData.userAuth?.permissionsAllowed?.explicit_dm_analyst_assignment || false,
      ssap_release: apiData.userAuth?.permissionsAllowed?.ssap_release || false,
    }
  }
}