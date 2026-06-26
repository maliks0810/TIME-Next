# ARC Workflow Configuration Management — Implementation Spec

## Context

This spec targets the existing codebase at `apps/features/trap/arc/src/`. All implementation must
use the patterns, libraries, and conventions already established there. Do **not** introduce
Tailwind, React Query, Radix/ShadCN, or any new state management library.

---

## Goal

Add a "Workflow Configurations" panel to the existing ARC app that lets Risk Analysts create, edit,
clone, and delete **Asset Workflow Configurations** — the rules that govern how an asset moves
through the analytics workflow (callable + speed overrides → review type).

---

## Where It Lives in App.tsx

**File:** `src/App.tsx`

Currently the `arcContainer` div renders two children: `<NewAssetsContent>` and a column containing
`<NewAssetsList>`. The configuration panel is a **third sibling column** added to the right of
`<NewAssetsList>`. Wrap the two existing columns in a flex row, and add the new column below or
beside — matching the current flex layout of `.arcContainer` (see `src/lib/styles.scss:1–20`).

Add a toggle button (Ant Design `<Segmented>` or `<Button.Group>`) near the existing
`<Button onClick={handleToggleRequestModal}>` to switch between the **Asset List view** (current)
and the new **Configurations view**. Use a local `useState<'assets' | 'configs'>` called `activeView`
to swap the rendered panel.

```tsx
// In App.tsx — add alongside existing useState hooks
const [activeView, setActiveView] = useState<'assets' | 'configs'>('assets');
```

Render `<WorkflowConfigPanel />` when `activeView === 'configs'` in place of the existing list + button group.

---

## Tech Stack Constraints

| Concern           | Use This (already in project)                              |
|-------------------|------------------------------------------------------------|
| UI components     | Ant Design 5 — `Table`, `Form`, `Modal`, `Select`, `Input`, `Switch`, `Tabs`, `Collapse` |
| HTTP              | `serviceRequest` from `src/lib/serviceUtils.ts`            |
| Date handling     | `dayjs` (already imported in helpers)                      |
| Form state        | `Form.useForm()` + `Form.useWatch()` (see `RequestNewAsset/index.tsx`) |
| Notifications     | `message.useMessage()` → `messageApi.error/success`        |
| Styling           | Extend `src/lib/styles.scss` — add new BEM classes         |
| Types             | Extend `src/lib/types.ts` and `src/shared/types.ts`        |

---

## New Types

Add to `src/lib/types.ts`:

```typescript
// Maps to the COLLATERAL_TYPE and CALLABLE PayloadItems already in the codebase.
export type ReviewType =
    | 'Full Automation'
    | 'Inputs Review'
    | 'Analytics Review'
    | 'Full Review';

export type WorkflowRule = {
    callable: 'Y' | 'N' | 'C';       // reuse the Callable union from PayloadItem
    speedOverridesExist: boolean;      // mirrors speedOverridesExist() in src/lib/helpers.tsx
    reviewType: ReviewType;
};

export type WorkflowConfig = {
    configurationId: number;
    workflowId: string;
    assetType: string;
    assetSubType?: string;
    collateralType?: string;           // reuse the collateralType values from PayloadItem
    isActive: boolean;
    defaultOverrides: PayloadItem[];   // reuse the existing PayloadItem discriminated union
    workflowRules: WorkflowRule[];
    defaultReviewType: ReviewType;
    modifiedBy: string;
    modifiedAt: string;                // ISO string, format with formatIso() from src/lib/helpers.tsx
};

export type WorkflowConfigRequest = Omit<WorkflowConfig, 'workflowConfigId' | 'modifiedBy' | 'modifiedAt'>;
```

---

## New Services

Create `src/features/WorkflowConfig/lib/services.ts`, following the exact pattern in
`src/lib/services.ts` (each function calls `serviceRequest(baseURL).post(endpoint, payload)`):

```typescript
const baseURL = '/api/v1';

export const getWorkflowConfigs  = () => serviceRequest(baseURL).get('/workflow-configs');
export const getWorkflowConfigById = (id: number) => serviceRequest(baseURL).post('/workflow-configs/get-by-id', { workflowConfigId: id });
export const createWorkflowConfig  = (payload: WorkflowConfigRequest) => serviceRequest(baseURL).post('/workflow-configs/create', payload);
export const updateWorkflowConfig  = (id: number, payload: WorkflowConfigRequest) => serviceRequest(baseURL).post('/workflow-configs/update', { workflowConfigId: id, ...payload });
export const deleteWorkflowConfig  = (id: number) => serviceRequest(baseURL).post('/workflow-configs/delete', { workflowConfigId: id });
```

---

## File/Component Structure

```
src/features/WorkflowConfig/
├── index.tsx                    ← WorkflowConfigPanel (root, replaces asset list area)
├── lib/
│   ├── types.ts                 ← re-export WorkflowConfig types from src/lib/types.ts
│   ├── services.ts              ← API calls above
│   ├── helpers.ts               ← evaluateRules(), buildDefaultOverrides()
│   └── constants.ts             ← REVIEW_TYPE_OPTIONS, COLLATERAL_TYPE_OPTIONS (reuse shared/constants.ts values)
└── components/
    ├── ConfigList.tsx           ← Ant Design Table (middle column)
    ├── ConfigDetails.tsx        ← Tabs panel (right column)
    ├── tabs/
    │   ├── GeneralTab.tsx       ← Form fields
    │   ├── DefaultOverridesTab.tsx ← Visual + JSON toggle
    │   ├── WorkflowLogicTab.tsx ← Rule cards + rule editor
    │   └── HistoryTab.tsx       ← Versioned records table
    ├── RuleCard.tsx             ← Single rule display (IF/THEN card)
    ├── RuleEditor.tsx           ← Add/edit rule form
    └── PreviewOutcome.tsx       ← Evaluate rules against sample inputs
```

---

## Layout: WorkflowConfigPanel (index.tsx)

Use a flex-row layout matching `.arcContainer` in `src/lib/styles.scss`. Three columns:

```
| ConfigList (35%) | ConfigDetails (65%) |
```

No sidebar — filtering lives in an inline Ant Design `<Input.Search>` and `<Select>` dropdowns above
the `ConfigList`, following the compact header pattern in `src/features/ActionBar/index.tsx`
(flexbox, gap 8px, padding 8px).

Selected config state: `useState<WorkflowConfig | null>(selectedConfig)` — same pattern as
`selectedRow` in `App.tsx`.

---

## ConfigList (ConfigList.tsx)

Use Ant Design `<Table>` with these columns:

| Column         | Source field                              |
|----------------|-------------------------------------------|
| Asset Type     | `assetType`                               |
| Sub Type       | `assetSubType ?? '—'`                     |
| Collateral     | `collateralType ?? '—'`                   |
| Workflow       | `workflowId`                              |
| Active         | `<Switch checked={isActive} disabled />`  |
| Modified       | `formatIso(modifiedAt)` (from `src/lib/helpers.tsx:formatIso`) |
| Actions        | Edit / Clone / Delete icon buttons        |

Sorting: default `modifiedAt` descending.

Row click: set `selectedConfig`. Highlight via `rowClassName` returning `'niSelectedRow'` (the class
already defined in `src/lib/styles.scss`) when row matches `selectedConfig?.workflowConfigId`.

Delete: wrap in Ant Design `<Popconfirm>` (same pattern used for AbandonButton in ActionBar).

Clone: call `createWorkflowConfig` with the selected config's fields, then refresh list.

---

## ConfigDetails (ConfigDetails.tsx)

Ant Design `<Tabs>` with four tabs — use the `.tabsWrapper` class already in
`src/lib/styles.scss` for consistent tab styling.

Props:
```typescript
type ConfigDetailsProps = {
    config: WorkflowConfig | null;
    onSave: (updated: WorkflowConfigRequest) => Promise<void>;
    onClose: () => void;
};
```

When `config` is `null`, show a centered empty state: `"Select a configuration to view details"`.

---

## GeneralTab.tsx

Ant Design `<Form>` — follow the `RequestNewAsset/index.tsx` pattern exactly:
- Grid layout: `gridTemplateColumns: '140px 1fr'`
- `Form.Item` with `rules={[{ required: true }]}`

Fields:

| Label            | Component                          | Field             |
|------------------|------------------------------------|-------------------|
| Workflow         | `<Select>` (options from constants)| `workflowId`      |
| Asset Type       | `<Input>`                          | `assetType`       |
| Asset Sub Type   | `<Input>`                          | `assetSubType`    |
| Collateral Type  | `<Select>` reuse `AssetInfoSelectCollateralType` options from `shared/constants.ts` | `collateralType` |
| Active           | `<Switch>` (Ant Design)            | `isActive`        |

Uniqueness validation: on save, before calling the API, check that no existing config in the loaded
list shares the same `(workflowId, assetType, assetSubType, collateralType)` tuple. Show
`messageApi.error()` if duplicate found.

Buttons: Save + Cancel — same styling as `AssetInfo/index.tsx` submit button (`.advanceButton` CSS
class for Save, plain `<Button>` for Cancel).

---

## DefaultOverridesTab.tsx

Toggle between two views using `useState<'visual' | 'json'>('visual')` and Ant Design
`<Segmented options={['Visual', 'JSON']} />`.

### Visual Mode

Map `config.defaultOverrides: PayloadItem[]` to form fields. The `PayloadItem` discriminated union
is already defined in `src/lib/types.ts` — use `item.type` to switch:

| PayloadItem type     | Visual control                                        |
|----------------------|-------------------------------------------------------|
| `CALLABLE`           | `<Select options={['Y','N','C']}>`                   |
| `COLLATERAL_TYPE`    | Reuse `AssetInfoSelectCollateralType` component       |
| `SECURITY_SETTINGS`  | Two `<Input>` for interestRateScenario + modelFamilyOverride |
| `SPEED_OVERRIDES`    | `<Switch>` toggling whether overrides exist; when enabled show prepayment/default fields matching `RequestNewAsset/index.tsx` |
| `CALL_DATE`          | Reuse `TRAPDatePicker` from `src/lib/helpers.tsx`     |

### JSON Mode

Use a `<textarea>` with `JSON.stringify(config.defaultOverrides, null, 2)`. On blur, attempt
`JSON.parse()` and show `messageApi.error()` if invalid. Lazy load (do not render until tab is
selected) — wrap in `{activeTab === 'overrides' && <JsonEditor />}`.

Helper to build back the `PayloadItem[]` from form values:

```typescript
// src/features/WorkflowConfig/lib/helpers.ts
export function buildDefaultOverrides(formValues: Record<string, unknown>): PayloadItem[] {
    // construct PayloadItem[] matching the discriminated union in src/lib/types.ts
    // follow the same construction pattern used in RequestNewAsset/index.tsx onFinish
}
```

---

## WorkflowLogicTab.tsx

### Rule Cards

Render `config.workflowRules` as a list of `<RuleCard>` components:

```
IF:
  Callable = Y
  Speed Overrides = true
THEN:
  Inputs Review
```

Color-code the THEN badge by `reviewType`:
- Full Automation → `color: #709e46` (`.advanceButton` green from styles.scss)
- Inputs Review → `color: #b86544` (`.actionBarHeader` orange)
- Analytics Review → `color: #287064` (`.securitySettingsHeader` teal)
- Full Review → `color: #a02cc7` (`.claimButton` purple)

These exact colors are already defined in `src/lib/styles.scss`.

### Rule Editor (RuleEditor.tsx)

Ant Design `<Form>` with three fields:
- Callable: `<Select options={['Y','N','C']}>`
- Speed Overrides Exist: `<Switch>`
- Review Type: `<Select options={REVIEW_TYPE_OPTIONS}>`

Add Rule button triggers a local modal (same `<Modal>` pattern as `RequestNewAsset`) with this form.
Edit: pre-populate the modal form with the rule's values.
Reorder: wrap list in Ant Design `<List>` with up/down arrow `<Button>` controls (no drag needed).

### Default Review Type

A `<Select>` below the rule list for `config.defaultReviewType`. Label: "Default (no rule matches):".

### Preview Outcome (PreviewOutcome.tsx)

A collapsible section (Ant Design `<Collapse>`) at the bottom of the tab:

```
▶ Preview Outcome

  Callable:         [Select Y/N/C]
  Speed Overrides:  [Switch]

  Result: → Inputs Review   (colored badge)
```

Logic: `evaluateRules()` in `src/features/WorkflowConfig/lib/helpers.ts`:

```typescript
export function evaluateRules(
    rules: WorkflowRule[],
    defaultReviewType: ReviewType,
    input: { callable: 'Y' | 'N' | 'C'; speedOverridesExist: boolean }
): ReviewType {
    return (
        rules.find(
            (r) => r.callable === input.callable && r.speedOverridesExist === input.speedOverridesExist
        )?.reviewType ?? defaultReviewType
    );
}
```

Compare to `speedOverridesExist()` in `src/lib/helpers.tsx` which performs the same boolean check
against a live asset's `PayloadItem[]`.

---

## HistoryTab.tsx

Ant Design `<Table>` with columns: Version, Modified By, Modified Date, View Diff.

"View Diff" opens an Ant Design `<Modal>` showing a side-by-side `<pre>` diff of two JSON payloads.
Format dates with `formatIso()` from `src/lib/helpers.tsx`.

API: `getWorkflowConfigById(id)` with a `history: true` query flag (or a separate endpoint per the
backend contract).

---

## SCSS Additions

Append to `src/lib/styles.scss`:

```scss
.workflowConfigPanel {
    display: flex;
    gap: 16px;
    flex: 1;
}

.configListContainer {
    width: 35%;
    min-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.configDetailsContainer {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.ruleCardContainer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 0;
}

.ruleCard {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    padding: 12px;
    background: #fafafa;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
```

---

## Key Helper Reuse

| Existing helper                          | Used in new feature for                              |
|------------------------------------------|------------------------------------------------------|
| `formatIso()` — `src/lib/helpers.tsx`    | HistoryTab date formatting, ConfigList modified date |
| `extractCallable()` — `src/lib/helpers.tsx` | Reading callable from existing asset payloads for cross-reference |
| `speedOverridesExist()` — `src/lib/helpers.tsx` | Evaluating existing assets against config rules |
| `hasValue()` — `src/lib/helpers.tsx`     | Uniqueness validation in GeneralTab                  |
| `serviceRequest()` — `src/lib/serviceUtils.ts` | All new API calls in WorkflowConfig services   |
| `TRAPDatePicker` — `src/lib/helpers.tsx` | CALL_DATE override in DefaultOverridesTab            |
| `AssetInfoSelectCollateralType` — `src/features/AssetInfo/` | COLLATERAL_TYPE in DefaultOverridesTab |
| `STATUSES_ENUM` — `src/lib/constants.ts` | Mapping workflow states to rule outcomes             |

---

## What NOT to Build

- No backend or API mocking — assume endpoints exist.
- No SignalR integration for configs — poll or reload on save only.
- No drag-to-reorder — use up/down buttons.
- No Monaco editor — a `<textarea>` is sufficient for JSON mode.
- No new icon library — use `@ant-design/icons` already imported in App.tsx.
- No Tailwind — use Ant Design props + the existing SCSS file.
