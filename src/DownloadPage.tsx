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
import DownloadingIcon from "@mui/icons-material/Downloading";
import { saveSongDb } from "./localdb";
import type { SongDbList, SongDbListItem } from "./types";
import { getErrorMessage } from "./utils";

export default function DownloadPage() {
  const [loadingDatabases, setLoadingDatabases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery<SongDbList>({
    queryKey: ["databases"],
    queryFn: () =>
      fetch(
        "https://raw.githubusercontent.com/songiapp/songidb/main/index.json"
      ).then((res) => res.json()),
  });

  async function downloadDatabase(db: SongDbListItem) {
    setLoadingDatabases((a) => [...a, db.url]);
    try {
      const dbData = await fetch(db.url).then((res) => res.json());
      await saveSongDb(db, dbData);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoadingDatabases((a) => a.filter((x) => x != db.url));
  }

  return (
    <PageLayout title="Databases">
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        query.data.databases.map((db) => (
          <List>
            <ListItem
              secondaryAction={
                loadingDatabases.includes(db.url) ? (
                  <DownloadingIcon />
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
                <CloudIcon />
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
      ;
    </PageLayout>
  );
}
