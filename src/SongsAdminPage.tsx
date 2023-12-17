import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import {
  deleteSongsFromLocalDb,
  findSongsByDatabase,
  getLocalFileDatabase,
} from "./localdb";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { LocalFileDatabase, LocalSong } from "./types";
import { useNavigate, useParams } from "react-router-dom";
import { Dispatch, SetStateAction, useState } from "react";
import _ from "lodash";
import { FormattedMessage, useIntl } from "react-intl";

function SongItem(props: {
  song: LocalSong;
  checkedSongs: LocalSong[];
  setCheckedSongs: Dispatch<SetStateAction<LocalSong[]>>;
}) {
  const { song, checkedSongs, setCheckedSongs } = props;
  // const { artist } = parseSongParts(song.source);

  return (
    <ListItemButton
      key={song.id}
      onClick={() => {
        if (checkedSongs.find((x) => x.id == song.id)) {
          setCheckedSongs((x) => x.filter((y) => y.id !== song.id));
        } else {
          setCheckedSongs((x) => [...x, song]);
        }
      }}
    >
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={!!checkedSongs.find((x) => x.id == song.id)}
          tabIndex={-1}
          disableRipple
          //   onChange={(e) => {
          //     if (e.target.checked) {
          //       setCheckedSongs((x) => [...x, song.id]);
          //     } else {
          //       setCheckedSongs((x) => x.filter((y) => y !== song.id));
          //     }
          //   }}
        />
      </ListItemIcon>
      <ListItemText primary={song.title} secondary={song.artist} />
    </ListItemButton>
  );
}

export default function SongsAdminPage() {
  const { dbid } = useParams();
  const intl = useIntl();
  const [checkedSongs, setCheckedSongs] = useState<LocalSong[]>([]);
  const navigate = useNavigate();

  const querySongs = useQuery<LocalSong[]>({
    queryKey: ["songs-by-db", dbid],
    queryFn: () => findSongsByDatabase(dbid!),
    networkMode: "always",
  });

  const queryDb = useQuery<LocalFileDatabase | undefined>({
    queryKey: ["local-db-by-id", dbid],
    queryFn: () => getLocalFileDatabase(parseInt(dbid!)),
    networkMode: "always",
  });

  const handleDelete = async () => {
    if (
      window.confirm(
        intl.formatMessage(
          {
            id: "really-delete-songs",
            defaultMessage: "Really delete {songs} songs?",
          },
          { songs: checkedSongs.length }
        )
      )
    ) {
      const db = await getLocalFileDatabase(parseInt(dbid!));
      await deleteSongsFromLocalDb(
        db?.id!,
        checkedSongs.map((x) => x.id)
      );
      querySongs.refetch();
    }
  };

  return (
    <PageLayout
      title={
        queryDb?.data?.title ??
        intl.formatMessage({ id: "loading", defaultMessage: "Loading" })
      }
      showBack
      headerButtons={
        <>
          <Button
            color="inherit"
            disabled={checkedSongs.length != 1}
            onClick={() => navigate(`/songs/${checkedSongs[0].id}`)}
          >
            <FormattedMessage id="show" defaultMessage="Show" />
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate(`/local/songs/add/${dbid}`)}
          >
            <FormattedMessage id="add" defaultMessage="Add" />
          </Button>
          <Button
            color="inherit"
            disabled={checkedSongs.length == 0}
            onClick={() =>
              navigate(
                `/local/songs/edit/${dbid}/${encodeURIComponent(
                  checkedSongs.map((x) => x.id).join(",")
                )}`
              )
            }
          >
            <FormattedMessage id="edit" defaultMessage="Edit" />
          </Button>
          <Button
            color="inherit"
            disabled={checkedSongs.length == 0}
            onClick={handleDelete}
          >
            <FormattedMessage id="delete" defaultMessage="Delete" />
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate(`/local/edit/${dbid}`)}
          >
            <FormattedMessage id="all" defaultMessage="All" />
          </Button>
        </>
      }
    >
      {querySongs.isPending ? (
        <CircularProgress />
      ) : querySongs.error ? (
        <Alert severity="error">{querySongs.error.message}</Alert>
      ) : (
        <List>
          {querySongs.data.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              checkedSongs={checkedSongs}
              setCheckedSongs={setCheckedSongs}
            />
          ))}
        </List>
      )}
    </PageLayout>
  );
}
