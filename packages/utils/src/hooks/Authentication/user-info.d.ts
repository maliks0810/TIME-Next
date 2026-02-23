export type UserInfo = {
    name?: string;
    id?: string;
    login?: string;
    email: string;
    idToken?: string;
    accessToken?: string;
    phone?: string;
    avatar?: string;
    claims?: UserClaims;
    isAdmin: boolean;
    favorites?: UserFavorite[];
    authorizations?: AuthIndicator[];
};

export type AuthIndicator = {
    resource: string;
    action: string;
    authorized: boolean;
}

export type LinkInfoBase = {
    title: string;
    url: string;
    newTab?: boolean;
    isExternal?: boolean;
    httpMethod?: string;
    postBody?: string;
}

export interface UserFavorite extends LinkInfoBase {
    title: string,
    url: string | undefined,
    newTab: boolean,
    clickCount: number
}