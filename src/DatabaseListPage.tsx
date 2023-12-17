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
  ListSubheader,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import DownloadIcon from "@mui/icons-material/Download";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckIcon from "@mui/icons-material/Check";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StorageIcon from "@mui/icons-material/Storage";
import {
  addLocalSongsDb,
  convertDbFromFileToCloud,
  deleteAllDatabases,
  deleteFileDb,
  deleteSongDb,
  findDatabases,
  findFileDatabases,
  saveLocalSongsDb,
  saveSongDb,
  setLocalDbActive,
  upgradeAllDatabases,
} from "./localdb";
import type {
  LocalDatabase,
  LocalFileDatabase,
  SongDbList,
  SongDbListItem,
} from "./types";
import { getErrorMessage } from "./utils";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { parseSongDatabase } from "./songpro";
import InputTextDialog from "./InputTextDialog";
import NewDatabaseDialog from "./NewDatabaseDialog";
import FreeSpaceProgressBar from "./FreeSpaceProgressBar";

function DatabaseItem(props: {
  db: SongDbListItem;
  deleteDatabase: (x: SongDbListItem) => void;
  downloadDatabase: (x: SongDbListItem) => void;
  cancelWaiting: (x: SongDbListItem) => void;
  deleteFileDatabase: (id: number) => void;
  activateFileDatabase: (db: LocalFileDatabase) => void;
  deactivateFileDatabase: (db: LocalFileDatabase) => void;
  isProcessed: boolean;
  isWaiting: boolean;
  isFinished: boolean;
  localFileDb?: LocalFileDatabase;
  localDb: LocalDatabase | undefined;
  setActiveDb: (dbid: string, value: boolean) => void;
}) {
  const {
    db,
    deleteDatabase,
    downloadDatabase,
    deleteFileDatabase,
    activateFileDatabase,
    deactivateFileDatabase,
    isProcessed,
    isWaiting,
    isFinished,
    setActiveDb,
    cancelWaiting,
    localDb,
    localFileDb,
  } = props;
  const intl = useIntl();

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
        ) : localDb || localFileDb ? (
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
        ) : localFileDb ? (
          <StorageIcon />
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
            : localFileDb
            ? `(${localFileDb.songCount} ${intl.formatMessage({
                id: "songs.lower",
                defaultMessage: "songs",
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
        {((!localFileDb && localDb) || (localFileDb && !localDb)) && (
          <MenuItem
            onClick={async () => {
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
                if (localFileDb) {
                  await deleteFileDatabase(localFileDb.id!);
                }
                if (localDb) deleteDatabase(db);
              }
              setMenuAnchorEl(null);
            }}
          >
            <FormattedMessage id="delete" defaultMessage="Delete" />
          </MenuItem>
        )}
        {localDb && (
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              navigate(`/databases/${encodeURIComponent(db.id)}`);
            }}
          >
            <FormattedMessage id="show-artists" defaultMessage="Show artists" />
          </MenuItem>
        )}
        {localFileDb && (
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              navigate(`/local/edit/${db.id}`);
            }}
          >
            <FormattedMessage id="edit-data" defaultMessage="Edit data" />
          </MenuItem>
        )}
        {localFileDb && (
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              navigate(`/local/songs/${db.id}`);
            }}
          >
            <FormattedMessage id="edit-songs" defaultMessage="Edit songs" />
          </MenuItem>
        )}
        {localFileDb && !localDb && (
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              activateFileDatabase(localFileDb);
            }}
          >
            <FormattedMessage
              id="activate-database"
              defaultMessage="Activate database"
            />
          </MenuItem>
        )}
        {localFileDb && localDb && (
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              deactivateFileDatabase(localFileDb);
            }}
          >
            <FormattedMessage
              id="deactivate-database"
              defaultMessage="Deactivate database"
            />
          </MenuItem>
        )}
        {db.url != null && (
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              window.open(db.url, "_blank");
            }}
          >
            <FormattedMessage
              id="open-database-source"
              defaultMessage="Open database source"
            />
          </MenuItem>
        )}
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
  const [newDbOpen, setNewDbOpen] = useState(false);
  const intl = useIntl();
  const queueRef = useRef(operationQueue);
  const processedRef = useRef(processedDatabase);
  const navigate = useNavigate();
  queueRef.current = operationQueue;
  processedRef.current = processedDatabase;

  // async function loadHubs() {
  //   const resp = await fetch(
  //     "https://api.github.com/search/repositories?q=topic:songihub"
  //   );
  //   const json = await resp.json();
  //   console.log("HUBS", json);
  // }

  // useEffect(() => {
  //   loadHubs();
  // }, []);

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

  const localDbFileQuery = useQuery<LocalFileDatabase[]>({
    queryKey: ["localFileDatabases", localDbToken],
    queryFn: findFileDatabases,
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
          await deleteSongDb(db.id);
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

  async function deleteFileDatabase(id: number) {
    setIsWorking(true);
    await deleteFileDb(id);
    setLocalDbToken((x) => x + 1);
    setIsWorking(false);
  }

  async function activateFileDatabase(db: LocalFileDatabase) {
    setIsWorking(true);
    await convertDbFromFileToCloud(db);
    setLocalDbToken((x) => x + 1);
    setIsWorking(false);
  }

  async function deactivateFileDatabase(db: LocalFileDatabase) {
    setIsWorking(true);
    await deleteSongDb(String(db.id));
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
              {
                text: intl.formatMessage({
                  id: "create-own-database",
                  defaultMessage: "Create own database",
                }),
                onClick: () => setNewDbOpen(true),
              },
            ]
      }
    >
      <FreeSpaceProgressBar live={isWorking || !!processedDatabase} />

      {isWorking || localDbQuery.isPending || localDbFileQuery.isPending ? (
        <CircularProgress />
      ) : remoteDbQuery.error ? (
        <Alert severity="error">{remoteDbQuery.error.message}</Alert>
      ) : localDbQuery.error ? (
        <Alert severity="error">{localDbQuery.error.message}</Alert>
      ) : (
        <List>
          {_.uniqBy(
            [
              ...(localDbFileQuery.data as any),
              ...localDbQuery.data,
              ...(remoteDbQuery.data ? remoteDbQuery.data.databases : []),
            ],
            (x) => String(x.id)
          ).map((db) => (
            <DatabaseItem
              key={db.id}
              db={db}
              localDb={localDbQuery.data.find((x) => x.id == db.id)}
              localFileDb={localDbFileQuery.data!.find((x) => x.id == db.id)}
              deleteDatabase={deleteDatabase}
              deleteFileDatabase={deleteFileDatabase}
              downloadDatabase={downloadDatabase}
              cancelWaiting={cancelWaiting}
              isProcessed={processedDatabase == db.id}
              isFinished={finishedDatabases.includes(db.id)}
              isWaiting={!!operationQueue.find((x) => x.db.id == db.id)}
              activateFileDatabase={activateFileDatabase}
              deactivateFileDatabase={deactivateFileDatabase}
              setActiveDb={async (dbid, value) => {
                try {
                  setIsWorking(true);
                  await setLocalDbActive(String(dbid), value);
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

      {newDbOpen && <NewDatabaseDialog onClose={() => setNewDbOpen(false)} />}
    </PageLayout>
  );
}
