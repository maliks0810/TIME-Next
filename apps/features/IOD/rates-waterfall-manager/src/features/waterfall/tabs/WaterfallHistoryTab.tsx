import { RefreshCw } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useWaterfallAudit, type WaterfallAuditEvent } from '../api/waterfallApi';
import { cn } from '../../../ui/utils';
import { buildWaterfallAuditDiff, type WaterfallAuditChangeArea } from './history/waterfallAuditDiff';
import { formatAuditActor, formatAuditReason, formatAuditTime, shortRequestId } from './history/waterfallAuditFormat';

const AREAS: WaterfallAuditChangeArea[] = ['Buckets', 'Tenor Instruments', 'Rule Sets', 'Rule Steps'];

export function WaterfallHistoryTab(): JSX.Element {
  const auditQuery = useWaterfallAudit();
  const events = auditQuery.data ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) =>
      `${event.actor} ${event.actionType} ${event.entityType} ${event.changeReason ?? ''} ${event.requestId ?? ''}`.toLowerCase().includes(term),
    );
  }, [events, search]);

  const selectedEvent = filteredEvents.find((event) => event.auditEventId === selectedId) ?? filteredEvents[0] ?? null;

  return (
    <div className="rwm-history-tab">
      <section className="rwm-card rwm-history-list-card">
        <div className="rwm-history-toolbar rwm-history-toolbar--compact">
          <div className="rwm-history-title-line">
            <h2 className="rwm-history-title">History</h2>
            <span className="rwm-history-subtitle-inline">Waterfall save audit trail</span>
          </div>
          <button type="button" onClick={() => void auditQuery.refetch()} className="rwm-action-button" disabled={auditQuery.isFetching}>
            <RefreshCw className={cn('h-3.5 w-3.5', auditQuery.isFetching && 'animate-spin')} />
            Refresh
          </button>
        </div>

        <div className="border-b border-grey-200 p-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search actor or reason..."
            className="h-8 w-full rounded-md border border-grey-300 bg-tcw-white px-2 text-[12px] outline-none focus:border-tcw-blue"
          />
        </div>

        <div className="rwm-history-event-list">
          {auditQuery.isLoading && <div className="p-3 text-[12px] text-grey-600">Loading history...</div>}
          {auditQuery.isError && <div className="p-3 text-[12px] text-destructive">Failed to load waterfall history.</div>}
          {!auditQuery.isLoading && filteredEvents.length === 0 && <div className="p-3 text-[12px] text-grey-600">No history events found.</div>}
          {filteredEvents.map((event) => (
            <AuditEventRow
              key={event.auditEventId}
              event={event}
              selected={selectedEvent?.auditEventId === event.auditEventId}
              onSelect={() => setSelectedId(event.auditEventId)}
            />
          ))}
        </div>
      </section>

      <section className="rwm-card rwm-history-detail-card">
        {selectedEvent ? <AuditEventDetail event={selectedEvent} /> : <div className="p-4 text-[12px] text-grey-600">Select a history event.</div>}
      </section>
    </div>
  );
}

function AuditEventRow({ event, selected, onSelect }: { event: WaterfallAuditEvent; selected: boolean; onSelect: () => void }): JSX.Element {
  return (
    <button type="button" onClick={onSelect} className={cn('rwm-history-event-row rwm-history-event-row--two-line', selected && 'rwm-history-event-row--active')}>
      <div className="rwm-history-event-line">
        <span className="truncate font-medium text-grey-900">{formatAuditTime(event.actedAt)}</span>
        <span className="rwm-history-chip">{event.actionType}</span>
      </div>
      <div className="rwm-history-event-line mt-1 text-[11px] text-grey-600">
        <span className="truncate">{formatAuditActor(event.actor)}</span>
        <span className="truncate text-right">{formatAuditReason(event)}</span>
      </div>
    </button>
  );
}

function AuditEventDetail({ event }: { event: WaterfallAuditEvent }): JSX.Element {
  const diff = useMemo(() => buildWaterfallAuditDiff(event.beforeJson, event.afterJson), [event.afterJson, event.beforeJson]);

  return (
    <div className="rwm-history-detail">
      <div className="rwm-history-detail-header">
        <div>
          <div className="rwm-history-title">{formatAuditTime(event.actedAt)}</div>
          <div className="mt-1 text-[12px] text-grey-600">{formatAuditActor(event.actor)}</div>
        </div>
        <div className="text-right text-[11px] text-grey-600">
          <div>{event.entityType}</div>
          <div>{event.actionType}</div>
          <div title={event.requestId ?? undefined}>Request {shortRequestId(event.requestId)}</div>
        </div>
      </div>

      <div className="rwm-history-reason">{formatAuditReason(event)}</div>

      <div className="rwm-history-summary-grid">
        {AREAS.map((area) => (
          <div key={area} className="rwm-history-summary-card">
            <div className="text-[10px] uppercase tracking-[0.12em] text-grey-600">{area}</div>
            <div className="mt-1 font-tcw-bold text-sm text-grey-900">{diff.counts[area]}</div>
          </div>
        ))}
      </div>

      {diff.parseError && <div className="rwm-history-parse-error">Could not fully parse audit JSON: {diff.parseError}</div>}

      <div className="rwm-history-change-sections">
        {AREAS.map((area) => {
          const changes = diff.changes.filter((change) => change.area === area);
          return <ChangeSection key={area} area={area} changes={changes} />;
        })}
      </div>

      <details className="rwm-history-json-details">
        <summary>Raw JSON</summary>
        <div className="rwm-history-json-grid">
          <pre>{formatJson(event.beforeJson)}</pre>
          <pre>{formatJson(event.afterJson)}</pre>
        </div>
      </details>
    </div>
  );
}

function ChangeSection({ area, changes }: { area: WaterfallAuditChangeArea; changes: ReturnType<typeof buildWaterfallAuditDiff>['changes'] }): JSX.Element {
  return (
    <section className="rwm-history-change-section">
      <div className="rwm-history-change-section-title">{area}</div>
      {changes.length === 0 ? (
        <div className="rwm-history-empty-change">No changes</div>
      ) : (
        <div className="space-y-2">
          {changes.map((change, index) => (
            <div key={`${change.area}-${change.kind}-${change.title}-${index}`} className="rwm-history-change-row">
              <div className="flex items-center justify-between gap-2">
                <span className={cn('rwm-history-kind', `rwm-history-kind--${change.kind}`)}>{change.kind}</span>
                <span className="truncate text-[12px] font-medium text-grey-900">{change.title}</span>
              </div>
              {change.detail && <div className="mt-1 text-[11px] text-grey-600">{change.detail}</div>}
              {change.fields?.length ? (
                <div className="mt-2 space-y-1">
                  {change.fields.map((field) => (
                    <div key={field.field} className="rwm-history-field-row">
                      <span>{field.field}</span>
                      <span className="truncate text-grey-600">{field.before}</span>
                      <span className="truncate text-grey-900">{field.after}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatJson(value?: string | null): string {
  const text = String(value ?? '').trim();
  if (!text) return '—';
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(typeof parsed === 'string' ? JSON.parse(parsed) : parsed, null, 2);
  } catch {
    return text;
  }
}

export default WaterfallHistoryTab;
