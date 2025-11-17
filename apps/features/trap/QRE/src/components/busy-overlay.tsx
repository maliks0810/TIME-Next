import { CircularProgress, Dialog, DialogContent, Stack, Typography } from '@mui/material';

export const BusyOverlay = (props: { open: boolean; title?: string | null; message?: string | null }) => {
    const { open, title, message } = props;

    return (
        <Dialog open={open} maxWidth="md" fullWidth={true}>
            <DialogContent>
                <Stack
                    direction="column"
                    spacing={5}
                    flexGrow={1}
                    alignItems="center"
                    justifyContent="center"
                >
                    {title && (
                        <Typography variant="h6" textAlign="center" color="primary">
                            {title}
                        </Typography>
                    )}
                    <Typography variant="subtitle1">{message ?? 'Please wait'}</Typography>
                    <CircularProgress enableTrackSlot size={64} />
                </Stack>
            </DialogContent>
        </Dialog>
    );
};
