import { useQuery } from "@tanstack/react-query";
import PageLayout from "./PageLayout";
import { findSongsByArtist } from "./localdb";
import { Alert, CircularProgress, Grid, List } from "@mui/material";
import { LocalSong } from "./types";
import { useParams } from "react-router-dom";
import SongListItem from "./SongListItem";
import BigListView from "./BigListView";

export default function ByArtistListPage() {
  const { artist } = useParams();

  const query = useQuery<LocalSong[]>({
    queryKey: ["songs-by-artist", artist],
    queryFn: () => findSongsByArtist(artist!),
    networkMode: "always",
  });

  return (
    <PageLayout title={artist} showBack>
      {query.isPending ? (
        <CircularProgress />
      ) : query.error ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : (
        <BigListView
          array={query.data}
          factory={(song, showIcon) => (
            <SongListItem song={song} key={song.id} showIcon={showIcon} />
          )}
          extractKey={(song) => song.isActive}
          extractTitle={(song) => song.title}
        />
      )}
    </PageLayout>
  );
}
