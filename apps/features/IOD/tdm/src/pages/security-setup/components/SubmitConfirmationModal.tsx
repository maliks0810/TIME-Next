import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface SubmitConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirm = () => {
    setIsSubmitting(true);
    onConfirm();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="submit-confirmation-modal"
      maxWidth="sm"
      fullWidth
    >
      <DialogContent className="submit-modal-content">
        <div className="submit-modal-header">
          <h3 className="submit-modal-title">Submit Security Setup Request</h3>
        </div>
        <div className="submit-modal-body">
          <HelpOutlineIcon className="help-outline-icon" />
          <p className="submit-modal-message">
            Are you sure you want to submit your security setup request?
          </p>
        </div>
      </DialogContent>
      <DialogActions className="submit-modal-actions">
        <Button
          onClick={handleConfirm}
          variant="contained"
          className="submit-button"
          disabled={isSubmitting}
        >
          Confirm Request
        </Button>
        <Button
          onClick={onClose}
          className="cancel-button"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
