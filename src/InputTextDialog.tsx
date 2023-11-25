import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

export default function InputTextDialog({
  onClose,
  defaultValue = "",
  title = null,
  text,
  label = "",
}) {
  const [value, setValue] = useState(defaultValue);
  const intl = useIntl();
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        {title ??
          intl.formatMessage({ id: "question", defaultMessage: "Question" })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
        <TextField
          value={value}
          autoFocus
          margin="dense"
          label={label}
          fullWidth
          variant="standard"
          onChange={(e) => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage id="cancel" defaultMessage="Cancel" />
        </Button>
        <Button onClick={() => onClose(value)}>
          <FormattedMessage id="ok" defaultMessage="OK" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
