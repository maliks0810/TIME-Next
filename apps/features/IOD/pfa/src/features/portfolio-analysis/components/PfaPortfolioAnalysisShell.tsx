import { Loader2, Search } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type JSX,
} from 'react';
import { createPortal } from 'react-dom';
import { PortfolioAnalysisPage } from './PortfolioAnalysisPage';
import {
  getPortfolioBenchmark,
  getPortfolioGroup,
  getRhsGroup,
  getPortfolioKey,
  getPortfolioName,
  usePfaPortfolioAnalysisContext,
  usePfaPortfolios,
  type PfaPortfolio,
} from '../api/pfaContextApi';

type PopupPosition = { top: number; left: number; width: number };

function normalizePortfolioInput(value: string): string {
  return value.trim().toUpperCase();
}

function readInitialSearchParams(): { portfolioKey: string; tMinusStart: number; lookThrough: boolean } {
  const params = new URLSearchParams(window.location.search);
  const portfolioKey = normalizePortfolioInput(params.get('portfolioKey') ?? '');
  const tMinusStart = Number(params.get('tMinusStart') ?? '5');
  const lookThrough = params.get('lookThrough') === 'true';

  return {
    portfolioKey,
    tMinusStart: Number.isFinite(tMinusStart) && tMinusStart > 0 ? Math.trunc(tMinusStart) : 5,
    lookThrough,
  };
}

function syncSearchParams(portfolioKey: string, tMinusStart: number, lookThrough: boolean): void {
  const params = new URLSearchParams(window.location.search);
  if (portfolioKey) params.set('portfolioKey', portfolioKey);
  else params.delete('portfolioKey');
  params.set('tMinusStart', String(tMinusStart));
  params.set('tMinusEnd', '0');
  if (lookThrough) params.set('lookThrough', 'true');
  else params.delete('lookThrough');
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
}

function portfolioMatchesSearch(portfolio: PfaPortfolio, searchQuery: string): boolean {
  const query = searchQuery.trim().toUpperCase();
  if (!query) return true;
  return [
    getPortfolioKey(portfolio),
    getPortfolioGroup(portfolio),
    getRhsGroup(portfolio),
    getPortfolioName(portfolio),
    getPortfolioBenchmark(portfolio),
  ]
    .join(' ')
    .toUpperCase()
    .includes(query);
}

export function PfaPortfolioAnalysisShell(): JSX.Element {
  const initial = useMemo(readInitialSearchParams, []);
  const [portfolioKey, setPortfolioKey] = useState(initial.portfolioKey);
  const [portfolioSearch, setPortfolioSearch] = useState(initial.portfolioKey);
  const [comparisonTMinus, setComparisonTMinus] = useState(initial.tMinusStart);
  const [lookThroughInput, setLookThroughInput] = useState(initial.lookThrough);
  const [lookThrough, setLookThrough] = useState(initial.lookThrough);
  const [isPortfolioPopupOpen, setIsPortfolioPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const selectorRef = useRef<HTMLFormElement | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const portfoliosQ = usePfaPortfolios();

  const portfolioOptions = useMemo(
    () =>
      (portfoliosQ.data ?? [])
        .filter((portfolio) => portfolioMatchesSearch(portfolio, portfolioSearch))
        .slice(0, 1000),
    [portfolioSearch, portfoliosQ.data],
  );

  const contextState = usePfaPortfolioAnalysisContext({
    portfolioKey: portfolioKey || null,
    comparisonTMinus,
    portfolios: portfoliosQ.data,
    enabled: Boolean(portfolioKey && comparisonTMinus > 0),
  });

  const updatePopupPosition = useCallback((): void => {
    const rect = searchBoxRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPopupPosition({
      top: rect.bottom + 4,
      left: Math.max(8, rect.left),
      width: Math.min(640, window.innerWidth - Math.max(8, rect.left) - 12),
    });
  }, []);

  useLayoutEffect(() => {
    if (isPortfolioPopupOpen) updatePopupPosition();
  }, [isPortfolioPopupOpen, portfolioOptions.length, updatePopupPosition]);

  useEffect(() => {
    syncSearchParams(portfolioKey, comparisonTMinus, lookThrough);
  }, [comparisonTMinus, lookThrough, portfolioKey]);

  useEffect(() => {
    const handlePopState = (): void => {
      const next = readInitialSearchParams();
      setPortfolioKey(next.portfolioKey);
      setPortfolioSearch(next.portfolioKey);
      setComparisonTMinus(next.tMinusStart);
      setLookThroughInput(next.lookThrough);
      setLookThrough(next.lookThrough);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (selectorRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      setIsPortfolioPopupOpen(false);
    };
    const reposition = (): void => updatePopupPosition();
    document.addEventListener('mousedown', closeOnOutside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [updatePopupPosition]);

  const loadPortfolio = useCallback(
    (nextValue = portfolioSearch): void => {
      const nextPortfolioKey = normalizePortfolioInput(nextValue);
      setPortfolioKey(nextPortfolioKey);
      setPortfolioSearch(nextPortfolioKey);
      setLookThrough(lookThroughInput);
      setIsPortfolioPopupOpen(false);
    },
    [lookThroughInput, portfolioSearch],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    loadPortfolio();
  };

  const portfolioPopup =
    isPortfolioPopupOpen && portfolioOptions.length && popupPosition
      ? createPortal(
          <div ref={popupRef} className="pfa-portfolio-popup" style={popupPosition}>
            <div className="pfa-portfolio-popup-header">
              <span>Key</span>
              <span>PF Group</span>
              <span>RHS Group</span>
              <span>Portfolio Name</span>
              <span>Benchmark</span>
            </div>
            {portfolioOptions.map((portfolio) => (
              <button
                type="button"
                key={`${getPortfolioKey(portfolio)}-${getPortfolioGroup(portfolio)}-${getRhsGroup(portfolio)}-${getPortfolioName(portfolio)}`}
                className="pfa-portfolio-popup-row"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => loadPortfolio(getPortfolioKey(portfolio))}
              >
                <span className="pfa-portfolio-popup-key">{getPortfolioKey(portfolio)}</span>
                <span>{getPortfolioGroup(portfolio) || '-'}</span>
                <span>{getRhsGroup(portfolio) || '-'}</span>
                <span>{getPortfolioName(portfolio) || '-'}</span>
                <span>{getPortfolioBenchmark(portfolio) || '-'}</span>
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  const toolbarSelector = (
    <form ref={selectorRef} className="pfa-toolbar-selector" onSubmit={handleSubmit}>
      <div ref={searchBoxRef} className="pfa-toolbar-portfolio-search">
        <Search size={12} strokeWidth={2} className="portfolio-analysis-search-icon" />
        <input
          value={portfolioSearch}
          onChange={(event) => {
            setPortfolioSearch(event.target.value);
            setIsPortfolioPopupOpen(true);
          }}
          onFocus={() => setIsPortfolioPopupOpen(true)}
          placeholder="Portfolio"
          className="portfolio-analysis-search-input"
        />
        {portfolioPopup}
      </div>
      <label className="pfa-toolbar-tminus" title="Compare selected T-minus offset to T">
        <span>T-</span>
        <input
          type="number"
          min={1}
          value={comparisonTMinus}
          onChange={(event) => setComparisonTMinus(Math.max(1, Math.trunc(Number(event.target.value) || 1)))}
        />
        <span>to T</span>
      </label>
      <button
        type="button"
        className="portfolio-analysis-group-pill pfa-look-through-toggle"
        data-active={lookThroughInput}
        aria-pressed={lookThroughInput}
        title={
          lookThroughInput
            ? 'Look-through will be applied when Load is clicked'
            : 'Standard positions will be applied when Load is clicked'
        }
        onClick={() => setLookThroughInput((current) => !current)}
      >
        <span>Look Through</span>
        <span className="pfa-look-through-toggle__state">
          {lookThroughInput ? 'On' : 'Off'}
        </span>
      </button>
      <button type="submit" className="portfolio-analysis-toolbar-button pfa-toolbar-load-button" title="Load selected portfolio">
        Load
      </button>
    </form>
  );

  if (contextState.context) {
    return (
      <PortfolioAnalysisPage
        context={contextState.context}
        toolbarLeftContent={toolbarSelector}
        lookThrough={lookThrough}
      />
    );
  }

  return (
    <div className="portfolio-analysis-page portfolio-analysis-page--empty flex h-full min-h-0 flex-col bg-grey-100">
      <section className="portfolio-analysis-page-header portfolio-analysis-page-header--empty">
        <div className="portfolio-analysis-summary portfolio-analysis-summary--empty">
          <div className="portfolio-analysis-summary-left">
            <div className="portfolio-analysis-app-title">PORTFOLIO ANALYZER</div>
          </div>
          <div className="portfolio-analysis-summary-center" />
          <div className="portfolio-analysis-summary-right" />
        </div>
      </section>
      <section className="portfolio-analysis-toolbar-shell">
        <div data-portfolio-analysis-toolbar-root className="portfolio-analysis-toolbar portfolio-analysis-toolbar--pfa-selector">
          <div className="portfolio-analysis-toolbar-left portfolio-analysis-toolbar-left--wide">{toolbarSelector}</div>
          <div className="portfolio-analysis-toolbar-center" />
          <div className="portfolio-analysis-toolbar-right" />
        </div>
      </section>
      {!portfolioKey ? (
        <EmptyState title="Select a portfolio" message="Type a portfolio key such as 702T, then press Enter or Load." />
      ) : portfoliosQ.isLoading || contextState.isLoading ? (
        <LoadingState />
      ) : portfoliosQ.isError || contextState.isError ? (
        <EmptyState title="Unable to load Portfolio Analysis" message="The selected portfolio or T-minus range could not be loaded from the PDM API." />
      ) : (
        <EmptyState title="No data loaded" message="The selected portfolio and T-minus range did not return enough portfolio analytics rows." />
      )}
    </div>
  );
}

function LoadingState(): JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-slate-600">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading Portfolio Analysis...
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }): JSX.Element {
  return (
    <div className="portfolio-analysis-empty-state">
      <div className="portfolio-analysis-empty-card">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-2 text-sm text-slate-600">{message}</div>
      </div>
    </div>
  );
}
