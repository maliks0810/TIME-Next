import { Box, Typography } from "@mui/material";

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
}

export function FormSection({
    title,
    children,
}: FormSectionProps) {
    return (
        <Box
            component="fieldset"
            sx={{
                border: "1px solid #d0d7de",
                borderRadius: 2,
                backgroundColor: "#fafbfc",

                px: 1.5,
                py: 1.5,
                mb: 1.5,

                transition: "all .2s",

                "&:hover": {
                    borderColor: "primary.main",
                },

                "& legend": {
                    px: 0.5,
                    fontWeight: 600,
                    color: "primary.main",
                },
            }}
        >
            <Typography
                component="legend"
                variant="subtitle2"
                fontWeight={600}
            >
                {title}
            </Typography>

            {children}
        </Box>
    );
}