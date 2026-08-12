export interface CatalogReport {
  catalogid: number;
  reportnum?: string;
  reportname?: string;
  deptcode?: string;
  author?: string;
  departmentname?: string;
  reportlink?: string;
  description?: string;
  status?: string;
  source?: string;
  report_rdl_name?: string;
  item_id?: string;
  reportnotes?: string;
  retirementstatus?: string;
  createddate?: string;
  modifieddate?: string;
}

export interface CreateCatalogRequest {
  report_num?: string;
  report_name: string;
  platform?: string;
  dept_code?: string;
  group_code_2?: string;
  author?: string;
  department_name?: string;
  report_link?: string;
  description?: string;
  status?: string;
  support_group?: string;
  source?: string;
  report_rdl_name?: string;
  item_id?: string;
  report_notes?: string;
  retirement_status?: string;
}

export interface UpdateCatalogRequest {
  report_num?: string;
  report_name?: string;
  platform?: string;
  dept_code?: string;
  group_code_2?: string;
  author?: string;
  department_name?: string;
  report_link?: string;
  description?: string;
  status?: string;
  support_group?: string;
  source?: string;
  report_rdl_name?: string;
  item_id?: string;
  report_notes?: string;
  retirement_status?: string;
}

export interface CatalogQueryParams {
  email: string;
  search: string;
  page: number;
  pageSize: number;
  status: string;
}