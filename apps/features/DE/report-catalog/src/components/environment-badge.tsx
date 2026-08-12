import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VerifiedIcon from "@mui/icons-material/Verified";
import Chip from "@mui/material/Chip";

export default function EnvironmentBadge() {
    const env = import.meta.env.VITE_ENVIRONMENT;

    const isProd = env?.toUpperCase() === "PROD";

    return !isProd && (
        <Chip
            icon={
                isProd ? (
                    <VerifiedIcon fontSize="small" />
                ) : (
                    <WarningAmberIcon fontSize="small" />
                )
            }
            label={"NON-PROD"}
            color={isProd ? "error" : "warning"}
            variant="filled"
            size="small"
            sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                borderRadius: 1.5,
                "& .MuiChip-label": {
                    px: 1,
                },
            }}
        />
    );
}