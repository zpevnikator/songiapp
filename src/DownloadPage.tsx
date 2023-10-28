import React from "react";
import { useEffect, useState } from "react";
import PageLayout from "./PageLayout";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
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
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteSongDb, findDatabases, saveSongDb } from "./localdb";
import type { SongDbList, SongDbListItem } from "./types";
import { getErrorMessage } from "./utils";
import _ from "lodash";

export default function DownloadPage() {
  const [loadingDatabases, setLoadingDatabases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localDbToken, setLocalDbToken] = useState(0);

  const remoteDbQuery = useQuery<SongDbList>({
    queryKey: ["remoteDatabases"],
    queryFn: () =>
      fetch(
        "https://raw.githubusercontent.com/songiapp/songidb/main/index.json"
      ).then((res) => res.json()),
  });

  const localDbQuery = useQuery<SongDbListItem[]>({
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
    <PageLayout title="Download databases">
      {remoteDbQuery.isPending || localDbQuery.isPending ? (
        <CircularProgress />
      ) : remoteDbQuery.error ? (
        <Alert severity="error">{remoteDbQuery.error.message}</Alert>
      ) : localDbQuery.error ? (
        <Alert severity="error">{localDbQuery.error.message}</Alert>
      ) : (
        _.uniqBy(
          [...remoteDbQuery.data.databases, ...localDbQuery.data],
          (x) => x.id
        ).map((db) => (
          <List>
            <ListItem
              secondaryAction={
                loadingDatabases.includes(db.id) ? (
                  <CircularProgress />
                ) : // <DownloadingIcon />
                localDbQuery.data.find((x) => x.id == db.id) ? (
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
                {localDbQuery.data.find((x) => x.id == db.id) ? (
                  <FileDownloadDoneIcon />
                ) : (
                  <CloudIcon />
                )}
              </ListItemIcon>
              <ListItemText
                primary={db.title}
                secondary={`${db.description} (${db.size} songs)`}
              />
            </ListItem>
          </List>
        ))
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
