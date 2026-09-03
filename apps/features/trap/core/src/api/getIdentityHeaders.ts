function getBearerToken(): string {
    const STORAGE_KEY = 'okta-token-storage';
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData) return '';

    try {
        const parsed = JSON.parse(rawData);
        return parsed?.idToken?.idToken || '';
    } catch (err) {
        console.error('Error parsing auth token:', err);
        return '';
    }
}

function getAccessToken(): string {
    const STORAGE_KEY = 'okta-token-storage';
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData) return '';

    try {
        const parsed = JSON.parse(rawData);
        return parsed?.accessToken?.accessToken || '';
    } catch (err) {
        console.error('Error parsing auth token:', err);
        return '';
    }
}
export function getIdentityHeaders(): Record<string, string> {
    const token = getBearerToken();
    const accessToken = getAccessToken();
    const debugUser = localStorage.getItem('debug-user');
    const debugLogin = debugUser;
    const debugUserId = debugUser;
    const debugEmail = debugUser ? `${debugUser}@test.local` : null;
    const debugname = debugUser === 'jane' ? 'Jane' : debugUser === 'john' ? 'John' : debugUser;
    const debugOrg1 = localStorage.getItem('debug-org1');
    const debugOrg2 = localStorage.getItem('debug-org2');
    const debugOrg4 = localStorage.getItem('debug-org4');
    const debugRole = localStorage.getItem('debug-role');

    const login = debugLogin || sessionStorage.getItem('okta-user') || '';
    const name = debugname || sessionStorage.getItem('okta-name') || '';
    const userId = debugUserId || sessionStorage.getItem('okta-user') || '';
    const email = debugEmail || sessionStorage.getItem('okta-email') || '';
    const org1 = debugOrg1 || sessionStorage.getItem('OrgLevel1') || '';
    const org2 = debugOrg2 || sessionStorage.getItem('OrgLevel2') || '';
    const org4 = debugOrg4 || sessionStorage.getItem('OrgLevel4') || '';
    const role = debugRole || sessionStorage.getItem('okta-role') || 'Analyst';

    return {
        'content-type': 'application/json',
        authorization: token ? `Bearer ${token}` : '',
        'x-user-login': login,
        'x-user-id': userId,
        'x-user-email': email,
        'x-user-name': name,
        'x-user-org1': org1,
        'x-user-org2': org2,
        'x-user-org4': org4,
        'x-user-role': role,
        'x-access-token': `Bearer ${accessToken}`,
    };
}
