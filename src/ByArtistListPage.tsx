import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { addRecentArtist, findSongsByArtist, getArtist } from "./localdb";
import { Alert, CircularProgress, Grid, List } from "@mui/material";
import { LocalArtist, LocalSong } from "./types";
import { useParams } from "react-router-dom";
import SongListItem from "./SongListItem";
import BigListView from "./BigListView";
import { useEffect } from "react";

export default function ByArtistListPage() {
  const { artistid } = useParams();

  const querySong = useQuery<LocalSong[]>({
    queryKey: ["songs-by-artist", artistid],
    queryFn: () => findSongsByArtist(artistid!),
    networkMode: "always",
  });

  const queryArtist = useQuery<LocalArtist | undefined>({
    queryKey: ["artist-by-id", artistid],
    queryFn: () => getArtist(artistid!),
    networkMode: "always",
  });

  useEffect(() => {
    if (queryArtist.data) {
      addRecentArtist(queryArtist.data);
    }
  }, [queryArtist.data]);

  return (
    <PageLayout title={queryArtist.data?.name ?? "Loading..."} showBack>
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
