import { Box } from "@mui/material";
import ReportCenterPage from "./pages/ReportCenterPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/query-client";
import { useSearchParams } from "react-router-dom"
import CatalogAdminPage from "./pages/catalog-admin/CatalogAdminPage";
import { useUserInfo } from "@platform/utils";
import { useDocumentTitle } from './hooks/useDocumentTitle';

export default function App() {

  useDocumentTitle('Report Catalog | TIME');

  const user = useUserInfo();

  const [searchParams] = useSearchParams();

  const isAdminView =
    searchParams.get("view") === "admin"

  if (!user) {
    return <Box sx={{ p: 3 }}>Unable to load user information.</Box>;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
        {isAdminView ? <CatalogAdminPage /> :
          <ReportCenterPage
            user={user}
          />}
      </Box>
    </QueryClientProvider>
  );

}