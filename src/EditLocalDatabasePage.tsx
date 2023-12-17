import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fab,
  Paper,
  TextField,
} from "@mui/material";
import PageLayout from "./PageLayout";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { useQuery } from "@tanstack/react-query";
import {
  LocalFileDatabase,
  LocalFileDatabaseContent,
  LocalSong,
} from "./types";
import {
  addNewSongsToLocalDb,
  deleteSongDb,
  getDatabase,
  getLocalFileDatabase,
  getLocalFileDatabaseContent,
  getSongs,
  saveLocalSongsDb,
  saveSongDb,
  updateSongsInLocalDb,
} from "./localdb";
import SaveIcon from "@mui/icons-material/Save";
import { parseSongDatabase } from "./songpro";

export default function EditLocalDatabasePage(props: {
  mode: "editsongs" | "addsongs" | "editdb";
}) {
  const { mode } = props;
  const { dbid, songids } = useParams();
  const intl = useIntl();

  const songIdList = useMemo(() => (songids ?? "").split(","), [songids]);

  const dbQuery = useQuery<LocalFileDatabase | undefined>({
    queryKey: ["localfiledb", dbid],
    queryFn: () => getLocalFileDatabase(parseInt(dbid!)),
    networkMode: "always",
    gcTime: 0,
  });
  const dbContentQuery = useQuery<LocalFileDatabaseContent | undefined>({
    queryKey: ["localfiledbcontent", dbid],
    queryFn: () =>
      mode == "editdb"
        ? getLocalFileDatabaseContent(parseInt(dbid!))
        : Promise.resolve(undefined),
    networkMode: "always",
    gcTime: 0,
  });
  const songsQuery = useQuery<LocalSong[]>({
    queryKey: ["localsongs", dbid, songids],
    queryFn: () => getSongs(songIdList),
    networkMode: "always",
    gcTime: 0,
  });
  const [data, setData] = useState("");
  const [savedInfo, setSavedInfo] = useState("");
  const navigate = useNavigate();

  // TODO
  //   const handlePaste = (e) => {
  //   var types, pastedData, savedContent;

  //   // Browsers that support the 'text/html' type in the Clipboard API (Chrome, Firefox 22+)
  //   if (
  //     e &&
  //     e.clipboardData &&
  //     e.clipboardData.types &&
  //     e.clipboardData.getData
  //   ) {
  //     // Check for 'text/html' in types list. See abligh's answer below for deatils on
  //     // why the DOMStringList bit is needed. We cannot fall back to 'text/plain' as
  //     // Safari/Edge don't advertise HTML data even if it is available
  //     types = e.clipboardData.types;
  //     if (
  //       (types instanceof DOMStringList && types.contains("text/html")) ||
  //       (types.indexOf && types.indexOf("text/html") !== -1)
  //     ) {
  //       // Extract data and pass it to callback
  //       pastedData = e.clipboardData.getData("text/html");

  //       // TODO - process HTML

  //       // Stop the data from actually being pasted
  //       e.stopPropagation();
  //       e.preventDefault();
  //       return false;
  //     }
  //   }
  // };

  useEffect(() => {
    console.log("songsQuery", songsQuery.data);
    if (
      !dbQuery.isPending &&
      !songsQuery.isPending &&
      !dbContentQuery.isPending
    ) {
      switch (mode) {
        case "addsongs":
          setData(
            "@title=song1\n@artist=Some artist\n\n#1.\nText[Ami] to be [Fmaj]continued"
          );
          break;
        case "editdb":
          setData(dbContentQuery.data?.data ?? "");
          break;
        case "editsongs":
          setData(songsQuery.data?.map((x) => x.source).join("\n---\n") ?? "");
          break;
      }
    }
  }, [dbQuery.isPending, songsQuery.isPending, dbContentQuery.isPending]);

  async function handleSave() {
    const parsed = parseSongDatabase(data);
    switch (mode) {
      case "editdb":
        await saveLocalSongsDb(parseInt(dbid!), data);
        break;
      case "editsongs":
        await updateSongsInLocalDb(parseInt(dbid!), songIdList, data);
        break;
      case "addsongs":
        await addNewSongsToLocalDb(parseInt(dbid!), data);
        break;
    }
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
    const activated = await getDatabase(dbid!);
    if (activated) {
      navigate(`/local/songs/${dbid}`);
    }
  }

  return (
    <PageLayout
      title={
        dbQuery?.data?.title ??
        intl.formatMessage({ id: "loading", defaultMessage: "Loading" })
      }
      headerButtons={
        dbQuery.data && (
          <Button color="inherit" onClick={handleSave}>
            <FormattedMessage id="save" defaultMessage="Save" />
          </Button>
        )
      }
    >
      {dbQuery.isPending ? (
        <CircularProgress />
      ) : dbQuery.error ? (
        <Alert severity="error">{dbQuery.error.message}</Alert>
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
            // onPaste={handlePaste}
          />
        </Box>
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
