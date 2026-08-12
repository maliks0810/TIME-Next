import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";


type TabCloseConfirmDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

const TabCloseConfirmDialog = ({ open, onClose, onConfirm }: TabCloseConfirmDialogProps) => {
    const handleCancel = () => {
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleCancel}
            aria-labelledby="confirm-close-tab-title"
            maxWidth="xs"
            fullWidth
            keepMounted
            disablePortal
            TransitionProps={{ timeout: 0 }}

        >
            <DialogTitle id="confirm-close-tab-title">
                Confirm
            </DialogTitle>

            <DialogContent>
                Are you sure you want to close this tab?
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel}>
                    No
                </Button>

                <Button
                    color="error"
                    variant="contained"
                    onClick={handleConfirm}
                    autoFocus
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TabCloseConfirmDialog;