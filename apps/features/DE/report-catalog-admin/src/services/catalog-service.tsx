import axios from "axios"
import { REPORT_CATALOG_BASE, REPORT_ADMIN_CATALOG_BASE } from "./endpoints";
import { ReportCatalogFilters, ReportPage } from "../types/report.types";
import { CreateCatalogRequest, UpdateCatalogRequest } from "../pages/catalog-admin/types/catalog";

export const fetchReports = async (
  filters: ReportCatalogFilters,
  limit: number,
  offset: number,
  signal?: AbortSignal
): Promise<ReportPage> => {
  const response = await axios.get<ReportPage>(REPORT_CATALOG_BASE + "/reports", {
    params: {
      limit,
      offset,
      search: filters.search,
      status: filters.status,
      user_email: filters.userEmail,
      show_only_favourites: filters.showOnlyUserFav
    },
    signal
  });

  return response.data;
}




export const catalogAdminService = {
  getCatalogs: (params: {
    user_email: string;
    search?: string;
    limit?: number;
    offset?: number;
    status: string;
  }) => axios.get(REPORT_CATALOG_BASE + "/admin/reports", { params }),
  getDepartments: () => axios.get(`${REPORT_CATALOG_BASE}/admin/departments`),
  getCatalogById: (id: number) =>
    axios.get(`${REPORT_ADMIN_CATALOG_BASE}/${id}`),

  createCatalog: (payload: CreateCatalogRequest) =>
    axios.post(REPORT_ADMIN_CATALOG_BASE, payload),

  updateCatalog: (
    id: number,
    payload: UpdateCatalogRequest
  ) => axios.patch(`${REPORT_ADMIN_CATALOG_BASE}/${id}`, payload),

  deactivateCatalog: (id: number) =>
    axios.delete(`${REPORT_ADMIN_CATALOG_BASE}/${id}`),
};