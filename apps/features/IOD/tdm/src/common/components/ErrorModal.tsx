import React from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface ErrorModalProps {
  header: string;
  body: string;
  open: boolean;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  header,
  body,
  open,
  onClose,
}) => {

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="error-modal"
      maxWidth="sm"
      fullWidth
    >
      <DialogContent className="error-modal-content">
        <div className="error-modal-header">
          <ErrorOutline className="error-modal-icon"/>
          <h3 className="error-modal-title">{header}</h3>
        </div>
        <div className="error-modal-body">
          <p className="error-modal-message" style={{whiteSpace: "pre-line"}}>
            {body}
          </p>
        </div>
      </DialogContent>
      <DialogActions className="error-modal-actions">
        <Button
          onClick={onClose}
          className="close-button"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
