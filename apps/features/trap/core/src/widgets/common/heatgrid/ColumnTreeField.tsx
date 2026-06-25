import { useMemo, useState, type Key } from 'react';
import { Input, Tree } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import {
  hiddenFields,
  leafColumns,
  renderColumns,
  setHiddenLeaves,
  type ColumnDef,
  type ColumnNode,
} from './types';

/**
 * Heat Map Grid column control for the display-settings panel — the heatgrid
 * counterpart of perfgrid's ColumnTreeField (duplicated by the SPLIT, scoped to
 * `.hg-*`). A checkable tree of the active column structure: groups collapse by
 * default (so 100 columns read as a handful of rows), carry a visible/total
 * count, and a group checkbox toggles all its columns without expanding; flat
 * value columns (e.g. AQI's "Year") appear as individual top-level rows; a
 * filter box finds columns by name; the list sits in a bounded scroll box.
 *
 * The axisGroup chips remain the PARENT control — renderColumns only emits
 * chip-selected members, so they decide which groups appear here at all.
 */

interface Props {
  columns: ColumnDef[];
  onColumnsChange: (next: ColumnDef[]) => void;
  /** Section heading (e.g. "Columns"). */
  label: string;
}

interface Filtered {
  kept: ColumnNode[];
  /** Group keys to auto-expand so matches are visible. */
  expand: string[];
}

/** Keep only nodes whose label (or a descendant's) matches; collect groups to expand. */
function filterTree(nodes: ColumnNode[], q: string): Filtered {
  const kept: ColumnNode[] = [];
  const expand: string[] = [];
  for (const n of nodes) {
    const hit = n.label.toLowerCase().includes(q);
    if (n.children?.length) {
      if (hit) {
        kept.push(n);
        expand.push(n.key);
      } else {
        const r = filterTree(n.children, q);
        if (r.kept.length) {
          kept.push({ ...n, children: r.kept });
          expand.push(n.key, ...r.expand);
        }
      }
    } else if (hit) {
      kept.push(n);
    }
  }
  return { kept, expand };
}

function toTreeData(nodes: ColumnNode[], hidden: Set<string>): DataNode[] {
  return nodes.map(n => {
    if (n.children?.length) {
      const leaves = leafColumns([n]);
      const vis = leaves.reduce((a, l) => a + (hidden.has(l.key) ? 0 : 1), 0);
      const partial = vis > 0 && vis < leaves.length;
      return {
        key: n.key,
        title: (
          <span className="hg-col-row">
            <span className="hg-col-grp">{n.label}</span>
            <span className={`hg-col-count${partial ? ' partial' : ''}`}>
              {vis}/{leaves.length}
            </span>
          </span>
        ),
        children: toTreeData(n.children, hidden),
      };
    }
    return { key: n.key, title: <span className="hg-col-leaf">{n.label}</span> };
  });
}

export default function ColumnTreeField({ columns, onColumnsChange, label }: Props) {
  const [query, setQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

  const fullTree = useMemo(() => renderColumns(columns, { includeHidden: true }), [columns]);
  const allLeafCount = useMemo(() => leafColumns(fullTree).length, [fullTree]);
  const hidden = useMemo(() => hiddenFields(columns), [columns]);

  const q = query.trim().toLowerCase();
  const kept = useMemo(() => (q ? filterTree(fullTree, q).kept : fullTree), [fullTree, q]);
  const treeData = useMemo(() => toTreeData(kept, hidden), [kept, hidden]);
  const shownLeaves = useMemo(() => leafColumns(kept), [kept]);
  const checkedKeys = useMemo(
    () => shownLeaves.filter(l => !hidden.has(l.key)).map(l => l.key),
    [shownLeaves, hidden],
  );

  const onSearch = (v: string) => {
    setQuery(v);
    const t = v.trim().toLowerCase();
    setExpandedKeys(t ? filterTree(fullTree, t).expand : []);
  };

  const onCheck = (keys: Key[] | { checked: Key[] }) => {
    const arr = (Array.isArray(keys) ? keys : keys.checked).map(String);
    const checked = new Set(arr);
    const next = new Set(hidden);
    for (const l of shownLeaves) {
      if (checked.has(l.key)) next.delete(l.key);
      else next.add(l.key);
    }
    if (next.size >= allLeafCount) return; // keep at least one column visible
    onColumnsChange(setHiddenLeaves(columns, next));
  };

  return (
    <>
      <div className="ds-sec">{label}</div>
      <div className="sec-caption">Show or hide columns; check a group to toggle all of it.</div>
      <Input
        className="hg-col-search"
        size="small"
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Filter columns…"
        value={query}
        onChange={e => onSearch(e.target.value)}
      />
      <div className="hg-cols-box">
        {treeData.length > 0 ? (
          <Tree
            className="hg-col-tree"
            checkable
            blockNode
            selectable={false}
            treeData={treeData}
            checkedKeys={checkedKeys}
            expandedKeys={expandedKeys}
            onExpand={keys => setExpandedKeys(keys)}
            onCheck={onCheck}
          />
        ) : (
          <div className="hg-cols-empty">No columns match “{query}”.</div>
        )}
      </div>
    </>
  );
}
