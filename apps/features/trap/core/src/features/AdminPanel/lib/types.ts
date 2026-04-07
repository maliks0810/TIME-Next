export type AdminCreateInput = {
    container: string;
    data: JSON;
};

export type AdminPatchInput = {
    id: string;
    patch: JSON;
};

export type AdminDeleteInput = {
    id: string;
    container: string;
};
