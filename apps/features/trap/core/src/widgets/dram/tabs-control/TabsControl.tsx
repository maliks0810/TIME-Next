import { useEffect, useMemo, useState } from 'react';
import { RadioButtonGroupBase } from '../../common/radio-button-group/RadioButtonGroup';
import styles from './TabsControl.module.scss';
import { useGetWidgetValue, useSetWidgetValue } from '../../../state/Widgets/hooks';
import { WidgetComponentProps } from '../../../types/widget';
import { COMMON_DATE_GRID_ROW_KEY, COMMON_TREE_KEY } from '../../constants';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
const TABS = [
    { label: 'Gross History', value: 'portfolio.gross.history' },
    { label: 'Benchmark History', value: 'portfolio.benchmark.history' },
    { label: 'Net History', value: 'portfolio.net.history' },
];

const DEFAULT_SELECTED = 'portfolio.gross.history';
export const TabsControl = ({ widgetInstance }: WidgetComponentProps) => {
    const { config = {} } = widgetInstance;

    const channelId = config.params?.channel;

    const activeTab = useGetActiveTab();
    const [currentlySelectedTab, setCurrentlySelectedTab] = useState<string | null>(null);
    const handleChange = (checked: string) => {
        setCurrentlySelectedTab(checked);
        setWidgetValueToChannel({
            key: 'schemaKey',
            channelId,
            value: checked,
            activeTab,
            widgetId: widgetInstance.id,
        });
    };

    const setWidgetValueToChannel = useSetWidgetValue();
    const selectedPortfolioTree = useGetWidgetValue({
        channelId: config.params?.channel,
        key: COMMON_TREE_KEY,
    });

    const selectedPortfolioGrid = useGetWidgetValue({
        channelId: config.params?.channel,
        key: COMMON_DATE_GRID_ROW_KEY,
    }) as Record<string, string>;

    const selectedPortfolio = selectedPortfolioTree;

    const selectedSchemaKey = useGetWidgetValue({
        channelId: config.params?.channel,
        key: 'schemaKey',
    });

    useEffect(() => {
        if (
            selectedPortfolioGrid &&
            selectedPortfolioGrid.portfolioNumber &&
            selectedPortfolioGrid.portfolioNumber !== selectedPortfolioTree
        ) {
            setWidgetValueToChannel({
                activeTab,
                channelId,
                key: COMMON_TREE_KEY,
                value: selectedPortfolioGrid.portfolioNumber,
                widgetId: widgetInstance.id,
            });
        }
    }, [selectedPortfolioGrid]);

    useEffect(() => {
        // On Mount set schemay key to portfolio summary to show summary table
        setWidgetValueToChannel({
            activeTab,
            channelId,
            key: 'schemaKey',
            value: 'portfolio.summary',
            widgetId: widgetInstance.id,
        });
    }, []);

    useEffect(() => {
        // If there is no selected protfolio - ignore
        if (selectedPortfolio && selectedSchemaKey === 'portfolio.summary') {
            // Check currently selected tab. If its not portfolio summary, then we need to show portfolio summary and clear list and grid keys
            if (currentlySelectedTab && currentlySelectedTab !== 'portfolio.summary') {
                setCurrentlySelectedTab(null);
                setWidgetValueToChannel({
                    activeTab,
                    channelId,
                    key: COMMON_DATE_GRID_ROW_KEY,
                    value: null,
                    widgetId: widgetInstance.id,
                });
                return;
            } else {
                // If currently selected tab is null, that means we need to show tabs and a history table with default selected
                setCurrentlySelectedTab(DEFAULT_SELECTED);
                setWidgetValueToChannel({
                    activeTab,
                    channelId,
                    key: 'schemaKey',
                    value: DEFAULT_SELECTED,
                    widgetId: widgetInstance.id,
                });
                return;
            }
        }
    }, [selectedSchemaKey, selectedPortfolio]);

    const error = useMemo(
        () =>
            !selectedPortfolio || selectedSchemaKey === 'portfolio.summary'
                ? 'Please select a portfolio'
                : null,
        [selectedPortfolio, selectedSchemaKey]
    );

    return (
        <RadioButtonGroupBase
            items={TABS}
            onChange={handleChange}
            optionType="button"
            className={styles.container}
            error={error}
            defaultSelected={DEFAULT_SELECTED}
        />
    );
};
