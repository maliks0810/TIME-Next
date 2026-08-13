import { Report } from '../types/report.types'

export interface DepartmentGroup {
  departmentName: string;
  reports: Report[];
}

export function groupByDepartment(pages: Report[][]): DepartmentGroup[] {
  const map = new Map<string, Report[]>();

  pages.flat().forEach(report => {
    const dept = report.departmentname;
    if (!map.has(dept)) {
      map.set(dept, []);
    }
    map.get(dept)!.push(report);
  });
  return Array.from(map.entries()).map(([departmentName, reports]) => ({
    departmentName,
    reports
  }));
}