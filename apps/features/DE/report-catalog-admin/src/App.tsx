import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/query-client";
import CatalogAdminPage from "./pages/catalog-admin/CatalogAdminPage";
import { useOktaUserInfo } from "../../../../../packages/utils/src/hooks/Authentication/user-info-from-token";
import { AuthGuard } from './guards/auth';
import { useDocumentTitle } from './hooks/useDocumentTitle';

type AppUser = {
    email: string;
    login: string;
    name: string;
};

export default function App() {

    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    const oktaUserInfo = useOktaUserInfo();
    const hasLoadedRef = useRef(false);

    useDocumentTitle('Report Catalog - Admin | TIME');

    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        (async () => {
            try {
                const oktaUser = await oktaUserInfo.get();
                const mappedUser: AppUser = {
                    email: oktaUser.email ?? "",
                    login: oktaUser.login ?? "",
                    name: oktaUser.name ?? "",
                };

                setUser(mappedUser);
            } catch (err) {
                console.error("Failed to initialize app", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [oktaUserInfo]);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "50vh",
                    display: "grid",
                    placeItems: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Box sx={{ p: 3 }}>Unable to load user information.</Box>;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <AuthGuard>
                <Box
                    sx={{
                        width: "100%",
                        pt: "5px",      // gap below Turbo header
                        pb: "10px",     // gap above Turbo footer
                        px: "0px",
                        //   height: "calc(100vh - 15px)", // fixed viewport fit: 5 top + 10 bottom
                        boxSizing: "border-box",
                        overflow: "hidden",
                    }}
                >
                    <CatalogAdminPage />
                </Box>
            </AuthGuard>
        </QueryClientProvider>
    );
}