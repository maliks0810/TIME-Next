import type { PerformanceGrid, PerformanceGridRow } from './performance.types';

// Used any type in this file as from BE we are not receiving types with proper casing and we don't add types with such casing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPerformanceGrids(grids: any[]): PerformanceGrid[] {
  return grids.map((grid) => ({
    title: grid.title,
    period: grid.period,
    rowCount: grid.rowCount,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows: grid.rows.map((row: any): PerformanceGridRow => ({
      allocEffect: row.AllocEffect,
      bmAvgWeight: row.BMAvgWeight,
      bmContToRet: row.BMContToRet,
      bmTotalRet: row.BMTotalRet,
      hierarchy: row.Hierarchy,
      hierarchyLevel: row.Hierarchy_level,
      interEffect: row.InterEffect,
      pfAvgWeight: row.PFAvgWeight,
      pfContToRet: row.PFContToRet,
      pfTotalRet: row.PFTotalRet,
      securityGroup: row.SecurityGroup,
      securityName: row.SecurityName,
      selectEffect: row.SelectEffect,
      totalEffect: row.TotalEffect,
      rowKey: row.rowKey
    }))
  }));
}