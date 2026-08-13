import React from 'react';
import { BankOutlined } from '@ant-design/icons';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import { useWidgetSize, WidgetSizeBands } from '../../../components/layout/useWidgetSize';
import type { WidgetComponentProps } from '../../../types/widget';
import type { SearchResult, RecentSearch } from './types';
import { SearchInput } from './components/SearchInput';
import { IdentityBadge, IdentifierLine } from './components/SecurityInfo';
import { RecentSearches } from './components/RecentSearches';
import { planSecurityLookup } from './components/planLayout';
import { useRecentSearches } from './hooks/useRecentSearches';
import { DEAL_NAME_KEY, IS_ASSET_NEW_KEY, TRANCHE_NAME_KEY } from '../../constants';
import { useSetWidgetValue, useGetWidgetValue } from '../../../state/Widgets/hooks';
import { useGetActiveTab } from '../../../state/Tabs/hooks';
import styles from './SecurityLookupWidget.module.scss';

// Hook signature needs bands; layout decisions come from planSecurityLookup.
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

    const channelId = widgetInstance?.config?.params?.channel;
    const setWidgetValueToChannel = useSetWidgetValue();
    const activeTab = useGetActiveTab();
    const { recents, addRecent, clearRecents } = useRecentSearches();

    const [query, setQuery] = React.useState('');
    // When another widget (e.g. CDI Extraction) drives the deal, we hide our
    // stale rendered result to avoid confusion until a fresh lookup happens.
    const [dismissed, setDismissed] = React.useState(false);

    const security =
        dismissed ? null : ((result as unknown as SearchResult | undefined) ?? null);

    // What THIS widget last emitted — so we can tell our own emissions apart from
    // deals published by other widgets on the same channel.
    const lastEmittedRef = React.useRef<string | null>(null);
    // Dedupe for the result-driven effect (record-in-recents). Cleared on every
    // user action so re-selecting the SAME deal after an external reset re-fires.
    const lastHandledKeyRef = React.useRef<string | null>(null);

    // Listen to the shared deal-name channel.
    const channelDealName = useGetWidgetValue({ channelId, key: DEAL_NAME_KEY }) as
        | string
        | undefined;

    // Emit downstream from a context blob (works from a live result OR a stored
    // recent — the recent carries the same context, so re-selecting a recent
    // emits deterministically without depending on the cached result changing).
    const emitFromContext = React.useCallback(
        (ctx: Record<string, string> | undefined) => {
            const dealName = ctx?.dealName;
            if (!dealName) return;

            lastEmittedRef.current = String(dealName).toLowerCase();

            setWidgetValueToChannel({ key: DEAL_NAME_KEY, value: dealName, activeTab, channelId });
            setWidgetValueToChannel({ key: IS_ASSET_NEW_KEY, value: 'true', activeTab, channelId });

            const tranche = ctx?.tranche;
            if (ctx?.resolved === 'true' && tranche) {
                setWidgetValueToChannel({ key: TRANCHE_NAME_KEY, value: tranche, activeTab, channelId });
            } else {
                setWidgetValueToChannel({ key: TRANCHE_NAME_KEY, value: null, activeTab, channelId });
            }
        },
        [setWidgetValueToChannel, activeTab, channelId]
    );

    const handleExecute = React.useCallback(() => {
        const t = query.trim();
        if (t.length < 3) return;
        setDismissed(false);              // fresh lookup un-hides results
        lastHandledKeyRef.current = null; // allow re-handling even if result is cached
        execute?.({ identifier: t });
    }, [query, execute]);

    // Record a freshly-arrived result in Recents, and emit it downstream.
    // Deps are honest (no exhaustive-deps disable — that rule isn't registered
    // here and a stale disable fails --report-unused-disable-directives).
    React.useEffect(() => {
        if (!security?.name) return;
        const key = String(security.key ?? security.name);
        if (lastHandledKeyRef.current === key) return; // handle each result once per action
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

    // Reset when the channel deal changes to one WE didn't emit — i.e. another
    // widget (CDI Extraction, etc.) loaded a different deal. Clears the input and
    // hides our now-stale rendered security so the screen isn't confusing.
    React.useEffect(() => {
        if (!channelDealName) return;
        const incoming = String(channelDealName).toLowerCase();
        if (incoming !== lastEmittedRef.current) {
            setQuery('');
            setDismissed(true);
            lastHandledKeyRef.current = null; // allow the same deal to be re-selected later
        }
    }, [channelDealName]);

    // Re-selecting a recent emits DIRECTLY from its stored context — deterministic
    // and cache-proof (the fix for "select A3 → CDI → select A3 again does nothing").
    const pickRecent = React.useCallback(
        (r: RecentSearch) => {
            setQuery(r.name);
            setDismissed(false);
            lastHandledKeyRef.current = null; // re-arm the result effect for a re-select
            emitFromContext(r.context);       // emit now, regardless of result cache
            execute?.({ identifier: r.name }); // refresh the rendered result/loading
        },
        [execute, emitFromContext]
    );

    const plan = planSecurityLookup(cols, heightPx);

    const inputEl = (
        <SearchInput
            query={query}
            onChange={setQuery}
            onExecute={handleExecute}
            onClear={() => setQuery('')}
            searching={!!loading}
        />
    );

    // Recent lane mode maps straight from the plan.
    const recentEl = (lanes: 'two' | 'one' | 'multi') => (
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
                    <span className={styles.titleText}>Security Lookup</span>
                </div>
            )}

            <div className={styles.inputRow}>
                <div className={styles.inputWrap}>{inputEl}</div>
                {security && (
                    <div className={styles.identityWrap}>
                        <IdentityBadge security={security} />
                    </div>
                )}
            </div>

            {security && plan.showIds && <IdentifierLine security={security} showMore />}

            {plan.recent === 'two' && (
                <div className={styles.recentStacked}>{recentEl('two')}</div>
            )}
        </div>
    );

    return (
        <WidgetCardShell overflow="hidden">
            <div ref={ref} className={styles.root}>
                {plan.split ? (
                    <div className={styles.twoPane}>
                        <div className={styles.leftHalf}>{mainColumn}</div>
                        <div className={styles.recentPane}>
                            {recentEl(plan.recent === 'multi' ? 'multi' : 'one')}
                        </div>
                    </div>
                ) : (
                    mainColumn
                )}
            </div>
        </WidgetCardShell>
    );
}