import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import {
  addLocalSongsDb,
  convertDbFromFileToCloud,
  getLocalFileDatabase,
} from "./localdb";

export default function NewDatabaseDialog({ onClose }) {
  const [name, setName] = useState("");
  const [activate, setActivate] = useState(true);
  const intl = useIntl();
  const navigate = useNavigate();
  async function handleCreateDb() {
    const newid = await addLocalSongsDb(name);
    if (activate) {
      const db = await getLocalFileDatabase(newid);
      await convertDbFromFileToCloud(db!);
    }
    navigate(`/local/edit/${newid}`);
  }
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        <FormattedMessage id="new-database" defaultMessage="New database" />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <FormattedMessage
            id="new-db-name"
            defaultMessage="Please enter new database name"
          />
        </DialogContentText>
        <TextField
          value={name}
          autoFocus
          margin="dense"
          label={intl.formatMessage({
            id: "database-name",
            defaultMessage: "Database name",
          })}
          fullWidth
          variant="standard"
          onChange={(e) => setName(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={activate}
              onChange={(e) => setActivate(e.target.checked)}
            />
          }
          label={intl.formatMessage({
            id: "activate-database.check",
            defaultMessage: "Activate database after creating",
          })}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <FormattedMessage id="cancel" defaultMessage="Cancel" />
        </Button>
        <Button
          onClick={() => {
            handleCreateDb();
            onClose();
          }}
          disabled={!name.trim()}
        >
          <FormattedMessage id="ok" defaultMessage="OK" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
