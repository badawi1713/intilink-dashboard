import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { FC } from 'react';

type ConfirmationProps = {
  open: boolean;
  title: string;
  content: string;
  cancelActionHandler: () => void;
  confirmActionHandler: () => void;
  loading?: boolean;
  loadingText?: string;
  confirmActionText?: string;
  cancelActionText?: string;
  disabled?: boolean;
  type?:
    | 'primary'
    | 'inherit'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
};

const Confirmation: FC<ConfirmationProps> = ({
  open,
  title,
  content,
  cancelActionHandler,
  confirmActionHandler,
  loading,
  loadingText,
  confirmActionText,
  cancelActionText,
  disabled,
  type,
}) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="custom-dialog-title"
      classes={{
        paper: 'rounded-8',
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText color="textSecondary" className="font-500">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          disabled={loading}
          onClick={cancelActionHandler}
        >
          {cancelActionText}
        </Button>
        <Button
          variant="contained"
          disabled={loading || disabled}
          onClick={confirmActionHandler}
          color={type || 'primary'}
          autoFocus
        >
          {loading ? loadingText : confirmActionText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confirmation;
