import React, { useRef } from "react";
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
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckIcon from "@mui/icons-material/Check";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  deleteAllDatabases,
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
import { useIntl } from "react-intl";
import { parseSongDatabase } from "./songpro";

function DatabaseItem(props: {
  db: SongDbListItem;
  localDatabases: LocalDatabase[];
  deleteDatabase: (x: SongDbListItem) => void;
  downloadDatabase: (x: SongDbListItem) => void;
  cancelWaiting: (x: SongDbListItem) => void;
  isProcessed: boolean;
  isWaiting: boolean;
  isFinished: boolean;
  setActiveDb: (dbid: string, value: boolean) => void;
}) {
  const {
    db,
    deleteDatabase,
    downloadDatabase,
    isProcessed,
    isWaiting,
    isFinished,
    localDatabases,
    setActiveDb,
    cancelWaiting,
  } = props;
  const intl = useIntl();

  const localDb = localDatabases.find((x) => x.id == db.id);
  const navigate = useNavigate();

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );

  return (
    <ListItem
      key={db.id}
      secondaryAction={
        isProcessed ? (
          <CircularProgress />
        ) : isFinished ? (
          <CheckIcon />
        ) : isWaiting ? (
          <IconButton
            size="large"
            aria-label="cancel"
            edge="end"
            color="inherit"
            onClick={() => cancelWaiting(db)}
          >
            <HourglassEmptyIcon />
          </IconButton>
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
            ? `${localDb.description} (${
                localDb.songCount
              } ${intl.formatMessage({
                id: "songs.lower",
                defaultMessage: "songs",
              })}, ${localDb.artistCount} ${intl.formatMessage({
                id: "artists.lower",
                defaultMessage: "artists",
              })})`
            : `${db.description} (${db.size} ${intl.formatMessage({
                id: "songs.lower",
                defaultMessage: "songs",
              })})`
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
            if (
              window.confirm(
                intl.formatMessage(
                  {
                    id: "really-delete-database.question",
                    defaultMessage: "Really delete database {db}?",
                  },
                  { db: db.title }
                )
              )
            ) {
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
  // const [loadingDatabases, setLoadingDatabases] = useState<string[]>([]);
  const [processedDatabase, setProcessedDatabase] = useState<string | null>(
    null
  );
  const [operationQueue, setOperationQueue] = useState<
    { op: string; db: SongDbListItem }[]
  >([]);
  const [finishedDatabases, setFinishedDatabases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localDbToken, setLocalDbToken] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const intl = useIntl();
  const queueRef = useRef(operationQueue);
  const processedRef = useRef(processedDatabase);
  queueRef.current = operationQueue;
  processedRef.current = processedDatabase;

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

  async function processQueue() {
    if (processedRef.current) {
      return;
    }

    const queueItem = queueRef.current[0];

    if (!queueItem) {
      setFinishedDatabases([]);
      setLocalDbToken((x) => x + 1);
      return;
    }

    setOperationQueue((x) => x.filter((y, i) => i > 0));
    const { db, op } = queueItem;
    setProcessedDatabase(db.id);
    switch (op) {
      case "download":
        try {
          const dbText = await fetch(db.url).then((res) => res.text());
          const dbData = parseSongDatabase(dbText);
          await saveSongDb(db, dbData);
        } catch (err) {
          console.error(err);
          setError(getErrorMessage(err));
        }
        break;
      case "delete":
        try {
          await deleteSongDb(db);
        } catch (err) {
          setError(getErrorMessage(err));
        }
        break;
    }
    setProcessedDatabase(null);
    setFinishedDatabases((x) => [...x, db.id]);

    setTimeout(processQueue, 10);
  }

  async function downloadDatabase(db: SongDbListItem) {
    setOperationQueue((x) => [...x, { db, op: "download" }]);
    setTimeout(processQueue, 10);
  }

  async function deleteDatabase(db: SongDbListItem) {
    setOperationQueue((x) => [...x, { db, op: "delete" }]);
    setTimeout(processQueue, 10);
  }

  async function cancelWaiting(db: SongDbListItem) {
    setOperationQueue((x) => x.filter((y) => y.db.id != db.id));
  }

  async function upgradeAll() {
    setIsWorking(true);
    await upgradeAllDatabases();
    setLocalDbToken((x) => x + 1);
    setIsWorking(false);
  }

  async function deleteAll() {
    setIsWorking(true);
    await deleteAllDatabases();
    setLocalDbToken((x) => x + 1);
    setIsWorking(false);
  }

  return (
    <PageLayout
      title={intl.formatMessage({
        id: "databases",
        defaultMessage: "Databases",
      })}
      menuItems={
        isWorking
          ? []
          : [
              {
                text: intl.formatMessage({
                  id: "upgrade-all",
                  defaultMessage: "Upgrade all",
                }),
                onClick: upgradeAll,
              },
              {
                text: intl.formatMessage({
                  id: "delete-all",
                  defaultMessage: "Delete all",
                }),
                onClick: deleteAll,
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
              cancelWaiting={cancelWaiting}
              isProcessed={processedDatabase == db.id}
              isFinished={finishedDatabases.includes(db.id)}
              isWaiting={!!operationQueue.find((x) => x.db.id == db.id)}
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
