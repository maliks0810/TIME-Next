/* eslint-disable  @typescript-eslint/no-explicit-any */
import { WidgetComponentProps } from '../../../types/widget';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { Input, Tree, TreeDataNode } from 'antd';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import { COMMON_TREE_KEY } from '../../constants';
import styles from './Tree.module.scss';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import { returnConfigOrDefaultByKey } from '../../../utils/returnWidgetValue';
const { Search } = Input;

export const TreeWidget = ({
    widgetInstance,
    widgetDefinition,
    result,
    loading,
}: WidgetComponentProps) => {
    const { config } = widgetInstance;
    const withSearch = returnConfigOrDefaultByKey(config, widgetDefinition, 'withSearch', true);
    const [items, setItems] = useState<TreeDataNode[]>([]);

    const [search, setSearch] = useState<string>('');
    const [selected, setSelected] = useState<string[]>([]);

    const channelId = config?.params?.channel;
    const setWidgetValueToChannel = useSetWidgetValue();
    const contextSelected = useGetWidgetValue({
        channelId,
        key: COMMON_TREE_KEY,
    });

    const activeTab = useGetActiveTab();
    const handleItemSelect = (_: any, selected: { node: TreeDataNode }) => {
        setWidgetValueToChannel({
            activeTab,
            channelId,
            key: COMMON_TREE_KEY,
            value: selected.node.key as string,
            widgetId: widgetInstance.id,
        });
    };

    const handleSearchChange = debounce((e) => setSearch(e.target.value.toLowerCase()), 1000);

    useEffect(() => {
        if (result) {
            setItems(result.items as TreeDataNode[]);
        }
    }, [result]);

    useEffect(() => {
        if (contextSelected) setSelected([contextSelected as string]);
        else {
            setSelected([]);
        }
    }, [contextSelected]);

    const options = useMemo(
        () =>
            !search
                ? items
                : items.filter((el) => (el.title as string).toLowerCase().includes(search)),
        [items, search]
    );
    if (loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    return (
        <WidgetCardShell>
            <div className={styles.container}>
                {withSearch && (
                    <Search
                        style={{ marginBottom: 8 }}
                        placeholder="Search"
                        onChange={handleSearchChange}
                    />
                )}
                <div className={styles.treeWrapper}>
                    <Tree
                        blockNode
                        virtual
                        onSelect={handleItemSelect}
                        treeData={options}
                        selectedKeys={selected}
                        className={styles.tree}
                    />
                </div>
            </div>
        </WidgetCardShell>
    );
};
