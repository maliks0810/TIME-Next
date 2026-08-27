export type UserInfo = {
    name?: string;
    id?: string;
    login?: string;
    email: string;
    idToken?: string;
    accessToken?: string;
    phone?: string;
    avatar?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    claims?: any;
    isAdmin: boolean;
    TIME_Role?: string;
};
