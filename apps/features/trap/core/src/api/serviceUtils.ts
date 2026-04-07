/* eslint-disable  @typescript-eslint/no-explicit-any */
type GqlResponse<T> = { data?: T; errors?: Array<{ message: string }> };
const GRAPHQL_URL = import.meta.env.VITE_APP_GRAPHQL_URL || ' https://rar-trap-agql-qa.np.tcw.com';

function getIdentityHeaders(): Record<string, string> {
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
        'x-user-login': login,
        'x-user-id': userId,
        'x-user-email': email,
        'x-user-name': name,
        'x-user-org1': org1,
        'x-user-org2': org2,
        'x-user-org4': org4,
        'x-user-role': role,
    };
}

// TODO reuse in graphql.ts and trap.ts
export async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: getIdentityHeaders(),
        body: JSON.stringify({ query, variables: variables ?? {} }),
    });

    const json = (await res.json()) as GqlResponse<T>;

    if (!res.ok) {
        const msg = json?.errors?.[0]?.message || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg);
    }
    if (json.errors && json.errors.length) throw new Error(json.errors[0].message);
    if (!json.data) throw new Error('No data returned from GraphQL');

    return json.data;
}
