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

export interface UserFavorite extends LinkInfoBase {
    title: string,
    url: string,
    newTab: boolean,
    clickCount: number
}