import { useMemo, useState, type JSX, type ReactNode } from 'react';

export type PortfolioAnalysisMiniGridColumn<T> = {
  key: string;
  label: string;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null | undefined;
  toneValue?: (row: T) => number | null | undefined;
};

type SortDirection = 'asc' | 'desc';
type SortState = { key: string; direction: SortDirection } | null;

function defaultSortValue<T>(
  row: T,
  column: PortfolioAnalysisMiniGridColumn<T>,
): string | number | null | undefined {
  if (column.sortValue) return column.sortValue(row);

  const rendered = column.render(row);
  if (typeof rendered === 'number' || typeof rendered === 'string') return rendered;

  return String(rendered ?? '');
}

function compareValues(
  left: string | number | null | undefined,
  right: string | number | null | undefined,
): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function sortIndicator<T>(column: PortfolioAnalysisMiniGridColumn<T>, sortState: SortState): string {
  if (sortState?.key !== column.key) return '';
  return sortState.direction === 'asc' ? ' ↑' : ' ↓';
}

function toneClass(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value === 0) return '';
  return value > 0 ? 'portfolio-analysis-bottom-value-positive' : 'portfolio-analysis-bottom-value-negative';
}

export function PortfolioAnalysisMiniGrid<T>({
  columns,
  rows,
  emptyText = 'No rows.',
  defaultSortKey,
  defaultSortDirection = 'desc',
  onRowClick,
  rowClassName,
}: {
  columns: Array<PortfolioAnalysisMiniGridColumn<T>>;
  rows: T[];
  emptyText?: string;
  defaultSortKey?: string;
  defaultSortDirection?: SortDirection;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}): JSX.Element {
  const [sortState, setSortState] = useState<SortState>(
    defaultSortKey ? { key: defaultSortKey, direction: defaultSortDirection } : null,
  );

  const sortedRows = useMemo(() => {
    if (!sortState) return rows;

    const column = columns.find((candidate) => candidate.key === sortState.key);
    if (!column) return rows;

    return [...rows].sort((left, right) => {
      const result = compareValues(defaultSortValue(left, column), defaultSortValue(right, column));
      return sortState.direction === 'asc' ? result : -result;
    });
  }, [columns, rows, sortState]);

  const toggleSort = (column: PortfolioAnalysisMiniGridColumn<T>): void => {
    setSortState((current) => {
      if (current?.key !== column.key) return { key: column.key, direction: 'desc' };
      if (current.direction === 'desc') return { key: column.key, direction: 'asc' };
      return null;
    });
  };

  if (!rows.length) return <div className="portfolio-analysis-bottom-empty">{emptyText}</div>;

  return (
    <div className="portfolio-analysis-bottom-table-wrap">
      <table className="portfolio-analysis-bottom-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.align === 'left' ? 'text-left' : 'text-right'}>
                <button
                  type="button"
                  className="portfolio-analysis-bottom-table-sort-button"
                  onClick={() => toggleSort(column)}
                  title={`Sort by ${column.label}`}
                >
                  {column.label}
                  {sortIndicator(column, sortState)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
            <tr
              key={index}
              className={rowClassName?.(row) ?? ''}
              onClick={() => onRowClick?.(row)}
              data-clickable={onRowClick ? 'true' : 'false'}
            >
              {columns.map((column) => (
                <td key={column.key} className={column.align === 'left' ? 'text-left' : 'text-right'}>
                  <span className={toneClass(column.toneValue?.(row))}>{column.render(row)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
