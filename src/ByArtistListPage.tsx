import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { addRecentArtist, findSongsByArtist, getArtist } from "./localdb";
import { Alert, CircularProgress, Grid, List } from "@mui/material";
import { LocalArtist, LocalSong } from "./types";
import { useParams } from "react-router-dom";
import SongListItem from "./SongListItem";
import BigListView from "./BigListView";
import { useEffect } from "react";
import _ from "lodash";

export default function ByArtistListPage() {
  const { dbid, artistid } = useParams();

  const artistFullId = `${dbid}/${artistid}`;

  const querySong = useQuery<LocalSong[]>({
    queryKey: ["songs-by-artist", artistFullId],
    queryFn: () => findSongsByArtist(artistFullId!),
    networkMode: "always",
  });

  const queryArtist = useQuery<LocalArtist | undefined>({
    queryKey: ["artist-by-id", artistFullId],
    queryFn: () => getArtist(artistFullId!),
    networkMode: "always",
  });

  useEffect(() => {
    if (queryArtist.data) {
      addRecentArtist(queryArtist.data);
    }
  }, [queryArtist.data]);

  return (
    <PageLayout
      title={
        queryArtist.data
          ? `${
              queryArtist.data?.name
            } (${queryArtist.data.databaseTitle?.toLocaleLowerCase()})`
          : _.startCase(artistid)
      }
      showBack
    >
      {querySong.isPending ? (
        <CircularProgress />
      ) : querySong.error ? (
        <Alert severity="error">{querySong.error.message}</Alert>
      ) : (
        <BigListView
          array={querySong.data}
          factory={(song, showIcon) => (
            <SongListItem song={song} key={song.id} showIcon={showIcon} />
          )}
          extractKey={(song) => song.id}
          extractTitle={(song) => song.title}
        />
      )}
    </PageLayout>
  );
}
