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
  ListItemIcon,
  ListItemText,
  Snackbar,
} from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  deleteSongDb,
  findDatabases,
  saveSongDb,
  setLocalDbActive,
} from "./localdb";
import type { LocalDatabase, SongDbList, SongDbListItem } from "./types";
import { getErrorMessage } from "./utils";
import _ from "lodash";

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

  return (
    <ListItem
      key={db.id}
      secondaryAction={
        loadingDatabases.includes(db.id) ? (
          <CircularProgress />
        ) : localDb ? (
          <IconButton
            edge="end"
            aria-label="download"
            onClick={() => deleteDatabase(db)}
          >
            <DeleteIcon />
          </IconButton>
        ) : (
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
    </ListItem>
  );
}

export default function DownloadPage() {
  const [loadingDatabases, setLoadingDatabases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localDbToken, setLocalDbToken] = useState(0);
  const [isActivating, setIsActivating] = useState(false);

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

  return (
    <PageLayout title="Databases">
      {isActivating || remoteDbQuery.isPending || localDbQuery.isPending ? (
        <CircularProgress />
      ) : remoteDbQuery.error ? (
        <Alert severity="error">{remoteDbQuery.error.message}</Alert>
      ) : localDbQuery.error ? (
        <Alert severity="error">{localDbQuery.error.message}</Alert>
      ) : (
        <List>
          {_.uniqBy(
            [...localDbQuery.data, ...remoteDbQuery.data.databases],
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
                  setIsActivating(true);
                  await setLocalDbActive(db.id, value);
                } finally {
                  setIsActivating(false);
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
