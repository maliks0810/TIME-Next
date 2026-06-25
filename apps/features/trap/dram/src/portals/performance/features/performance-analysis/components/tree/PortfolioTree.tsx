import React, { useMemo, useState } from "react";
import { Input, Tree, Card, Typography } from "antd";
import { PortfolioRow } from "./../../lib/types";
import { fetchPortfolioListService } from "../../lib/services";
import type { DataNode } from "antd/es/tree";
import { useUserInfo } from "@platform/utils";
const { Text } = Typography;
type PortfolioTreeNode = DataNode & {
    key: string;
    title: string;
    children?: PortfolioTreeNode[];
};

function startsWithSearch(value: string, searchText: string): boolean {
  return value.toLowerCase().startsWith(searchText.toLowerCase());
}

function nodeMatches(node: PortfolioTreeNode, searchText: string): boolean {
  if (!searchText.trim()) return true;

  return (
    startsWithSearch(String(node.key), searchText) ||
    startsWithSearch(String(node.title), searchText)
  );
}

function filterTree(
  nodes: PortfolioTreeNode[],
  searchText: string
): PortfolioTreeNode[] {
  if (!searchText.trim()) return nodes;

  return nodes
    .map((node) => {
      const children = node.children
        ? filterTree(node.children, searchText)
        : [];

      const isMatch = nodeMatches(node, searchText);

      if (isMatch || children.length > 0) {
        return {
          ...node,
          children,
        };
      }

      return null;
    })
    .filter(Boolean) as PortfolioTreeNode[];
}

function collectKeys(nodes: PortfolioTreeNode[]): React.Key[] {
  const keys: React.Key[] = [];

  nodes.forEach((node) => {
    keys.push(node.key);

    if (node.children) {
      keys.push(...collectKeys(node.children));
    }
  });

  return keys;
}
export default function PortfolioTree({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [portfolioList, setPortfolioList] = React.useState<PortfolioRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const userInfo = useUserInfo();
 //  fetch ONCE only

React.useEffect(() => {
  let cancelled = false;

  (async () => {

    const resp = await fetchPortfolioListService(encodeURIComponent(userInfo?.name ?? ''));

    if (!cancelled) {
      const sorted = [...(resp?.data?.results ?? [])].sort((a, b) =>
        a.portId.localeCompare(b.portId)
      );

      setPortfolioList(sorted);
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);
const fullTreeData = useMemo<PortfolioTreeNode[]>(() => {
  const map = new Map<string, PortfolioTreeNode>();

  portfolioList.forEach((p) => {
    if (!p.portId.includes("-")) {
      map.set(p.portId, {
        key: p.portId,
        title: `${p.portId} - ${p.portfolioName}`,
      });
      return;
    }

    const parentKey = p.portId.split("-")[0];

    if (!map.has(parentKey)) {
      map.set(parentKey, {
        key: parentKey,
        title: parentKey,
        children: [],
      });
    }

    const parent = map.get(parentKey)!;

    if (!parent.children) parent.children = [];

    parent.children.push({
      key: p.portId,
      title: `${p.portId} - ${p.portfolioName}`,
    });
  });

  return Array.from(map.values());
}, [portfolioList]);
const filteredTreeData = useMemo(() => {
  return filterTree(fullTreeData, searchText);
}, [fullTreeData, searchText]);

const displayTreeData = useMemo<PortfolioTreeNode[]>(() => {
  const flatten = (nodes: PortfolioTreeNode[]): PortfolioTreeNode[] => {
    return nodes.flatMap((node) => {
      if (node.children && node.children.length === 1) {
        // flatten AFTER search
        return node.children;
      }
      if (node.children) {
        return [{ ...node, children: flatten(node.children) }];
      }
      return node;
    });
  };

  return flatten(filteredTreeData);
}, [filteredTreeData]);


const autoExpandedKeys = useMemo(() => {
  if (!searchText.trim()) return [];
  return collectKeys(filteredTreeData);
}, [filteredTreeData, searchText]);

const mergedExpandedKeys = searchText
  ? autoExpandedKeys
  : expandedKeys;


  return (
    <Card title="Portfolios">
      <Input.Search
        placeholder="Search by portfolio key or text..."
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <Text type="secondary">
        Search matches when key or text starts with the entered value.
      </Text>


<Tree
  treeData={displayTreeData}
  selectedKeys={selectedKeys}
  expandedKeys={mergedExpandedKeys}
  autoExpandParent
  onExpand={(keys) => setExpandedKeys(keys)}
  onSelect={(keys, info) => {
    setSelectedKeys(keys);

    const key = info.node.key as string;
    const isLeaf = !info.node.children || info.node.children.length === 0;
    const isSelectableParent =
      /^[A-Za-z0-9]+T$/.test(key) && !!info.node.children?.length;

    //  toggle expand manually when parent clicked
    if (!isLeaf) {
      const isExpanded = mergedExpandedKeys.includes(key);

      setExpandedKeys((prev) =>
        isExpanded
          ? prev.filter((k) => k !== key)
          : [...prev, key]
      );
    }

    if (isLeaf || isSelectableParent) {
      onSelect(key);
    }
  }}
/>

    </Card>

  );
}