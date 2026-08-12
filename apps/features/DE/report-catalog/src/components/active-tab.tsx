import React from "react";
import { Box, IconButton } from "@mui/material";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import { ViewerTab } from "../types/report.types";
import { getExternalReportUrl } from "../utils/ssrs-embed";


type ActiveTabIframeViewProps = {
  tab: ViewerTab | null;
};


const handleOpenExternal = (rawUrl: string | null | undefined) => {
  const url = getExternalReportUrl(rawUrl);
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};


const ActiveTabIframeView: React.FC<ActiveTabIframeViewProps> = React.memo(
  ({ tab }: ActiveTabIframeViewProps) => {
    if (!tab) return null;

    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <IconButton
          size="small"
          title="Open in new tab"
          onClick={() => handleOpenExternal(tab.rawUrl)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 3,
            bgcolor: "rgba(255,255,255,0.92)",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <OpenInNewOutlined sx={{ fontSize: 16 }} />
        </IconButton>

        <Box
          component="iframe"
          src={tab.iframeUrl}
          title={tab.title}
          sx={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            bgcolor: "#fff",
          }}
        />
      </Box>
    );
  }
);

ActiveTabIframeView.displayName = "ActiveTabIframeView";
export default ActiveTabIframeView;