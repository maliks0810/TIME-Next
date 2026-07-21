import { getApiBaseUrl } from '../constants/environments';
import { IUserIdentity, IUserAuth } from './domain-objects/UserIdentityResponse';

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
    //const queryParams = new URLSearchParams({ userFullName, userEmail });
    //const url = `${API_BASE_URL}/identity/userauth?${queryParams.toString()}`;

    /*const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to fetch user identity (${response.status}): ${errorText}`
      );
    }

    return response.json() as Promise<IUserAuth>;
    */

    return {
      "userId": userToken,
      "userFullName": userFullName,
      "userEmail": userEmail,
      "permissionsAllowed": {
        "cancel_request": true,
        "cancel_request_after_submission": true,
        "confirm_request": true,
        "duplicate_request": true,
        "explicit_dm_analyst_assignment": true,
        "ssap_release": true
        }
    }
  }
}
