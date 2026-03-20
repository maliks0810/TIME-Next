import React from 'react';
import { theme } from 'antd';
import WidgetCardShell from '../../../components/widget-shell/WidgetCardShell';
import WidgetLoadingState from '../../../components/widget-shell/WidgetLoadingState';
import WidgetErrorState from '../../../components/widget-shell/WidgetErrorState';
import type { WidgetComponentProps } from '../../../types/widget';

type CapitalStructureTranche = {
    name: string;
    rating: string;
    size: string;
    spread: string;
    price: string;
};

type MockCapitalStructureRow = {
    tranche: string;
    amount: number;
    spread: number;
};

type CapitalStructureData = {
    dealName: string;
    currency: string;
    tranches: CapitalStructureTranche[];
};

function isCapitalStructureTranche(value: unknown): value is CapitalStructureTranche {
    if (!value || typeof value !== 'object') return false;

    const tranche = value as Record<string, unknown>;
    return (
        typeof tranche.name === 'string' &&
        typeof tranche.rating === 'string' &&
        typeof tranche.size === 'string' &&
        typeof tranche.spread === 'string' &&
        typeof tranche.price === 'string'
    );
}

function isMockCapitalStructureRow(value: unknown): value is MockCapitalStructureRow {
    if (!value || typeof value !== 'object') return false;

    const row = value as Record<string, unknown>;
    return (
        typeof row.tranche === 'string' &&
        typeof row.amount === 'number' &&
        typeof row.spread === 'number'
    );
}

function normalizeCapitalStructureData(result: unknown): CapitalStructureData | null {
    if (!result || typeof result !== 'object') return null;

    const envelope = result as Record<string, unknown>;
    const candidate =
        envelope.result && typeof envelope.result === 'object'
            ? (envelope.result as Record<string, unknown>)
            : envelope;

    const tranches = Array.isArray(candidate.tranches)
        ? candidate.tranches.filter(isCapitalStructureTranche)
        : [];

    if (
        typeof candidate.dealName === 'string' &&
        candidate.dealName.trim().length > 0 &&
        typeof candidate.currency === 'string' &&
        candidate.currency.trim().length > 0 &&
        tranches.length > 0
    ) {
        return {
            dealName: candidate.dealName,
            currency: candidate.currency,
            tranches,
        };
    }

    const rows = Array.isArray(candidate.rows)
        ? candidate.rows.filter(isMockCapitalStructureRow)
        : [];

    if (rows.length === 0) return null;

    const assetClass =
        typeof candidate.assetClass === 'string' && candidate.assetClass.trim().length > 0
            ? candidate.assetClass
            : 'Structured Credit';

    return {
        dealName: `${assetClass} Capital Structure`,
        currency: 'USD',
        tranches: rows.map((row) => ({
            name:
                row.tranche === 'AAA' || row.tranche === 'AA' || row.tranche === 'BBB'
                    ? `Class ${row.tranche}`
                    : row.tranche,
            rating: row.tranche,
            size: `${(row.amount / 1000000).toFixed(0)}mm`,
            spread: `SOFR + ${row.spread}`,
            price: '-',
        })),
    };
}

function getRatingTone(
    rating: string,
    tokens: {
        colorPrimary: string;
        colorPrimaryBg: string;
        colorPrimaryBorder: string;
        colorText: string;
        colorTextSecondary: string;
        colorBgContainer: string;
        colorBorder: string;
    }
): { background: string; color: string; border: string } {
    switch (rating) {
        case 'AAA':
            return {
                background: tokens.colorPrimary,
                color: tokens.colorBgContainer,
                border: tokens.colorPrimary,
            };
        case 'AA':
            return {
                background: tokens.colorPrimaryBg,
                color: tokens.colorPrimary,
                border: tokens.colorPrimaryBorder,
            };
        case 'A':
            return {
                background: tokens.colorBgContainer,
                color: tokens.colorText,
                border: tokens.colorPrimaryBorder,
            };
        case 'BBB':
            return {
                background: tokens.colorBgContainer,
                color: tokens.colorTextSecondary,
                border: tokens.colorBorder,
            };
        default:
            return {
                background: tokens.colorBgContainer,
                color: tokens.colorTextSecondary,
                border: tokens.colorBorder,
            };
    }
}

export default function CapitalStructureWidget(props: WidgetComponentProps) {
    const { token } = theme.useToken();

    if (props.loading) {
        return (
            <WidgetCardShell>
                <WidgetLoadingState />
            </WidgetCardShell>
        );
    }

    if (props.error) {
        return (
            <WidgetCardShell>
                <WidgetErrorState message={props.error} />
            </WidgetCardShell>
        );
    }

    const data = normalizeCapitalStructureData(props.result);
    if (!data) {
        return (
            <WidgetCardShell>
                <div style={{ padding: 12, fontSize: 12, color: token.colorTextSecondary }}>
                    No capital structure data available.
                </div>
            </WidgetCardShell>
        );
    }
    const totalSize = data.tranches.reduce((sum, tranche) => {
        const numeric = Number.parseFloat(tranche.size.replace(/[^\d.]/g, ''));
        return sum + (Number.isFinite(numeric) ? numeric : 0);
    }, 0);

    return (
        <WidgetCardShell>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: 8,
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
                            Capital Stack
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: token.colorText }}>
                            {data.dealName}
                        </div>
                        <div
                            style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}
                        >
                            Structured Credit • {data.currency} • {data.tranches.length} tranches
                        </div>
                    </div>

                    <div
                        style={{
                            minWidth: 110,
                            textAlign: 'right',
                            padding: '8px 10px',
                            border: `1px solid ${token.colorBorderSecondary}`,
                            borderRadius: 6,
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
                                color: token.colorText,
                                lineHeight: 1.2,
                            }}
                        >
                            {totalSize.toFixed(0)}mm
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.tranches.map((tranche) => {
                        const ratingTone = getRatingTone(tranche.rating, {
                            colorPrimary: token.colorPrimary,
                            colorPrimaryBg: token.colorPrimaryBg,
                            colorPrimaryBorder: token.colorPrimaryBorder,
                            colorText: token.colorText,
                            colorTextSecondary: token.colorTextSecondary,
                            colorBgContainer: token.colorBgContainer,
                            colorBorder: token.colorBorder,
                        });
                        const trancheSize = Number.parseFloat(tranche.size.replace(/[^\d.]/g, ''));
                        const widthPercent =
                            totalSize > 0 && Number.isFinite(trancheSize)
                                ? (trancheSize / totalSize) * 100
                                : 0;

                        return (
                            <div
                                key={tranche.name}
                                style={{
                                    border: `1px solid ${token.colorBorderSecondary}`,
                                    borderRadius: 6,
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
                                                background: ratingTone.background,
                                                color: ratingTone.color,
                                                border: `1px solid ${ratingTone.border}`,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                letterSpacing: 0.3,
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
                                            color: token.colorText,
                                            textAlign: 'right',
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
        </WidgetCardShell>
    );
}
