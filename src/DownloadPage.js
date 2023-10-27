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

export default function DownloadPage() {
  const [loadingDatabases, setLoadingDatabases] = useState([]);
  const [error, setError] = useState(null);

  const query = useQuery({
    queryKey: ["databases"],
    queryFn: () =>
      fetch(
        "https://raw.githubusercontent.com/songiapp/songidb/main/index.json"
      ).then((res) => res.json()),
  });

  async function downloadDatabase(db) {
    setLoadingDatabases((a) => [...a, db.url]);
    try {
      const dbData = await fetch(db.url).next((res) => res.json());
      await saveSongDb(db, dbData);
    } catch (err) {
      setError(err.message);
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
                loadingDatabases.ioncludes(db.url) ? (
                  <DownloadingIcon />
                ) : (
                  <IconButton
                    edge="end"
                    aria-label="download"
                    onClick={() => downloadDatabase(db.url)}
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
