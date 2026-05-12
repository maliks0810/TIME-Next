import React from "react";
import TreeView, { TreeViewTypes } from "devextreme-react/tree-view";
import { PortfolioRow } from "./../../lib/types";
import { fetchPortfolioListService } from "../../lib/services";


function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function PortfolioTree({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [portfolioList, setPortfolioList] = React.useState<PortfolioRow[]>([]);

  const debouncedSearch = useDebounced(search, 250);

  // ✅ fetch ONCE only
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const resp = await fetchPortfolioListService();
      if (!cancelled) {
        setPortfolioList(resp?.data?.results ?? []);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ FAST filtering (in-memory, debounced)
  const filteredItems = React.useMemo(() => {
    if (!debouncedSearch) return portfolioList;

    const s = debouncedSearch.toLowerCase();

    return portfolioList.filter(
      (x) =>
        x.portId.toLowerCase().includes(s) ||
        x.portfolioName.toLowerCase().includes(s)
    );
  }, [portfolioList, debouncedSearch]);

  // ✅ build tree
  const treeItems = React.useMemo(() => {
    return [
      {
        id: "root",
        text: "Portfolios",
        expanded: true,
        items: filteredItems.map((r) => ({
          id: r.portId,
          text: `${r.portId} - ${r.portfolioName}`,
          portId: r.portId,
        })),
      },
    ];
  }, [filteredItems]);

  // ✅ FIXED naming + typing
  const onItemClick = React.useCallback(
    (e: TreeViewTypes.ItemClickEvent) => {
      const item = e.itemData;

      if (!item || item.id === "root") {
        onSelect("");
        return;
      }

      onSelect(item.portId ?? item.id);
    },
    [onSelect]
  );

  return (
    <>
      {/* ✅ simple search UI */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search portfolios..."
      />

      <TreeView
        items={treeItems}
        dataStructure="tree"
        displayExpr="text"
        keyExpr="id"
        expandEvent="click"
        selectionMode="single"
        onItemClick={onItemClick}
      />
    </>
  );
}
