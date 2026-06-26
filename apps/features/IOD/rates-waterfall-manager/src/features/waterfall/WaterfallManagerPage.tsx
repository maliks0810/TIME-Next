import { Loader2, RefreshCw, Save } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { useTreasuryInstruments } from '../../api';
import { cn } from '../../ui/utils';
import { useWaterfallManagerStore } from './store/waterfallManagerStore';
import type { WaterfallManagerTab } from './model/waterfallTypes';
import { WaterfallSetupTab } from './tabs/WaterfallSetupTab';
import { WaterfallTenorInstrumentsTab } from './tabs/WaterfallTenorInstrumentsTab';
import { WaterfallRulesTab } from './tabs/WaterfallRulesTab';
import { WaterfallPreviewTab } from './tabs/WaterfallPreviewTab';
import { WaterfallHistoryTab } from './tabs/WaterfallHistoryTab';
import './waterfall-overrides.css';

const TABS: Array<{ id: WaterfallManagerTab; label: string }> = [
  { id: 'bucketSetup', label: 'Bucket Setup' },
  { id: 'tenorInstruments', label: 'Tenor Instruments' },
  { id: 'rules', label: 'Rules' },
  { id: 'preview', label: 'Preview' },
  { id: 'history', label: 'History' },
];

function renderSelectedTab(tab: WaterfallManagerTab): JSX.Element {
  switch (tab) {
    case 'bucketSetup':
      return <WaterfallSetupTab />;
    case 'tenorInstruments':
      return <WaterfallTenorInstrumentsTab />;
    case 'rules':
      return <WaterfallRulesTab />;
    case 'preview':
      return <WaterfallPreviewTab />;
    case 'history':
      return <WaterfallHistoryTab />;
    default:
      return <WaterfallSetupTab />;
  }
}

export function WaterfallManagerPage(): JSX.Element {
  useTreasuryInstruments();

  const selectedTab = useWaterfallManagerStore((state) => state.selectedTab);
  const setSelectedTab = useWaterfallManagerStore((state) => state.setSelectedTab);
  const loadGraph = useWaterfallManagerStore((state) => state.loadGraph);
  const saveGraph = useWaterfallManagerStore((state) => state.saveGraph);
  const resetDraft = useWaterfallManagerStore((state) => state.resetDraft);
  const isLoading = useWaterfallManagerStore((state) => state.isLoading);
  const isSaving = useWaterfallManagerStore((state) => state.isSaving);
  const dirty = useWaterfallManagerStore((state) => state.dirty);
  const saveStatus = useWaterfallManagerStore((state) => state.saveStatus);
  const error = useWaterfallManagerStore((state) => state.error);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  return (
    <div id="rwm-app-root" className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-full min-h-0 flex-col bg-grey-100 font-sans text-grey-900">
        <header className="flex shrink-0 items-center justify-between border-b border-grey-200 bg-tcw-white px-4 py-3 shadow-[0_1px_2px_rgba(13,13,13,0.04)]">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="rwm-page-title">Waterfall Manager</h1>
            {isSaving ? (
              <span className="rwm-status-badge rwm-status-badge--saving">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </span>
            ) : dirty ? (
              <span className="rwm-status-badge rwm-status-badge--unsaved">Unsaved</span>
            ) : saveStatus === 'saved' ? (
              <span className="rwm-status-badge rwm-status-badge--saved">Saved</span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => void loadGraph()} disabled={isLoading || isSaving} className="rwm-action-button">
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
              Reload
            </button>
            <button type="button" onClick={resetDraft} disabled={!dirty || isSaving} className="rwm-action-button">
              Reset Draft
            </button>
            <button type="button" onClick={() => void saveGraph()} disabled={!dirty || isSaving} className="rwm-primary-button">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </header>

        <div className="flex shrink-0 items-center border-b border-grey-200 bg-tcw-white px-4 py-2">
          <div className="rwm-tab-list">
            {TABS.map((tab) => {
              const active = selectedTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => setSelectedTab(tab.id)} className={cn('rwm-tab-button', active && 'rwm-tab-button--active')}>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="border-b border-grey-200 bg-destructive/10 px-4 py-2 text-[12px] text-destructive">{error}</div>}
        <main className="min-h-0 flex-1 overflow-auto p-4">{renderSelectedTab(selectedTab)}</main>
      </div>
    </div>
  );
}

export default WaterfallManagerPage;
