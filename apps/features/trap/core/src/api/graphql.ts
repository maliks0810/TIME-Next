/* eslint-disable  @typescript-eslint/no-explicit-any */
import { GRAPHQL_URL } from './config';

export type GraphQLError = { message: string; path?: Array<string | number>; extensions?: any };
export type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] };

function getIdentityHeaders(): Record<string, string> {
    const debugUser = localStorage.getItem('debug-user');
    const debugLogin = debugUser;
    const debugUserId = debugUser;
    const debugEmail = debugUser ? `${debugUser}@test.local` : null;
    const debugName = debugUser === 'jane' ? 'Jane' : debugUser === 'john' ? 'John' : debugUser;

    const login = debugLogin || sessionStorage.getItem('okta-user') || '';
    const name = debugName || sessionStorage.getItem('okta-name') || '';
    const userId = debugUserId || sessionStorage.getItem('okta-user') || '';
    const email = debugEmail || sessionStorage.getItem('okta-email') || '';

    return {
        'Content-Type': 'application/json',
        'x-user-login': login,
        'x-user-id': userId,
        'x-user-email': email,
        'x-user-name': name,
    };
}

export async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    console.log('GRAPHQL identity', getIdentityHeaders());

    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: getIdentityHeaders(),
        body: JSON.stringify({ query, variables: variables ?? {} }),
    });

    const json = (await res.json()) as GraphQLResponse<T>;

    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
    }
    if (json.errors?.length) {
        const msgs = json.errors.map((e) => e.message).join('; ');
        throw new Error(msgs);
    }
    if (!json.data) throw new Error('GraphQL: empty data');
    return json.data;
}
