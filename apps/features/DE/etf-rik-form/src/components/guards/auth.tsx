import type { ReactNode } from "react";
import { Alert, AlertTitle, Box } from "@mui/material";

import { useUserAccess } from "../../hooks/useUserAccess";
import { hasAnyRole } from "../../utils/auth";

type AuthGuardProps = {
    children: ReactNode;
};

export const AuthGuard = ({
    children
}: AuthGuardProps) => {
    const { data: access, isLoading } = useUserAccess();

    if (isLoading) {
        return null;
    }

    const hasAccess = hasAnyRole(
        access ?? {},
        ["USER", "VIEWALL"]
    );

    if (!hasAccess) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">
                    <AlertTitle>Application Access Required</AlertTitle>
                    Your account is not currently authorized to access this application.
                    Please contact <a href="mailto:Reports@tcw.com">Reports@tcw.com</a> to request access.
                </Alert>
            </Box>
        );
    }

    return <>{children}</>;
};