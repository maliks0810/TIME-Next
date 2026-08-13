import { Paper, Typography } from "@mui/material";
interface SummaryCardProps {
    title: string;
    value: string | number;
}

export function SummaryCard({
    title,
    value,
}: SummaryCardProps) {
    return (
        <Paper
            variant="outlined"
            sx={{
                minWidth: "180",
                p: 1,
            }}
        >
            <Typography
                variant="caption"
                color="text.secondary"
            >
                {title}
            </Typography>

            <Typography
                variant="h6"
                fontWeight={600}
            >
                {value}
            </Typography>
        </Paper>
    );
}