/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    Button,
    Card,
    Col,
    Row,
    Space,
    Typography,
    message,
    Select,
    Checkbox,
    Alert,
    Tag,
    Divider,
    theme,
} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    getTemplateVersion,
    updateDraftVersion,
    listWidgetDefinitions,
    widgetPreview,
} from '../../api/trap';
import { createContextBus } from '../../state/contextBus';

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

type JSONSchema = {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
};

function findInstance(tv: any, instanceId: string): any | null {
    const w = tv?.widgets;
    if (Array.isArray(w))
        return w.find((x: any) => String(x?.id ?? x?.instanceId ?? '') === instanceId) ?? null;
    if (w && typeof w === 'object') return w[instanceId] ?? null;
    return null;
}

function resolveWidgetDefinitionId(inst: any): string {
    return String(
        inst?.composedWidgetId ?? inst?.widgetDefinitionId ?? inst?.composed_widget_id ?? ''
    );
}

function ensureConfigShape(config: any): any {
    const c = config && typeof config === 'object' ? { ...config } : {};
    c.params = c.params && typeof c.params === 'object' ? { ...c.params } : {};
    return c;
}

function isEnumStringField(spec: any) {
    return spec?.type === 'string' && Array.isArray(spec?.enum) && spec.enum.length > 0;
}
function isEnumNumberField(spec: any) {
    return (
        (spec?.type === 'number' || spec?.type === 'integer') &&
        Array.isArray(spec?.enum) &&
        spec.enum.length > 0
    );
}
function isBooleanField(spec: any) {
    return spec?.type === 'boolean';
}

function renderPreview(widgetId: string, previewOut: any, token: any) {
    const raw = previewOut?.result ?? previewOut?.data ?? previewOut;
    const data = raw?.result ?? raw;

    if (widgetId === 'cwd_capital_structure') {
        const liveTranches = Array.isArray(data?.tranches) ? data.tranches : [];
        const mockRows = Array.isArray(data?.rows) ? data.rows : [];

        const tranches =
            liveTranches.length > 0
                ? liveTranches.map((t: any) => ({
                      name: String(t?.name ?? '-'),
                      rating: String(t?.rating ?? '-'),
                      size: String(t?.size ?? '-'),
                      spread: String(t?.spread ?? '-'),
                      price: String(t?.price ?? '-'),
                  }))
                : mockRows.map((r: any) => ({
                      name: ['AAA', 'AA', 'A', 'BBB', 'BB'].includes(String(r?.tranche ?? ''))
                          ? `Class ${String(r?.tranche ?? '')}`
                          : String(r?.tranche ?? '-'),
                      rating: String(r?.tranche ?? '-'),
                      size:
                          typeof r?.amount === 'number'
                              ? `${(r.amount / 1000000).toFixed(0)}mm`
                              : '-',
                      spread: typeof r?.spread === 'number' ? `SOFR + ${r.spread}` : '-',
                      price: '-',
                  }));

        const totalSize = tranches.reduce((sum: number, tranche: any) => {
            const numeric = Number.parseFloat(String(tranche.size ?? '').replace(/[^\d.]/g, ''));
            return sum + (Number.isFinite(numeric) ? numeric : 0);
        }, 0);

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: 8,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 6,
                    background: `linear-gradient(180deg, ${token.colorFillAlter} 0%, ${token.colorBgContainer} 100%)`,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        paddingBottom: 10,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: 0.8,
                                textTransform: 'uppercase',
                                color: token.colorTextSecondary,
                                marginBottom: 4,
                            }}
                        >
                            Capital Stack Preview
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: token.colorText }}>
                            {String(
                                data?.dealName ??
                                    `${String(data?.assetClass ?? 'Structured Credit')} Capital Structure`
                            )}
                        </div>
                        <div
                            style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}
                        >
                            {String(data?.currency ?? 'USD')} • {tranches.length} tranches
                        </div>
                    </div>

                    <div
                        style={{
                            minWidth: 110,
                            textAlign: 'right',
                            padding: '8px 10px',
                            border: `1px solid ${token.colorBorderSecondary}`,
                            borderRadius: 8,
                            background: token.colorBgElevated,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 10,
                                textTransform: 'uppercase',
                                color: token.colorTextTertiary,
                                fontWeight: 700,
                            }}
                        >
                            Total Issuance
                        </div>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                lineHeight: 1.2,
                                color: token.colorText,
                            }}
                        >
                            {totalSize.toFixed(0)}mm
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tranches.map((tranche: any) => {
                        const trancheSize = Number.parseFloat(
                            String(tranche.size ?? '').replace(/[^\d.]/g, '')
                        );
                        const widthPercent =
                            totalSize > 0 && Number.isFinite(trancheSize)
                                ? (trancheSize / totalSize) * 100
                                : 0;

                        return (
                            <div
                                key={`${tranche.name}-${tranche.rating}`}
                                style={{
                                    border: `1px solid ${token.colorBorderSecondary}`,
                                    borderRadius: 8,
                                    background: token.colorBgElevated,
                                    overflow: 'hidden',
                                    boxShadow: token.boxShadowSecondary,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            '120px 72px minmax(0, 1fr) 90px 120px 72px',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 12px',
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: token.colorText,
                                            }}
                                        >
                                            {tranche.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: token.colorTextSecondary,
                                                marginTop: 2,
                                            }}
                                        >
                                            Seniority band
                                        </div>
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                minWidth: 42,
                                                textAlign: 'center',
                                                padding: '4px 8px',
                                                borderRadius: 999,
                                                border: `1px solid ${token.colorBorder}`,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                letterSpacing: 0.3,
                                                background: token.colorFillTertiary,
                                                color: token.colorText,
                                            }}
                                        >
                                            {tranche.rating}
                                        </span>
                                    </div>

                                    <div>
                                        <div
                                            style={{
                                                position: 'relative',
                                                height: 12,
                                                borderRadius: 999,
                                                background: token.colorFillSecondary,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${Math.max(widthPercent, 6)}%`,
                                                    height: '100%',
                                                    borderRadius: 999,
                                                    background: `linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            textAlign: 'right',
                                            color: token.colorText,
                                        }}
                                    >
                                        {tranche.size}
                                    </div>

                                    <div style={{ fontSize: 12, color: token.colorText }}>
                                        <div style={{ fontWeight: 600 }}>{tranche.spread}</div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: token.colorTextTertiary,
                                                marginTop: 2,
                                            }}
                                        >
                                            Coupon / spread
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: token.colorText,
                                            }}
                                        >
                                            {tranche.price}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: token.colorTextTertiary,
                                                marginTop: 2,
                                            }}
                                        >
                                            Px
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const rows = data?.rows;
    if (Array.isArray(rows) && rows.length > 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rows.slice(0, 25).map((r: any, idx: number) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            border: `1px solid ${token.colorBorderSecondary}`,
                            borderRadius: 6,
                            background: token.colorBgElevated,
                        }}
                    >
                        <span style={{ color: token.colorTextSecondary }}>
                            {String(r.field ?? r.name ?? `Row ${idx + 1}`)}
                        </span>
                        <span style={{ fontWeight: 600, color: token.colorText }}>
                            {String(r.value ?? '')}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <Alert
            type="info"
            showIcon
            message="Preview rendered"
            description="Open Debug JSON to inspect the raw response."
        />
    );
}

export default function WidgetStudioConfigurePage() {
    const { token } = theme.useToken();
    const nav = useNavigate();
    const q = useQuery();
    const bus = React.useMemo(() => createContextBus(), []);

    const templateId = q.get('templateId') ?? '';
    const versionId = q.get('versionId') ?? '';
    const instanceId = q.get('instanceId') ?? '';
    const returnTo =
        q.get('returnTo') ??
        `/trap/designer?templateId=${encodeURIComponent(templateId)}&versionId=${encodeURIComponent(versionId)}`;

    const [loading, setLoading] = React.useState(false);
    const [tv, setTv] = React.useState<any>(null);
    const [inst, setInst] = React.useState<any>(null);
    const [widgetDef, setWidgetDef] = React.useState<any>(null);

    const [params, setParams] = React.useState<Record<string, any>>({});
    const [previewOut, setPreviewOut] = React.useState<any>(null);
    const [showDebug, setShowDebug] = React.useState(false);

    const widgetId = React.useMemo(() => resolveWidgetDefinitionId(inst), [inst]);

    const schema: JSONSchema | null = React.useMemo(() => {
        const s = widgetDef?.configSchema;
        if (s && typeof s === 'object') return s as JSONSchema;
        return null;
    }, [widgetDef]);

    const propsSchema = schema?.properties ?? {};
    const schemaHasUseContextCusip = !!(
        propsSchema.useContextCusip && propsSchema.useContextCusip.type === 'boolean'
    );

    const listensToKeys: string[] = widgetDef?.listensToKeys ?? [];
    const supportsCusip = listensToKeys.includes('security.cusip');

    const defaultDatasetId = widgetDef?.preview?.defaultDatasetId ?? widgetDef?.datasetId ?? '';

    const load = React.useCallback(async () => {
        if (!templateId || !versionId || !instanceId) return;
        setLoading(true);
        try {
            const t = await getTemplateVersion(templateId, versionId);
            setTv(t);

            const wi = findInstance(t, instanceId);
            if (!wi) {
                message.error(
                    'Widget instance not found. Save Draft in Designer first, then Configure.'
                );
                setInst(null);
                return;
            }
            setInst(wi);

            const defs = await listWidgetDefinitions();
            const def = defs.find((d: any) => d.id === resolveWidgetDefinitionId(wi));
            if (!def) {
                message.error(
                    `Widget definition not found in catalog: ${resolveWidgetDefinitionId(wi)}`
                );
                setWidgetDef(null);
                return;
            }
            setWidgetDef(def);

            const config = ensureConfigShape(wi.config);
            const dp = config.params ?? {};

            const next: Record<string, any> = {};
            const schemaProps = (def.configSchema?.properties ?? {}) as Record<string, any>;
            for (const key of Object.keys(schemaProps)) {
                const spec = schemaProps[key];
                if (dp[key] !== undefined) next[key] = dp[key];
                else if (spec?.default !== undefined) next[key] = spec.default;
            }

            if (!schemaProps.useContextCusip && supportsCusip) {
                next.__useContextCusip = dp.__useContextCusip ?? true;
            }

            setParams(next);
        } catch (e: any) {
            message.error(e?.message ?? 'Failed to load configuration');
        } finally {
            setLoading(false);
        }
    }, [templateId, versionId, instanceId]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const setField = (k: string, v: any) => setParams((prev) => ({ ...prev, [k]: v }));

    const validateStrictNoFreeform = (): string | null => {
        if (!schema) return 'Widget definition missing bindingSchema';
        const schemaProps = schema.properties ?? {};
        for (const key of Object.keys(schemaProps)) {
            const spec = schemaProps[key];
            if (spec?.type === 'string' && !(Array.isArray(spec?.enum) && spec.enum.length > 0)) {
                return `Freeform not allowed: "${key}" is string without enum`;
            }
            if (
                (spec?.type === 'number' || spec?.type === 'integer') &&
                !(Array.isArray(spec?.enum) && spec.enum.length > 0)
            ) {
                return `Freeform not allowed: "${key}" is number without enum`;
            }
            if (spec?.type && !['string', 'number', 'integer', 'boolean'].includes(spec.type)) {
                return `Unsupported type for "${key}": ${spec.type}`;
            }
        }
        return null;
    };

    const wantsContext = (): boolean => {
        if (!supportsCusip) return false;
        if (schemaHasUseContextCusip) return !!params.useContextCusip;
        return !!params.__useContextCusip;
    };

    const preview = async () => {
        if (!inst || !widgetDef) return;
        const err = validateStrictNoFreeform();
        if (err) {
            message.error(err);
            return;
        }

        if (!defaultDatasetId) {
            message.error('Widget catalog missing datasetId for preview.');
            return;
        }

        setLoading(true);
        try {
            const ctx = wantsContext()
                ? { 'security.cusip': bus.snapshot?.['security.cusip'] }
                : undefined;

            const out = await widgetPreview({
                widgetDefinitionId: widgetDef.id,
                variantId: inst.variantId,
                mode: 'MOCK',
                params: {
                    ...params,
                    __context: ctx,
                },
            });

            setPreviewOut(out);
            message.success('Preview OK');
        } catch (e: any) {
            message.error(e?.message ?? 'Preview failed');
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        if (!tv || !inst || !widgetDef) return;
        const err = validateStrictNoFreeform();
        if (err) {
            message.error(err);
            return;
        }

        setLoading(true);
        try {
            const nextWidgets = (tv.widgets ?? []).map((w: any) => {
                if (String(w.id) !== instanceId) return w;

                const config = ensureConfigShape(w.config);
                const nextParams: Record<string, any> = { ...(config.params ?? {}) };

                const schemaProps = (widgetDef.configSchema?.properties ?? {}) as Record<
                    string,
                    any
                >;
                for (const key of Object.keys(schemaProps)) {
                    nextParams[key] = params[key];
                }

                if (!schemaProps.useContextCusip && supportsCusip) {
                    nextParams.__useContextCusip = !!params.__useContextCusip;
                }

                config.params = nextParams;
                return { ...w, config };
            });

            const payload = {
                theme: tv.theme ?? {},
                defaultContext: tv.defaultContext ?? {},
                layoutVariants: tv.layoutVariants ?? [],
                widgets: nextWidgets,
            };

            await updateDraftVersion(templateId, versionId, payload);

            message.success('Saved configuration');
            nav(returnTo);
        } catch (e: any) {
            message.error(e?.message ?? 'Save failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card>
                <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
                    <Space wrap>
                        <Tag color={widgetId ? 'blue' : 'red'}>widget={widgetId || 'UNKNOWN'}</Tag>
                        <Tag>variant={inst?.variantId ?? 'n/a'}</Tag>
                        <Tag color={defaultDatasetId ? 'purple' : 'red'}>
                            dataset={defaultDatasetId || 'MISSING'}
                        </Tag>
                    </Space>
                    <Checkbox checked={showDebug} onChange={(e) => setShowDebug(e.target.checked)}>
                        Debug JSON
                    </Checkbox>
                </Space>
            </Card>

            {!inst && (
                <Alert
                    type="warning"
                    showIcon
                    message="Widget instance not found"
                    description="Save Draft in Designer first, then Configure."
                />
            )}

            {inst && widgetId && !schema && (
                <Alert
                    type="error"
                    showIcon
                    message="Missing configSchema"
                    description="WidgetDefinition.configSchema is required for schema-driven configuration."
                />
            )}

            {schema && validateStrictNoFreeform() && (
                <Alert
                    type="error"
                    showIcon
                    message="Schema invalid for strict mode"
                    description={validateStrictNoFreeform() as string}
                />
            )}

            <Row gutter={[12, 12]}>
                <Col xs={24} lg={10}>
                    <Card title="Configuration" size="small">
                        <Space direction="vertical" style={{ width: '100%' }} size={14}>
                            {supportsCusip && !schemaHasUseContextCusip && (
                                <Checkbox
                                    checked={!!params.__useContextCusip}
                                    onChange={(e) =>
                                        setField('__useContextCusip', e.target.checked)
                                    }
                                >
                                    Use ContextBus security.cusip
                                </Checkbox>
                            )}

                            {schema?.properties &&
                                Object.keys(schema.properties).map((key) => {
                                    const spec = schema.properties?.[key];
                                    const val = params[key];

                                    if (isBooleanField(spec)) {
                                        return (
                                            <Checkbox
                                                key={key}
                                                checked={!!val}
                                                onChange={(e) => setField(key, e.target.checked)}
                                            >
                                                {spec.title ?? key}
                                            </Checkbox>
                                        );
                                    }

                                    if (isEnumStringField(spec)) {
                                        return (
                                            <div key={key} style={{ width: '100%' }}>
                                                <Typography.Text strong>
                                                    {spec.title ?? key}
                                                </Typography.Text>
                                                <Select
                                                    value={val ?? spec.default}
                                                    onChange={(v) => setField(key, v)}
                                                    style={{ width: '100%', marginTop: 6 }}
                                                    options={spec.enum.map((x: string) => ({
                                                        value: x,
                                                        label: x,
                                                    }))}
                                                />
                                            </div>
                                        );
                                    }

                                    if (isEnumNumberField(spec)) {
                                        return (
                                            <div key={key} style={{ width: '100%' }}>
                                                <Typography.Text strong>
                                                    {spec.title ?? key}
                                                </Typography.Text>
                                                <Select
                                                    value={val ?? spec.default}
                                                    onChange={(v) => setField(key, v)}
                                                    style={{ width: '100%', marginTop: 6 }}
                                                    options={spec.enum.map((x: number) => ({
                                                        value: x,
                                                        label: String(x),
                                                    }))}
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <Alert
                                            key={key}
                                            type="error"
                                            showIcon
                                            message={`Unsupported field "${key}"`}
                                            description="Strict mode allows only boolean or enum-based string/number fields."
                                        />
                                    );
                                })}

                            <Space wrap>
                                <Button onClick={() => nav(returnTo)}>Back</Button>
                                <Button
                                    onClick={preview}
                                    loading={loading}
                                    disabled={!inst || !schema}
                                >
                                    Preview
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={save}
                                    loading={loading}
                                    disabled={!inst || !schema}
                                >
                                    Save
                                </Button>
                            </Space>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card title="Preview" size="small">
                        {!previewOut ? (
                            <Alert type="info" showIcon message="Run Preview to see results." />
                        ) : (
                            <>
                                {renderPreview(widgetId, previewOut, token)}
                                {showDebug && (
                                    <>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <Typography.Text type="secondary">
                                            Debug JSON
                                        </Typography.Text>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(previewOut ?? {}, null, 2)}
                                        </pre>
                                    </>
                                )}
                            </>
                        )}
                    </Card>
                </Col>
            </Row>
        </Space>
    );
}
