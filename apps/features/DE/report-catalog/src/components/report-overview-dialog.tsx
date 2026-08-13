import {
    Dialog,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    Button,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Report } from "../types/report.types"

interface ReportOverviewDialogProps {
    reportInfo: Report | null;
    onClose: () => void;
    onOpenReport: () => void;
}

export function ReportOverviewDialog({
    reportInfo,
    onClose,
    onOpenReport
}: ReportOverviewDialogProps) {
    const open = !!reportInfo
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 1,
                    height: "80vh",
                    maxHeight: "80vh",
                }
            }}
        >
            {/* Header */}

            {/* ✅ HEADER */}
            <Box
                sx={{
                    bgcolor: '#0d4275',
                    color: '#fff',
                    px: 3,
                    py: 2,
                    position: 'relative'
                }}
            >
                <Typography fontWeight={700} fontSize={20}>
                    {reportInfo?.reportname}
                </Typography>

                <Typography fontSize={14} sx={{ opacity: 0.8 }}>
                    {reportInfo?.departmentname}
                </Typography>

                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        color: '#fff'
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>


            {/* Content */}
            <DialogContent dividers sx={{ py: 3 }}>
                <Stack spacing={2.5}>
                    <InfoRow label="Department" value={reportInfo?.departmentname} />
                    {/* <InfoRow label="Business User" value={reportInfo.us} /> */}
                    <InfoRow
                        label="Description"
                        value={reportInfo?.description}
                    />
                    <InfoRow label="Favorite" value={reportInfo?.isuserfavourite ? "Yes" : "No"} />
                    <Box>
                        <Typography
                            color="text.secondary"
                            fontWeight={600}
                            fontSize={14}
                            gutterBottom
                        >
                            Notes
                        </Typography>

                        <Box
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                p: 2,
                                bgcolor: 'background.paper',
                                '& p': { m: 0.5 },
                            }}
                            dangerouslySetInnerHTML={{
                                __html: reportInfo?.reportnotes || '<i>No notes available</i>',
                            }}
                        />
                    </Box>
                    {/* <InfoRow
                        label="SSRS URL"
                        value="Prototype mode - replace with actual SSRS URL"
                    /> */}
                </Stack>
            </DialogContent>

            {/* Footer */}
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
                <Button
                    variant="contained"
                    onClick={onOpenReport}
                    sx={{
                        borderRadius: 999,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Open Report
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* Reusable row component */
function InfoRow({ label, value }: { label: string; value: string | undefined }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                columnGap: 2
            }}
        >
            <Typography color="text.secondary" fontWeight={600} fontSize={14}>
                {label}
            </Typography>
            <Typography fontSize={15} color="text.primary">
                {value}
            </Typography>
        </Box>
    );
}