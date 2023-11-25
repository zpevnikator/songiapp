import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Fab,
  Paper,
  TextField,
} from "@mui/material";
import PageLayout from "./PageLayout";
import { Link, useParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { useQuery } from "@tanstack/react-query";
import { LocalFileDatabase } from "./types";
import {
  deleteSongDb,
  getDatabase,
  getLocalFileDatabase,
  saveLocalSongsDb,
  saveSongDb,
} from "./localdb";
import SaveIcon from "@mui/icons-material/Save";
import { parseSongDatabase } from "./songpro";

export default function EditLocalDatabasePage() {
  const { dbid } = useParams();
  const intl = useIntl();

  const query = useQuery<LocalFileDatabase | undefined>({
    queryKey: ["localfiledb", dbid],
    queryFn: () => getLocalFileDatabase(parseInt(dbid!)),
    networkMode: "always",
    gcTime: 0,
  });
  const [data, setData] = useState("");
  const [savedInfo, setSavedInfo] = useState("");

  useEffect(() => {
    if (!query.isPending) {
      setData(query.data?.data ?? "");
    }
  }, [query.isPending]);

  async function handleSave() {
    const parsed = parseSongDatabase(data);
    await saveLocalSongsDb({
      ...query.data!,
      artistCount: parsed.artists.length,
      songCount: parsed.songs.length,
      data,
    });
    setSavedInfo(
      intl.formatMessage(
        {
          id: "succesfully-saved-db",
          defaultMessage:
            "Saved database, detected {songs} songs and {artists} artists",
        },
        { songs: parsed.songs.length, artists: parsed.artists.length }
      )
    );
  }

  return (
    <PageLayout title={query?.data?.title ?? "Loading..."}>
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            mt: 8,
            bottom: 0,
            mb: 7,
            left: 0,
            right: 0,
            display: "flex",
          }}
        >
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={{ flex: 1 }}
          />
        </Box>
      )}

      {query.data && (
        <Fab
          color="primary"
          style={{ position: "fixed", bottom: 40, right: 20 }}
          onClick={handleSave}
        >
          <SaveIcon sx={{ mr: 1 }} />
        </Fab>
      )}
      {savedInfo && (
        <Alert
          severity="info"
          sx={{ position: "fixed", bottom: 0, left: 0, mb: 7 }}
          onClose={() => setSavedInfo("")}
        >
          {savedInfo}
        </Alert>
      )}
    </PageLayout>
  );
}
