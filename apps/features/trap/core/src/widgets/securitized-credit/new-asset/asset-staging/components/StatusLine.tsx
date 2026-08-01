import { Popover, Button, theme, message } from "antd";
import {
    CheckCircleFilled,
    ExclamationCircleFilled,
    CloseCircleFilled,
    InfoCircleOutlined,
    CopyOutlined,
} from "@ant-design/icons";

/**
 * StatusLine
 * ----------
 * A single-line result banner: [icon] Label · summary … [ⓘ] [chips]
 *
 *  - `tone` drives the colour (success / warning / error).
 *  - `summary` is the short inline text; it truncates with an ellipsis so the
 *    line never wraps, no matter how long the underlying message is.
 *  - `detail` (optional) is the FULL message. When provided, an info affordance
 *    (ⓘ) appears and the full text is shown in a hover / focus / click popover —
 *    this is how long PRISM error strings are surfaced without breaking layout.
 *  - `chips` render right-aligned per-step outcomes (Details / OM / Launch),
 *    each with its own state incl. a neutral "na" for optional-and-skipped.
 *  - `copyable` adds a Copy button inside the popover (handy for long errors
 *    that a user wants to paste into a ticket).
 */

export type StatusTone = "success" | "warning" | "error";
export type ChipState = "ok" | "na" | "warn" | "bad";

export interface StatusChip {
    label: string;      // "Details" | "OM" | "Launch"
    state: ChipState;   // ok=✓  na=–  warn=✗(soft)  bad=✗(hard)
}

export interface StatusLineProps {
    tone: StatusTone;
    label: string;      // "Request submitted" | "Submission failed"
    summary: string;    // short inline text (truncates)
    detail?: string;    // full text -> enables the ⓘ popover
    chips?: StatusChip[];
    copyable?: boolean; // show a Copy button in the popover
    popoverTitle?: string; // optional heading inside the popover
}

const CHIP_SYMBOL: Record<ChipState, string> = {
    ok: "\u2713",   // ✓
    na: "\u2013",   // –
    warn: "\u2717", // ✗
    bad: "\u2717",  // ✗
};

export default function StatusLine({
    tone,
    label,
    summary,
    detail,
    chips,
    copyable = false,
    popoverTitle,
}: StatusLineProps) {
    const { token } = theme.useToken();

    // ── tone → banner colours + leading icon ─────────────────────────────
    const toneMap = {
        success: {
            bg: token.colorSuccessBg,
            border: token.colorSuccessBorder,
            fg: token.colorSuccess,
            Icon: CheckCircleFilled,
        },
        warning: {
            bg: token.colorWarningBg,
            border: token.colorWarningBorder,
            fg: token.colorWarning,
            Icon: ExclamationCircleFilled,
        },
        error: {
            bg: token.colorErrorBg,
            border: token.colorErrorBorder,
            fg: token.colorError,
            Icon: CloseCircleFilled,
        },
    }[tone];

    const { Icon } = toneMap;

    // ── chip state → colours ─────────────────────────────────────────────
    const chipColors = (state: ChipState) => {
        switch (state) {
            case "ok":
                return { bg: token.colorSuccessBg, fg: token.colorSuccess };
            case "na":
                return { bg: token.colorFillTertiary, fg: token.colorTextTertiary };
            case "warn":
                return { bg: token.colorWarningBg, fg: token.colorWarning };
            case "bad":
                return { bg: token.colorErrorBg, fg: token.colorError };
        }
    };

    const handleCopy = () => {
        if (!detail) return;
        navigator.clipboard
            .writeText(detail)
            .then(() => message.success("Copied to clipboard"))
            .catch(() => message.error("Copy failed"));
    };

    const popoverContent = detail ? (
        <div style={{ maxWidth: 320 }}>
            <div
                style={{
                    fontSize: 12,
                    lineHeight: "18px",
                    color: token.colorText,
                    whiteSpace: "pre-wrap",
                }}
            >
                {detail}
            </div>
            {copyable && (
                <div style={{ marginTop: 8, textAlign: "right" }}>
                    <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={handleCopy}
                    >
                        Copy
                    </Button>
                </div>
            )}
        </div>
    ) : null;

    return (
        <div
            role="status"
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: token.borderRadius,
                background: toneMap.bg,
                border: `1px solid ${toneMap.border}`,
                padding: "7px 12px",
                minHeight: 34,
            }}
        >
            <Icon style={{ fontSize: 14, color: toneMap.fg, flex: "0 0 auto" }} />

            <span
                style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: toneMap.fg,
                    whiteSpace: "nowrap",
                    flex: "0 0 auto",
                }}
            >
                {label}
            </span>

            <span style={{ color: token.colorTextQuaternary, flex: "0 0 auto" }}>
                &middot;
            </span>

            {/* summary — truncates; min-width:0 lets flex ellipsis work */}
            <span
                title={summary}
                style={{
                    fontSize: 12,
                    color: toneMap.fg,
                    flex: "1 1 auto",
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {summary}
            </span>

            {/* ⓘ full-text affordance (hover / focus / click) */}
            {detail && (
                <Popover
                    content={popoverContent}
                    title={
                        popoverTitle ? (
                            <span style={{ color: toneMap.fg, fontSize: 12, fontWeight: 700 }}>
                                {popoverTitle}
                            </span>
                        ) : undefined
                    }
                    trigger={["hover", "focus", "click"]}
                    placement="topRight"
                >
                    <InfoCircleOutlined
                        tabIndex={0}
                        aria-label="Show full details"
                        style={{
                            fontSize: 13,
                            color: toneMap.fg,
                            cursor: "pointer",
                            flex: "0 0 auto",
                            outline: "none",
                        }}
                    />
                </Popover>
            )}

            {/* per-step chips */}
            {chips && chips.length > 0 && (
                <span style={{ display: "flex", gap: 6, flex: "0 0 auto" }}>
                    {chips.map((c) => {
                        const cc = chipColors(c.state);
                        return (
                            <span
                                key={c.label}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 3,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "1px 7px",
                                    borderRadius: 10,
                                    background: cc.bg,
                                    color: cc.fg,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {c.label} {CHIP_SYMBOL[c.state]}
                            </span>
                        );
                    })}
                </span>
            )}
        </div>
    );
}
