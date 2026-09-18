import { totalSecurityName } from './constants';
import type { PerformanceGrid, PerformanceGridRow } from './performance.types';

export interface PerformanceTreeRow {
  id: string;
  parentId: string | null;
  name: string;
  rowKey: string;
  hierarchy: string;
  hierarchyLevel: number;
  securityGroup: string;
  securityName: string;
  pfAvgWeight?: number;
  bmAvgWeight?: number;
  periods: Record<string, PerformanceGridRow>;
}

export function transformPerformanceData(grids: PerformanceGrid[]): PerformanceTreeRow[] {
  if(!grids?.length) {
    return [];
  }

  const rowsMap = new Map<string, PerformanceTreeRow>();

  grids.forEach((grid) => {
    grid.rows.forEach((row) => {
      const identity = `${row.securityGroup}::${row.securityName}`;

      let treeRow = rowsMap.get(identity);

      if(!treeRow) {
        treeRow = {
          id: identity,
          parentId: null,
          name: row.securityName || row.hierarchy,
          rowKey: row.rowKey,
          hierarchy: row.hierarchy,
          hierarchyLevel: row.hierarchyLevel,
          securityGroup: row.securityGroup,
          securityName: row.securityName,
          pfAvgWeight: row.pfAvgWeight,
          bmAvgWeight: row.bmAvgWeight,
          periods: {},
        };

        rowsMap.set(identity, treeRow);
      }
      treeRow.periods[grid.period] = row;
    });
  });

  const rows = Array.from(rowsMap.values());

  /*
  * Build TreeList hierarchy 
  * The API has hierarchy level. Using pervious row at the appropriate level as the parent
  */

  const levelStack: Array<PerformanceTreeRow | undefined> = [];

  rows.forEach((row) => {
    const level = row.hierarchyLevel;

    if(row.securityName === totalSecurityName) {
      // Total should be root row but displayed at the bottom
      row.parentId = null;
      return;
    }

    // Find the nearest parent at the previous hierarchy level
    if(level === 1) {
      row.parentId = null;
    } else {
      const parent = levelStack[level - 1];
      row.parentId = parent?.id ?? null;
    }

    // Store this row as the current parent for its level
    levelStack[level] = row;

    // remove deeper levels that are no longer valid
    levelStack.length = level + 1;
  });

  // Move Total row at the bottom
  const totalIndex = rows.findIndex((row) => row.securityName === totalSecurityName);
  if(totalIndex !== -1) {
    const [totalRow] = rows.splice(totalIndex, 1);
    rows.push(totalRow);
  }

  return rows;
}