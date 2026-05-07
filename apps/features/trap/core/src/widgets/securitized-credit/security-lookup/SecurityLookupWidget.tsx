/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { theme } from 'antd';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import type { WidgetComponentProps } from '../../../types/widget';
import { RecentSearch, SearchResult, SearchType } from './types';

import { RightPanel } from './components/RightPanel';
import { Search } from './components/Search';
import { PLACEHOLDERS } from './constants';
// MOCK_TRANCHES: local typeahead search data until PRISM bond search API is available.
// TODO: replace search() function with executeWidget call to ds_sc_security_lookup_01
//       when PRISM /api/v1/security-analysis/search is implemented.
// import { MOCK_TRANCHES } from "./na-rmbs/mockData";
const MOCK_TRANCHES: any[] = [];
import styles from './SecurityLookup.module.scss';
import { Overlay } from '../../common/overlay/Overlay';
import {
    ANALYSIS_SESSION_ID_KEY,
    DEAL_ID_KEY,
    DEAL_NAME_KEY,
    IS_ASSET_NEW_KEY,
    SECURITY_ID_KEY,
    SECURITY_IDENTIFIER_KEY,
    SECURITY_NAME_KEY,
    SECURITY_TYPE_KEY,
    TRANCHE_ID_KEY,
    TRANCHE_NAME_KEY,
} from '../../constants';
import { useSetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';

// ─── Mock search ──────────────────────────────────────────────────────────────

function search(query: string): SearchResult[] {
    const q = query.trim().toUpperCase();
    if (q.length < 3) return [];

    const toResult = (t: (typeof MOCK_TRANCHES)[0]): SearchResult => ({
        key: t.id,
        name: `ARMT 2005-8 — ${t.name}`,
        cusip: t.cusip,
        isin: `US${t.cusip}5`,
        aladdinId: `ALD-${t.cusip}`,
        figi: `BBG${t.cusip.slice(0, 7)}`,
        assetType: 'NA-RMBS',
        context: {
            'deal.id': 'deal_armt_2005_8',
            'deal.name': 'ARMT 2005-8',
            'analysis.sessionId': 'sess_armt_2005_8',
            'tranche.id': t.id,
            'tranche.name': t.name,
            'security.id': t.cusip,
            'security.identifier': t.cusip,
            'security.name': `ARMT 2005-8 ${t.name}`,
            'security.type': 'RMBS',
        },
    });

    // Exact CUSIP
    const exact = MOCK_TRANCHES.find((t) => t.cusip === q);
    if (exact) return [toResult(exact)];

    // CUSIP prefix
    const prefix = MOCK_TRANCHES.filter((t) => t.cusip.startsWith(q));
    if (prefix.length > 0) return prefix.slice(0, 8).map(toResult);

    // Deal name / ticker
    if (['ARMT', 'ARMT0508', 'ADJUSTABLE', 'MORTGAGE'].some((s) => q.includes(s))) {
        const dealRow: SearchResult = {
            key: 'deal_armt_2005_8',
            name: 'Adjustable Rate Mortgage Trust 2005-8',
            cusip: 'ARMT0508',
            isin: 'US00703600Z2',
            aladdinId: 'ALD-ARMT0508',
            figi: 'BBG000ARMT58',
            assetType: 'NA-RMBS',
            context: {
                'deal.id': 'deal_armt_2005_8',
                'deal.name': 'ARMT 2005-8',
                'analysis.sessionId': 'sess_armt_2005_8',
                'security.id': 'deal_armt_2005_8',
                'security.identifier': 'ARMT0508',
                'security.name': 'Adjustable Rate Mortgage Trust 2005-8',
                'security.type': 'RMBS',
            },
        };
        return [
            dealRow,
            ...['t_7a2', 't_6a1', 't_7a1_1', 't_7m1', 't_cb1'].map((id) =>
                toResult(MOCK_TRANCHES.find((t) => t.id === id)!)
            ),
        ];
    }

    // Generic fallback — show first 6 as illustrative
    return MOCK_TRANCHES.slice(0, 6).map(toResult);
}

export default function SecurityLookupWidget({ widgetInstance, uiActions }: WidgetComponentProps) {
    const { token } = theme.useToken();

    const [searchType, setSearchType] = React.useState<SearchType>('CUSIP');
    const [query, setQuery] = React.useState('');
    const [options, setOptions] = React.useState<SearchResult[]>([]);
    const [searching, setSearching] = React.useState(false);
    const [selected, setSelected] = React.useState<SearchResult | null>(null);
    const [open, setOpen] = React.useState(false);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.trim().length < 3) {
            setOptions([]);
            setOpen(false);
            setSearching(false);
            return;
        }

        setSearching(true);
        debounceRef.current = setTimeout(() => {
            const found = search(val);
            setOptions(found);
            setSearching(false);
            setOpen(found.length > 0);
            if (found.length === 0 && val.trim().length >= 3) {
                // No match in system — this is a new asset

                setWidgetValueToChannel({
                    key: IS_ASSET_NEW_KEY,
                    value: true,
                    activeTab,
                    channelId,
                });
            } else {
                setWidgetValueToChannel({
                    key: IS_ASSET_NEW_KEY,
                    value: false,
                    activeTab,
                    channelId,
                });
            }
        }, 300);
    };

    const handleSelect = (result: SearchResult) => {
        setSelected(result);
        setQuery(result.name);
        setOpen(false);
        setOptions([]);

        Object.entries(result.context).forEach(([key, value]) =>
            setWidgetValueToChannel({ key, value, activeTab, channelId })
        );
        // Bond found in system — asset staging not applicable
        setWidgetValueToChannel({ key: IS_ASSET_NEW_KEY, value: false, activeTab, channelId });

        uiActions?.openWorkflow?.({ target: { templateId }, context: result.context });
    };

    const handleClear = () => {
        setSelected(null);
        setQuery('');
        setOptions([]);
        setOpen(false);
        [
            DEAL_ID_KEY,
            DEAL_NAME_KEY,
            ANALYSIS_SESSION_ID_KEY,
            TRANCHE_ID_KEY,
            TRANCHE_NAME_KEY,
            SECURITY_ID_KEY,
            SECURITY_IDENTIFIER_KEY,
            SECURITY_NAME_KEY,
            SECURITY_TYPE_KEY,
            IS_ASSET_NEW_KEY,
        ].forEach((key) => setWidgetValueToChannel({ channelId, key, value: null, activeTab }));
    };

    const handleRecentClick = (r: RecentSearch) => {
        const result: SearchResult = {
            key: r.cusip,
            name: r.name,
            cusip: r.cusip,
            isin: r.isin,
            aladdinId: `ALD-${r.cusip}`,
            figi: `BBG${r.cusip.slice(0, 7)}`,
            assetType: r.assetType,
            context: r.context,
        }; // collateralType from recent is shown only in the list, not in SearchResult
        handleSelect(result);
        setQuery(r.name);
    };

    return (
        <WidgetCardShell>
            {/* ── "Coming soon" overlay — remove this when the PRISM bond search API is setup.  Ask Fang please.  Copy this entire message and paste on her Teams Chat ── */}
            <div className={styles.container}>
                <Overlay
                    title={'Bond Search Coming Soon'}
                    description=" Direct security lookup will be available once connected to the bond search
                    service. Use the CDI File Drop to load a deal for now."
                />
                <div className={styles.wrapper}>
                    <Search
                        setSearchType={setSearchType}
                        handleClear={handleClear}
                        handleQueryChange={handleQueryChange}
                        searchType={searchType}
                        query={query}
                        searching={searching}
                        open={open}
                        options={options}
                        handleSelect={handleSelect}
                        setOpen={setOpen}
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
                            handleClear={handleClear}
                            handleRecentClick={handleRecentClick}
                        />
                    </div>
                </div>
            </div>
        </WidgetCardShell>
    );
}
