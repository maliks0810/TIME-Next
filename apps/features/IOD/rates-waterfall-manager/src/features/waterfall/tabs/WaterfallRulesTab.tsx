import { Plus, Trash2 } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { useRwmRhsGroups } from '../../../api';
import { cn } from '../../../ui/utils';
import { sortWaterfallBuckets } from '../model/waterfallClientResolver';
import type { WaterfallBucket, WaterfallRuleSet, WaterfallSide, WaterfallStepInstrumentType } from '../model/waterfallTypes';
import { getWaterfallRuleSetKey, useWaterfallManagerStore } from '../store/waterfallManagerStore';
import { RulesConfiguredInstrumentsPanel } from './RulesConfiguredInstrumentsPanel';

const SIDES: WaterfallSide[] = ['BUY', 'SELL'];
const CUSTOM_RHS = '__CUSTOM_RHS__';

const INSTRUMENT_TYPE_OPTIONS: Array<{ value: WaterfallStepInstrumentType; label: string }> = [
  { value: 'BOND', label: 'CASH' },
  { value: 'FUTURES', label: 'FUTURES' },
  { value: 'BOTH', label: 'BOTH' },
];

export function WaterfallRulesTab(): JSX.Element {
  const rhsGroups = useRwmRhsGroups();
  const buckets = useWaterfallManagerStore((state) => state.graph.buckets);
  const ruleSets = useWaterfallManagerStore((state) => state.graph.ruleSets);
  const selectedRuleSetKey = useWaterfallManagerStore((state) => state.selectedRuleSetKey);
  const setSelectedRuleSetKey = useWaterfallManagerStore((state) => state.setSelectedRuleSetKey);
  const createRuleSet = useWaterfallManagerStore((state) => state.createRuleSet);
  const deleteRuleSet = useWaterfallManagerStore((state) => state.deleteRuleSet);
  const updateRuleSet = useWaterfallManagerStore((state) => state.updateRuleSet);

  const [newRuleName, setNewRuleName] = useState('');
  const [selectedRhs, setSelectedRhs] = useState('');
  const [customRhs, setCustomRhs] = useState('');

  const selectedRuleSet =
    ruleSets.find((ruleSet) => getWaterfallRuleSetKey(ruleSet) === selectedRuleSetKey) ?? ruleSets[0] ?? null;
  const selectedKey = selectedRuleSet ? getWaterfallRuleSetKey(selectedRuleSet) : null;
  const rhsForCreate = selectedRhs === CUSTOM_RHS ? customRhs.trim().toUpperCase() : selectedRhs;

  const handleCreateRhsRule = () => {
    if (!rhsForCreate) return;

    const key = createRuleSet({ name: newRuleName, matchType: 'RHS_GROUP', rhsGroupCode: rhsForCreate });
    setSelectedRuleSetKey(key);
    setNewRuleName('');
    setSelectedRhs('');
    setCustomRhs('');
  };

  const handleCreateCatchAllRule = () => {
    const key = createRuleSet({ name: 'Catch-All Rule', matchType: 'CATCH_ALL', rhsGroupCode: null });
    setSelectedRuleSetKey(key);
  };

  return (
    <div className="waterfall-rules-layout">
      <aside className="waterfall-card rwm-rules-sidebar">
        <div className="border-b border-grey-200 p-3">
          <div className="font-tcw-bold text-sm text-grey-900">RHS Rule Sets</div>
          <p className="mt-1 text-[11px] text-grey-600">
            Specific RHS rule wins first. Catch-all is used only when no RHS rule matches.
          </p>
        </div>

        <div className="space-y-2 border-b border-grey-200 bg-grey-100 p-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-grey-600">Create RHS Rule</div>
          <select
            value={selectedRhs}
            onChange={(event) => setSelectedRhs(event.target.value)}
            className="waterfall-rules-select h-8 w-full rounded-md border border-grey-300 bg-tcw-white px-2 text-[12px] text-grey-900 outline-none focus:border-tcw-blue"
          >
            <option value="">Select RHS group...</option>
            {rhsGroups.map((rhs) => (
              <option key={rhs} value={rhs}>
                {rhs}
              </option>
            ))}
            <option value={CUSTOM_RHS}>+ Custom RHS</option>
          </select>

          {selectedRhs === CUSTOM_RHS && (
            <input
              value={customRhs}
              onChange={(event) => setCustomRhs(event.target.value.toUpperCase())}
              placeholder="RHS group code"
              className="h-8 w-full rounded-md border border-grey-300 bg-tcw-white px-2 text-[12px] font-normal text-grey-900 outline-none focus:border-tcw-blue"
            />
          )}

          <input
            value={newRuleName}
            onChange={(event) => setNewRuleName(event.target.value)}
            placeholder="Rule name, optional"
            className="h-8 w-full rounded-md border border-grey-300 bg-tcw-white px-2 text-[12px] font-normal text-grey-900 outline-none focus:border-tcw-blue"
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button type="button" disabled={!rhsForCreate} onClick={handleCreateRhsRule} className="waterfall-rule-create-button">
              <Plus className="h-3.5 w-3.5" /> RHS Rule
            </button>
            <button type="button" onClick={handleCreateCatchAllRule} className="waterfall-rule-secondary-button">
              <Plus className="h-3.5 w-3.5" /> Catch-All
            </button>
          </div>
        </div>

        <div className="rwm-rule-set-list">
          {ruleSets.length === 0 && (
            <div className="rounded-md border border-dashed border-grey-300 bg-tcw-white px-3 py-2 text-[11px] italic text-grey-600">
              No rule sets yet. Create an RHS rule or catch-all rule.
            </div>
          )}
          {ruleSets.map((ruleSet) => {
            const key = getWaterfallRuleSetKey(ruleSet);
            const active = selectedKey === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedRuleSetKey(key)}
                className={cn('waterfall-rule-set-card', active && 'waterfall-rule-set-card-active')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-[12px]">{ruleSet.name}</span>
                  <span className="text-[10px]">{ruleSet.rules.reduce((sum, row) => sum + row.steps.length, 0)}</span>
                </div>
                <div className="truncate text-[10.5px]">
                  {ruleSet.matchType === 'CATCH_ALL' ? 'Catch-All' : `RHS · ${ruleSet.rhsGroupCode}`}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {selectedRuleSet && selectedKey ? (
        <section className="waterfall-card rwm-rules-editor-shell">
          <div className="rwm-rule-set-title-line">
            <input
              value={selectedRuleSet.name}
              onChange={(event) => updateRuleSet(selectedKey, { name: event.target.value })}
              className="rwm-rule-set-name-input"
            />
            <select
              value={selectedRuleSet.matchType}
              onChange={(event) => updateRuleSet(selectedKey, { matchType: event.target.value as 'RHS_GROUP' | 'CATCH_ALL' })}
              className="waterfall-rules-select rwm-rule-set-match-select"
            >
              <option value="RHS_GROUP">RHS Group</option>
              <option value="CATCH_ALL">Catch-All</option>
            </select>
            {selectedRuleSet.matchType === 'RHS_GROUP' && (
              <input
                value={selectedRuleSet.rhsGroupCode ?? ''}
                onChange={(event) => updateRuleSet(selectedKey, { rhsGroupCode: event.target.value.toUpperCase() })}
                className="rwm-rule-set-rhs-input"
              />
            )}
            <button type="button" onClick={() => deleteRuleSet(selectedKey)} className="waterfall-rule-secondary-button ml-auto">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>

          <RuleSetEditor ruleSetKey={selectedKey} buckets={sortWaterfallBuckets(buckets)} />
          <RulesConfiguredInstrumentsPanel />
        </section>
      ) : (
        <section className="waterfall-card flex min-h-[220px] min-w-0 items-center justify-center p-6 text-center">
          <div>
            <div className="font-tcw-bold text-sm text-grey-900">No Rule Set Selected</div>
            <p className="mt-1 text-[11px] text-grey-600">Create an RHS rule or catch-all rule to configure waterfall steps.</p>
          </div>
        </section>
      )}
    </div>
  );
}

function RuleSetEditor({ ruleSetKey, buckets }: { ruleSetKey: string; buckets: WaterfallBucket[] }): JSX.Element {
  const ruleSet = useWaterfallManagerStore((state) =>
    state.graph.ruleSets.find((candidate) => getWaterfallRuleSetKey(candidate) === ruleSetKey),
  );

  if (!ruleSet) return <div className="p-4 text-[12px] text-grey-600">Rule set is no longer available.</div>;

  return (
    <div className="rwm-rule-editor-area">
      <div className="grid gap-4 xl:grid-cols-2">
        {SIDES.map((side) => (
          <SideRuleGroup key={side} side={side} ruleSetKey={ruleSetKey} ruleSet={ruleSet} buckets={buckets} />
        ))}
      </div>
    </div>
  );
}

function SideRuleGroup({
  side,
  ruleSetKey,
  ruleSet,
  buckets,
}: {
  side: WaterfallSide;
  ruleSetKey: string;
  ruleSet: WaterfallRuleSet;
  buckets: WaterfallBucket[];
}): JSX.Element {
  return (
    <section className="overflow-hidden rounded-lg border border-grey-300 bg-tcw-white">
      <div className="border-b border-grey-200 bg-grey-100 px-3 py-2">
        <div className={cn('text-[11px] font-medium uppercase tracking-[0.16em]', side === 'BUY' ? 'text-tcw-green' : 'text-tcw-plum')}>
          {side} Rules
        </div>
      </div>
      <div className="divide-y divide-grey-200">
        {buckets.map((bucket) => {
          const row = ruleSet.rules.find((rule) => rule.side === side && rule.durationBucketId === bucket.bucketId);
          return (
            <RuleRowEditor
              key={`${side}-${bucket.bucketId}`}
              ruleSetKey={ruleSetKey}
              bucket={bucket}
              side={side}
              steps={row?.steps ?? []}
              buckets={buckets}
            />
          );
        })}
      </div>
    </section>
  );
}

function RuleRowEditor({
  ruleSetKey,
  bucket,
  side,
  steps,
  buckets,
}: {
  ruleSetKey: string;
  bucket: WaterfallBucket;
  side: WaterfallSide;
  steps: Array<{ stepOrder: number; tenorBucketId: number; instrumentType: WaterfallStepInstrumentType }>;
  buckets: WaterfallBucket[];
}): JSX.Element {
  const addRuleStep = useWaterfallManagerStore((state) => state.addRuleStep);
  const updateRuleStep = useWaterfallManagerStore((state) => state.updateRuleStep);
  const removeRuleStep = useWaterfallManagerStore((state) => state.removeRuleStep);
  const moveRuleStep = useWaterfallManagerStore((state) => state.moveRuleStep);

  return (
    <div className="rwm-rule-row-editor">
      <span className="rwm-rule-duration-badge">{bucket.code}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {steps.length === 0 && <span className="text-[11px] italic text-grey-600">No steps.</span>}
          {steps.map((step) => (
            <div key={step.stepOrder} className="rwm-rule-step-chip">
              <span className="rwm-rule-step-order">{step.stepOrder}</span>
              <select
                value={step.tenorBucketId}
                onChange={(event) =>
                  updateRuleStep(ruleSetKey, side, bucket.bucketId, step.stepOrder, { tenorBucketId: Number(event.target.value) })
                }
                className="waterfall-rules-select rwm-rule-step-select"
              >
                {buckets.map((tenor) => (
                  <option key={tenor.bucketId} value={tenor.bucketId}>
                    {side} {tenor.code}
                  </option>
                ))}
              </select>
              {INSTRUMENT_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateRuleStep(ruleSetKey, side, bucket.bucketId, step.stepOrder, { instrumentType: option.value })}
                  aria-pressed={step.instrumentType === option.value}
                  className={cn('waterfall-rule-type-button', step.instrumentType === option.value && 'waterfall-rule-type-button-active')}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                title="Move step left"
                onClick={() => moveRuleStep(ruleSetKey, side, bucket.bucketId, step.stepOrder, 'left')}
                className="waterfall-rule-step-arrow-button"
              >
                ←
              </button>
              <button
                type="button"
                title="Move step right"
                onClick={() => moveRuleStep(ruleSetKey, side, bucket.bucketId, step.stepOrder, 'right')}
                className="waterfall-rule-step-arrow-button"
              >
                →
              </button>
              <button
                type="button"
                title="Remove step"
                onClick={() => removeRuleStep(ruleSetKey, side, bucket.bucketId, step.stepOrder)}
                className="waterfall-rule-step-remove-button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={steps.length >= 3}
          onClick={() => addRuleStep(ruleSetKey, side, bucket.bucketId)}
          className="waterfall-rule-secondary-button rwm-rule-add-step-button"
        >
          + Add step
        </button>
      </div>
    </div>
  );
}

export default WaterfallRulesTab;
