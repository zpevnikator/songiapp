import React from "react";
import { useEffect, useState } from "react";
import PageLayout from "./PageLayout";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Checkbox,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  deleteSongDb,
  findDatabases,
  saveSongDb,
  setLocalDbActive,
  upgradeAllDatabases,
} from "./localdb";
import type { LocalDatabase, SongDbList, SongDbListItem } from "./types";
import { getErrorMessage } from "./utils";
import _ from "lodash";
import { useNavigate } from "react-router-dom";

function DatabaseItem(props: {
  db: SongDbListItem;
  localDatabases: LocalDatabase[];
  deleteDatabase: (x: SongDbListItem) => void;
  downloadDatabase: (x: SongDbListItem) => void;
  loadingDatabases: string[];
  setActiveDb: (dbid: string, value: boolean) => void;
}) {
  const {
    db,
    deleteDatabase,
    downloadDatabase,
    loadingDatabases,
    localDatabases,
    setActiveDb,
  } = props;

  const localDb = localDatabases.find((x) => x.id == db.id);
  const navigate = useNavigate();

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );

  return (
    <ListItem
      key={db.id}
      secondaryAction={
        loadingDatabases.length > 0 ? (
          loadingDatabases.includes(db.id) ? (
            <CircularProgress />
          ) : null
        ) : localDb ? (
          <IconButton
            size="large"
            aria-label="display more actions"
            edge="end"
            color="inherit"
            onClick={(e) => setMenuAnchorEl(e?.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
        ) : (
          // <IconButton
          //   edge="end"
          //   aria-label="download"
          //   onClick={() => deleteDatabase(db)}
          // >
          //   <DeleteIcon />
          // </IconButton>
          <IconButton
            edge="end"
            aria-label="download"
            onClick={() => downloadDatabase(db)}
          >
            <DownloadIcon />
          </IconButton>
        )
      }
    >
      <ListItemIcon>
        {localDb ? (
          <Checkbox
            edge="start"
            checked={!!localDb.isActive}
            tabIndex={-1}
            disableRipple
            onChange={(e) => setActiveDb(db.id, e.target.checked)}
          />
        ) : (
          <CloudIcon />
        )}
      </ListItemIcon>
      <ListItemText
        primary={db.title}
        secondary={
          localDb
            ? `${localDb.description} (${localDb.songCount} songs, ${localDb.artistCount} artists)`
            : `${db.description} (${db.size} songs)`
        }
      />

      <Menu
        id="basic-menu"
        anchorEl={menuAnchorEl}
        open={!!menuAnchorEl}
        onClose={() => setMenuAnchorEl(null)}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            if (window.confirm(`Really delete database ${db.title}?`)) {
              deleteDatabase(db);
            }
            setMenuAnchorEl(null);
          }}
        >
          Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            navigate(`/databases/${encodeURIComponent(db.id)}`);
          }}
        >
          Show artists
        </MenuItem>
      </Menu>
    </ListItem>
  );
}

export default function DownloadPage() {
  const [loadingDatabases, setLoadingDatabases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localDbToken, setLocalDbToken] = useState(0);
  const [isWorking, setIsWorking] = useState(false);

  const remoteDbQuery = useQuery<SongDbList>({
    queryKey: ["remoteDatabases"],
    queryFn: () =>
      fetch(
        `https://raw.githubusercontent.com/songiapp/songidb/main/index.json?x=${new Date().getTime()}`
      ).then((res) => res.json()),
  });

  const localDbQuery = useQuery<LocalDatabase[]>({
    queryKey: ["localDatabases", localDbToken],
    queryFn: findDatabases,
    networkMode: "always",
  });

  async function downloadDatabase(db: SongDbListItem) {
    setLoadingDatabases((a) => [...a, db.id]);
    try {
      const dbData = await fetch(db.url).then((res) => res.json());
      await saveSongDb(db, dbData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoadingDatabases((a) => a.filter((x) => x != db.id));
    setLocalDbToken((x) => x + 1);
  }

  async function deleteDatabase(db: SongDbListItem) {
    setLoadingDatabases((a) => [...a, db.id]);
    await deleteSongDb(db);
    setLoadingDatabases((a) => a.filter((x) => x != db.id));
    setLocalDbToken((x) => x + 1);
  }

  async function upgradeAll() {
    setIsWorking(true);
    await upgradeAllDatabases();
    setLocalDbToken((x) => x + 1);
    setIsWorking(false);
  }

  return (
    <PageLayout
      title="Databases"
      menuItems={
        isWorking
          ? []
          : [
              {
                text: "Upgrade all",
                onClick: upgradeAll,
              },
            ]
      }
    >
      {isWorking || localDbQuery.isPending ? (
        <CircularProgress />
      ) : remoteDbQuery.error ? (
        <Alert severity="error">{remoteDbQuery.error.message}</Alert>
      ) : localDbQuery.error ? (
        <Alert severity="error">{localDbQuery.error.message}</Alert>
      ) : (
        <List>
          {_.uniqBy(
            [
              ...localDbQuery.data,
              ...(remoteDbQuery.data ? remoteDbQuery.data.databases : []),
            ],
            (x) => x.id
          ).map((db) => (
            <DatabaseItem
              key={db.id}
              db={db}
              localDatabases={localDbQuery.data}
              deleteDatabase={deleteDatabase}
              downloadDatabase={downloadDatabase}
              loadingDatabases={loadingDatabases}
              setActiveDb={async (dbid, value) => {
                try {
                  setIsWorking(true);
                  await setLocalDbActive(db.id, value);
                } finally {
                  setIsWorking(false);
                  setLocalDbToken((x) => x + 1);
                }
              }}
            />
          ))}
        </List>
      )}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
