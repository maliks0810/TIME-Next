import React from 'react';
import clsx from 'clsx';
import { BankOutlined } from '@ant-design/icons';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import {
    useWidgetSize,
    WidgetSizeBands,
} from '../../../components/layout/useWidgetSize';
import type { WidgetComponentProps } from '../../../types/widget';
import { useTheme } from '../../../theme/ThemeContext';
import type { SearchResult, RecentSearch } from './types';
import { SearchInput } from './components/SearchInput';
import {
    IdentityBadge,
    IdentifierLine,
} from './components/SecurityInfo';
import { RecentSearches } from './components/RecentSearches';
import { planSecurityLookup } from './components/planLayout';
import { useRecentSearches } from './hooks/useRecentSearches';
import {
    DEAL_NAME_KEY,
    IS_ASSET_NEW_KEY,
    TRANCHE_NAME_KEY,
} from '../../constants';
import {
    useSetWidgetValue,
    useGetWidgetValue,
} from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import styles from './SecurityLookupWidget.module.scss';

const SL_BANDS: WidgetSizeBands = {
    width: { wb: 6, wc: 9 },
    height: { h2: 110, h3: 160, h4: 210 },
};

export default function SecurityLookupWidget({
    widgetInstance,
    result,
    loading,
    execute,
}: WidgetComponentProps) {
    const { ref, cols, heightPx } = useWidgetSize(SL_BANDS);
    const { themeName } = useTheme();

    const isWealthTheme =
        themeName === 'wealthLight' ||
        themeName === 'wealthDark';
    const isWealthLight = themeName === 'wealthLight';
    const isWealthDark = themeName === 'wealthDark';

    const channelId = widgetInstance?.config?.params?.channel;
    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();
    const { recents, addRecent, clearRecents } = useRecentSearches();

    const [query, setQuery] = React.useState('');

    // When another widget (for example, CDI Extraction) drives the deal, hide
    // this widget's stale rendered result until a fresh lookup occurs.
    const [dismissed, setDismissed] = React.useState(false);

    const security = dismissed
        ? null
        : ((result as unknown as SearchResult | undefined) ?? null);

    // Track the deal most recently emitted by this widget so its own channel
    // update can be distinguished from a deal published by another widget.
    const lastEmittedRef = React.useRef<string | null>(null);

    // Handle each returned lookup result once per explicit user action.
    const lastHandledKeyRef = React.useRef<string | null>(null);

    const channelDealName = useGetWidgetValue({
        channelId,
        key: DEAL_NAME_KEY,
    }) as string | undefined;

    // Publish only resolved security context. Security Lookup intentionally has
    // no collateral-filter responsibilities.
    const emitFromContext = React.useCallback(
        (context: Record<string, string> | undefined) => {
            const dealName = context?.dealName;
            if (!dealName) return;

            lastEmittedRef.current = String(dealName).toLowerCase();

            setWidgetValueToChannel({
                key: DEAL_NAME_KEY,
                value: dealName,
                activeTab,
                channelId,
            });

            setWidgetValueToChannel({
                key: IS_ASSET_NEW_KEY,
                value: 'true',
                activeTab,
                channelId,
            });

            const tranche = context?.tranche;

            if (context?.resolved === 'true' && tranche) {
                setWidgetValueToChannel({
                    key: TRANCHE_NAME_KEY,
                    value: tranche,
                    activeTab,
                    channelId,
                });
            } else {
                setWidgetValueToChannel({
                    key: TRANCHE_NAME_KEY,
                    value: null,
                    activeTab,
                    channelId,
                });
            }
        },
        [setWidgetValueToChannel, activeTab, channelId],
    );

    const handleExecute = React.useCallback(() => {
        const identifier = query.trim();
        if (identifier.length < 3) return;

        setDismissed(false);
        lastHandledKeyRef.current = null;
        execute?.({ identifier });
    }, [query, execute]);

    // Record a newly returned lookup result in Recents and publish its context.
    React.useEffect(() => {
        if (!security?.name) return;

        const key = String(security.key ?? security.name);
        if (lastHandledKeyRef.current === key) return;

        lastHandledKeyRef.current = key;

        addRecent({
            name: security.name,
            cusip: security.cusip,
            isin: security.isin,
            assetType: security.assetType,
            collateralType: '',
            context: security.context ?? {},
            usedAt: Date.now(),
        });

        emitFromContext(security.context);
    }, [security, addRecent, emitFromContext]);

    // Clear the local query and hide stale identity data when another widget
    // publishes a different deal on this channel.
    React.useEffect(() => {
        if (!channelDealName) return;

        const incoming = String(channelDealName).toLowerCase();

        if (incoming !== lastEmittedRef.current) {
            setQuery('');
            setDismissed(true);
            lastHandledKeyRef.current = null;
        }
    }, [channelDealName]);

    // Re-selecting a recent lookup emits its stored context immediately and
    // refreshes the rendered lookup result.
    const pickRecent = React.useCallback(
        (recent: RecentSearch) => {
            setQuery(recent.name);
            setDismissed(false);
            lastHandledKeyRef.current = null;

            emitFromContext(recent.context);
            execute?.({ identifier: recent.name });
        },
        [execute, emitFromContext],
    );

    const plan = planSecurityLookup(cols, heightPx);

    const inputElement = (
        <SearchInput
            query={query}
            onChange={setQuery}
            onExecute={handleExecute}
            onClear={() => setQuery('')}
            searching={Boolean(loading)}
        />
    );

    const recentElement = (lanes: 'two' | 'one' | 'multi') => (
        <RecentSearches
            recents={recents}
            onPick={pickRecent}
            onClear={clearRecents}
            lanes={lanes}
        />
    );

    const mainColumn = (
        <div className={styles.main}>
            {plan.showTitle && (
                <div className={styles.title}>
                    <BankOutlined className={styles.titleIcon} />
                    <span className={styles.titleText}>
                        Security Lookup
                    </span>
                </div>
            )}

            <div className={styles.inputRow}>
                <div className={styles.inputWrap}>
                    {inputElement}
                </div>

                {security && (
                    <div className={styles.identityWrap}>
                        <IdentityBadge security={security} />
                    </div>
                )}
            </div>

            {security && plan.showIds && (
                <IdentifierLine security={security} showMore />
            )}

            {plan.recent === 'two' && (
                <div className={styles.recentStacked}>
                    {recentElement('two')}
                </div>
            )}
        </div>
    );

    return (
        <WidgetCardShell overflow="hidden">
            <div
                ref={ref}
                className={clsx(styles.root, {
                    [styles.wealth]: isWealthTheme,
                    [styles.wealthLight]: isWealthLight,
                    [styles.wealthDark]: isWealthDark,
                })}
            >
                {plan.split ? (
                    <div className={styles.twoPane}>
                        <div className={styles.leftHalf}>
                            {mainColumn}
                        </div>

                        <div className={styles.recentPane}>
                            {recentElement(
                                plan.recent === 'multi' ? 'multi' : 'one',
                            )}
                        </div>
                    </div>
                ) : (
                    mainColumn
                )}
            </div>
        </WidgetCardShell>
    );
}
