import React from "react";
import { resolveGroupHeaderToken } from "./groupHeaderTheme";

interface GroupHeaderProps {
  label: string;
  token?: string | null;
}

/**
 * GroupHeader
 *
 * Renders a full-width group header cell for AntD Table column groups.
 * This MUST stretch across the entire header cell (colSpan) to look correct.
 */
export const GroupHeader: React.FC<GroupHeaderProps> = ({
  label,
  token,
}) => {
  const style = resolveGroupHeaderToken(token);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        fontWeight: 600,
        fontSize: 12,
        lineHeight: 1.2,

        color: style.textColor,
        backgroundColor: style.backgroundColor,

        borderBottom: `1px solid ${style.borderColor}`,

        padding: "4px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};

export default GroupHeader;