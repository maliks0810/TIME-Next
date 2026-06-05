import { CheckCircleFilled } from "@ant-design/icons";
import clsx from "clsx";
import styles from "../AssetStagingWidget.module.scss";

export function StatusDot({ done }: { done: boolean }) {
    return (
        <div
            className={clsx(
                styles.statusDot,
                done ? styles.statusDotDone : styles.statusDotPending
            )}
        >
            {done && <CheckCircleFilled style={{ fontSize: 11, color: "#fff" }} />}
        </div>
    );
}