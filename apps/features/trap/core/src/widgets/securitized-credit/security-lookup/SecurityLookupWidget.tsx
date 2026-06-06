import React from 'react';
import { theme } from 'antd';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../types/widget';
import { SearchResult, SearchType } from './types';

import { RightPanel } from './components/RightPanel';
import { Search } from './components/Search';
import { PLACEHOLDERS } from './constants';
import styles from './SecurityLookup.module.scss';
import {
    ANALYSIS_SESSION_ID_KEY,
    DEAL_NAME_KEY,
    IS_ASSET_NEW_KEY,
} from '../../constants';
import { useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';

const noop = () => {
    /* intentionally empty */
};

export default function SecurityLookupWidget({
    widgetInstance,
    uiActions,
}: WidgetComponentProps) {
    const { token } = theme.useToken();

    const [searchType, setSearchType] = React.useState<SearchType>('CUSIP');
    const [query, setQuery] = React.useState('');
    const [selected, setSelected] = React.useState<SearchResult | null>(null);

    const params = widgetInstance?.config?.params ?? {};
    const templateId = params.templateId as string | undefined;
    const defaultType = params.defaultSearchType as SearchType | undefined;

    const channelId = widgetInstance?.config?.params?.channel;
    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();

    React.useEffect(() => {
        if (defaultType && PLACEHOLDERS[defaultType]) setSearchType(defaultType);
    }, [defaultType]);

    const handleQueryChange = (val: string) => {
        setQuery(val);
        setSelected(null);
    };

    const handleExecute = React.useCallback(() => {
        const trimmed = query.trim();
        if (!trimmed || trimmed.length < 3) return;

        setWidgetValueToChannel({
            key: DEAL_NAME_KEY,
            value: trimmed,
            activeTab,
            channelId,
        });

        setWidgetValueToChannel({
            key: IS_ASSET_NEW_KEY,
            value: 'true',
            activeTab,
            channelId,
        });
    }, [query, activeTab, channelId, setWidgetValueToChannel]);

    const handleSelect = React.useCallback((result: SearchResult) => {
        setSelected(result);
        setQuery(result.name);

        Object.entries(result.context).forEach(([key, value]) =>
            setWidgetValueToChannel({ key, value, activeTab, channelId })
        );

        setWidgetValueToChannel({ key: IS_ASSET_NEW_KEY, value: 'false', activeTab, channelId });

        uiActions?.openWorkflow?.({ target: { templateId }, context: result.context });
    }, [activeTab, channelId, setWidgetValueToChannel, uiActions, templateId]);

    const handleClear = React.useCallback(() => {
        setSelected(null);
        setQuery('');

        [
            ANALYSIS_SESSION_ID_KEY,
            IS_ASSET_NEW_KEY,
        ].forEach((key) => setWidgetValueToChannel({ channelId, key, value: null, activeTab }));
    }, [activeTab, channelId, setWidgetValueToChannel]);

    return (
        <WidgetCardShell>
            <div className={styles.wrapper}>
                <Search
                    setSearchType={setSearchType}
                    handleClear={handleClear}
                    handleQueryChange={handleQueryChange}
                    searchType={searchType}
                    query={query}
                    searching={false}
                    open={false}
                    options={[]}
                    handleSelect={handleSelect}
                    setOpen={noop}
                    onExecute={handleExecute}
                />

                <div
                    style={{
                        background: token.colorBorderSecondary,
                        width: 1,
                        alignSelf: 'stretch',
                    }}
                />

                <div className={styles.rightWrapper}>
                    <RightPanel
                        selected={selected}
                        recentSearches={[]}
                        handleClear={handleClear}
                        handleRecentClick={noop}
                    />
                </div>
            </div>
        </WidgetCardShell>
    );
}