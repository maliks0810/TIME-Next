// src/utils/auth.ts

import { UserAccess } from "../api/auth";

const MODULE_NAME = "ETFRIK"
// utils/auth.ts

export const hasPermission = (
    access: UserAccess,
    roleName: string
): boolean => {
    return access?.[MODULE_NAME]?.includes(roleName) ?? false;
};

export const hasAnyRole = (
    access: UserAccess,
    roles: string[]
): boolean => {
    const userRoles =
        access?.[MODULE_NAME] ?? [];

    return roles.some((role) =>
        userRoles.includes(role)
    );
};