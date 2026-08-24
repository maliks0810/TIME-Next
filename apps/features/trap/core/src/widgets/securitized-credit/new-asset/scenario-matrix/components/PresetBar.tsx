import clsx from "clsx";
import styles from "../ScenarioMatrixWidget.module.scss";
import type { PendingPreset, PresetSource } from "../types";

type Props = {
    profileKey: string;
    source: PresetSource;
    /** Whether a Desk default already exists (drives Set vs Update wording). */
    hasDefault: boolean;
    /** Transient "Saved ✓" flash after publishing. */
    justSaved: boolean;
    pending: PendingPreset | null;
    onKeepCurrent: () => void;
    onLoadPending: () => void;
    onPublishDefault: () => void;
};

function chipLabel(profileKey: string, source: PresetSource): string {
    switch (source.kind) {
        case "default":
            return `${profileKey} · Desk default${source.by ? ` · ${source.by}` : ""}`;
        case "lastrun":
            return `${profileKey} · Last run${source.when ? ` ${source.when}` : ""}${
                source.by ? ` · ${source.by}` : ""
            }`;
        default:
            return `${profileKey} · Template`;
    }
}

export default function PresetBar(props: Props) {
    const {
        profileKey, source, hasDefault, justSaved, pending,
        onKeepCurrent, onLoadPending, onPublishDefault,
    } = props;

    // Pending: a newer Desk default arrived while this bond is touched.
    if (pending) {
        const msg =
            pending.kind === "default"
                ? `${profileKey} default was updated by ${pending.by} · ${pending.when}`
                : `${profileKey} was last run with different assumptions by ${pending.by} · ${pending.when}`;
        return (
            <div className={clsx(styles.presetBar, styles.pending)}>
                <span className={styles.psAlert}>↓</span>
                <span className={styles.psMsg}>{msg}</span>
                <div className={styles.psBtns}>
                    <button type="button" className={styles.psBtn} onClick={onKeepCurrent}>
                        Keep current
                    </button>
                    <button
                        type="button"
                        className={clsx(styles.psBtn, styles.cta)}
                        onClick={onLoadPending}
                    >
                        Load into this bond
                    </button>
                </div>
            </div>
        );
    }

    const saveLabel = justSaved
        ? `✓ Saved as ${profileKey} default`
        : hasDefault
          ? `Update ${profileKey} default`
          : `Set as ${profileKey} default`;

    return (
        <div className={styles.presetBar}>
            <span className={styles.psLbl}>Model Assumptions</span>
            <span
                className={clsx(styles.psChip, { [styles.def]: source.kind === "default" })}
            >
                {chipLabel(profileKey, source)}
            </span>
            <div className={styles.psBtns}>
                <button
                    type="button"
                    className={clsx(styles.psBtn, {
                        [styles.cta]: !hasDefault && !justSaved,
                        [styles.ok]: justSaved,
                    })}
                    onClick={onPublishDefault}
                    disabled={justSaved}
                >
                    {saveLabel}
                </button>
            </div>
        </div>
    );
}