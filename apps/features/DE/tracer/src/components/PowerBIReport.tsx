// PowerBIReport.tsx
// React + TypeScript Power BI embed. Redesigned layout:
//   - Page tabs live INSIDE the header, to the right of the title/subtitle.
//   - The "View" dropdown (Full screen / Fit to page / Fit to width / Actual
//     size) is pinned to the TOP-RIGHT of the header.
//   - A grey circular spinner shows while the API call is in flight.
// Only VISIBLE report pages are shown (hidden/tooltip/drillthrough filtered).

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models, Report, Page, Embed } from 'powerbi-client';
import PageHeader from './PageHeader';
import './report.css';
import { API_URL } from "../config/env";

// ---------------------------------------------------------------------------
// Types that mirror your Go API's JSON response
// ---------------------------------------------------------------------------

export interface ApiPage {
  displayName: string;
  name: string;
  order: number;
}

export interface EmbedInfo {
  reportId: string;
  embedUrl: string;
  embedToken: string;
  expiration: string;
  datasetNames: string[];
  pages: ApiPage[];
}

interface PowerBIReportProps {
  workspaceId: string;
  reportId: string;
  userRole: string;
  /** Header title / subtitle. */
  title?: string;
  subtitle?: string;
  /** Report height as a % of viewport in normal mode. Default 80 (80vh). */
  heightVh?: number;
  /** Absolute floor (px) so the report never gets too short. Default 480. */
  minHeightPx?: number;
}

interface PowerBIEvent {
  detail?: {
    newPage?: Page;
    message?: string;
  };
}
// ---------------------------------------------------------------------------
// API call method
// ---------------------------------------------------------------------------

export async function fetchEmbedInfo(
  workspaceId: string,
  reportId: string,
  userRole: string
): Promise<EmbedInfo> {

  const baseUrl = API_URL || "https://api-sample-dev.np.tcw.com/test/v1/api";
  const url =
    `${baseUrl}/getEmbedUrl` +
    `?workspaceId=${encodeURIComponent(workspaceId)}` +
    `&reportId=${encodeURIComponent(reportId)}` +
    `&role=${encodeURIComponent(userRole)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    // credentials: 'include', // uncomment if your API relies on cookies/auth
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errBody = (await response.json()) as { error?: string };
      if (errBody?.error) message = errBody.error;
    } catch {
      /* ignore JSON parse errors */
    }
    throw new Error(message);
  }

  return (await response.json()) as EmbedInfo;
}

// ---------------------------------------------------------------------------
// Grey circular spinner
// ---------------------------------------------------------------------------

const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading report…' }) => (
  <div className="pbi-loader" role="status" aria-live="polite">
    <div className="pbi-spinner" aria-hidden="true" />
    <span className="pbi-loader__label">{label}</span>
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PowerBIReport: React.FC<PowerBIReportProps> = ({
  workspaceId,
  reportId,
  userRole = '',
  title = 'ePBRS Insights',
  subtitle = 'Schedules & Email Distribution List',
  heightVh = 80,
  minHeightPx = 480,
}) => {
  const [embedInfo, setEmbedInfo] = useState<EmbedInfo | null>(null);
  const [pages, setPages] = useState<Page[]>([]); // visible pages only
  const [activePage, setActivePage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [displayOption, setDisplayOption] = useState<models.DisplayOption>(
    models.DisplayOption.FitToWidth
  );

  const reportRef = useRef<Report | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch embed info from the Go API.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const info = await fetchEmbedInfo(workspaceId, reportId, userRole);
        if (!cancelled) setEmbedInfo(info);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load report');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, reportId, userRole]);

  // 2. Load visible pages from the embedded report (has `visibility`).
  const loadVisiblePages = useCallback(async () => {
    const report = reportRef.current;
    if (!report) return;
    try {
      const allPages: Page[] = await report.getPages();
      // SectionVisibility enum: AlwaysVisible = 0, HiddenInViewMode = 1
      const visiblePages = allPages.filter(
        (p) => p.visibility === models.SectionVisibility.AlwaysVisible
      );
      setPages(visiblePages);
      if (visiblePages.length > 0) setActivePage(visiblePages[0].name);
    } catch (err) {
      console.error('Failed to load pages:', err);
    }
  }, []);

  // 3. Switch pages using the page `name` (NOT displayName).
  const handlePageChange = useCallback(async (pageName: string) => {
    setActivePage(pageName);
    const report = reportRef.current;
    if (!report) return;
    try {
      await report.setPage(pageName);
    } catch (err) {
      console.error('Failed to set page:', err);
    }
  }, []);

  // 4. Change display option at runtime (Power BI's View menu behavior).
  const applyDisplayOption = useCallback(
    async (option: models.DisplayOption) => {
      const report = reportRef.current;
      if (!report) return;
      try {
        await report.updateSettings({
          layoutType: models.LayoutType.Custom,
          customLayout: { displayOption: option },
        });
        setDisplayOption(option);
      } catch (err) {
        console.error('Failed to update display option:', err);
      } finally {
        setMenuOpen(false);
      }
    },
    []
  );

  // 5. Native (browser) fullscreen on the container.
  const enterFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (el && !document.fullscreenElement) {
      el.requestFullscreen?.().catch((e) => console.error(e));
    }
    setMenuOpen(false);
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch((e) => console.error(e));
    }
    setMenuOpen(false);
  }, []);

  // 6. Sync with the actual browser fullscreen state.
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // 7. Close the View menu on outside-click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const check = (opt: models.DisplayOption) =>
    displayOption === opt ? '✓' : '';

  // ---- Sizing --------------------------------------------------------------
  const embedWrapperStyle: React.CSSProperties = isFullscreen
    ? { flex: 1, minHeight: 0 }
    : { height: `${heightVh}vh`, minHeight: `${minHeightPx}px` };

  const rootClassName = isFullscreen
    ? 'pbi-report-root fullscreen'
    : 'pbi-report-root';

  // ---- Header slots --------------------------------------------------------
  // Tabs (rendered to the right of the subtitle, inside the header).
  const tabs = (
    <nav className="page-tabs" aria-label="Report pages">
      {loading && <span className="page-tabs__hint">Loading pages…</span>}
      {!loading &&
        pages.map((page) => (
          <button
            key={page.name}
            className={activePage === page.name ? 'tab active' : 'tab'}
            onClick={() => handlePageChange(page.name)}
          >
            {page.displayName}
          </button>
        ))}
    </nav>
  );

  // View dropdown (pinned top-right of the header).
  const viewMenu = (
    <div className="view-menu" ref={menuRef}>
      <button
        className="action-btn view-menu__trigger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        title="View"
        disabled={loading || !!error}
      >
        <span aria-hidden="true">🖥</span> View
        <span className="view-menu__caret" aria-hidden="true">▾</span>
      </button>

      {menuOpen && (
        <div className="view-menu__list" role="menu">
          {!isFullscreen ? (
            <button className="view-menu__item" role="menuitem" onClick={enterFullscreen}>
              <span className="view-menu__icon">⛶</span>
              Full screen
            </button>
          ) : (
            <button className="view-menu__item" role="menuitem" onClick={exitFullscreen}>
              <span className="view-menu__icon">🡼</span>
              Exit full screen
            </button>
          )}

          <div className="view-menu__divider" role="separator" />

          <button
            className="view-menu__item"
            role="menuitemradio"
            aria-checked={displayOption === models.DisplayOption.FitToPage}
            onClick={() => applyDisplayOption(models.DisplayOption.FitToPage)}
          >
            <span className="view-menu__check">
              {check(models.DisplayOption.FitToPage)}
            </span>
            Fit to page
          </button>

          <button
            className="view-menu__item"
            role="menuitemradio"
            aria-checked={displayOption === models.DisplayOption.FitToWidth}
            onClick={() => applyDisplayOption(models.DisplayOption.FitToWidth)}
          >
            <span className="view-menu__check">
              {check(models.DisplayOption.FitToWidth)}
            </span>
            Fit to width
          </button>

          <button
            className="view-menu__item"
            role="menuitemradio"
            aria-checked={displayOption === models.DisplayOption.ActualSize}
            onClick={() => applyDisplayOption(models.DisplayOption.ActualSize)}
          >
            <span className="view-menu__check">
              {check(models.DisplayOption.ActualSize)}
            </span>
            Actual size
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={rootClassName}>
      {/* Header now hosts the tabs (middle) and the View dropdown (top-right) */}
      <PageHeader
        title={title}
        subtitle={subtitle}
        tabs={tabs}
        actions={viewMenu}
      />

      {/* Report renders directly beneath the header */}
      <div className="report-embed-wrapper" style={embedWrapperStyle}>
        {loading && <Spinner />}
        {error && <div className="pbi-report-status error">Error: {error}</div>}

        {!loading && !error && embedInfo && (
          <PowerBIEmbed
            embedConfig={{
              type: 'report',
              id: embedInfo.reportId,
              embedUrl: embedInfo.embedUrl,
              accessToken: embedInfo.embedToken,
              tokenType: models.TokenType.Embed,
              settings: {
                layoutType: models.LayoutType.Custom,
                customLayout: {
                  displayOption: models.DisplayOption.FitToWidth,
                },
                bars: { actionBar: { visible: false } },
                panes: {
                  pageNavigation: { visible: false },
                  filters: { expanded: false, visible: false },
                },
              },
            }}
            eventHandlers={
              new Map<string, (event?: PowerBIEvent, embed?: Embed) => void>([
                ['loaded', () => loadVisiblePages()],
                ['rendered', () => console.log('Report rendered')],
                //['error', (event?: any) => console.error(event?.detail)],
                ['error', (event?: PowerBIEvent) => {
                  console.error(event?.detail);
                }],
                [
                  'pageChanged',
                  (event?: PowerBIEvent) => {
                    const newPage = event?.detail?.newPage;
                    if (newPage) {
                      setActivePage(newPage.name);
                    }
                  },
                ],
              ])
            }
            cssClassName="report-style-class"
            getEmbeddedComponent={(embeddedReport: Embed) => {
              reportRef.current = embeddedReport as Report;
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PowerBIReport;
